import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AppType, BuildPlan } from '../types.js';

export interface RepairBuildFailureInput {
  projectDir: string;
  appType: AppType;
  buildErrorOutput: string;
  buildPlan: BuildPlan;
}

export interface RepairBuildFailureResult {
  attempted: boolean;
  succeeded: boolean;
  summary: string;
}

const BROKEN_IMPORT_PATTERN =
  /import\s+\{\s*brokenFaultInjection\s*\}\s+from\s+['"]\.\/__broken_fault_injection__['"];?\s*\n?/;

function isBrokenImportBuildError(buildErrorOutput: string): boolean {
  return (
    buildErrorOutput.includes('__broken_fault_injection__') ||
    buildErrorOutput.includes('brokenFaultInjection')
  );
}

export function repairBuildFailure(input: RepairBuildFailureInput): RepairBuildFailureResult {
  const { projectDir, appType, buildErrorOutput } = input;

  if (appType !== 'calculator') {
    return {
      attempted: false,
      succeeded: false,
      summary: 'No repair available for this app type',
    };
  }

  if (!isBrokenImportBuildError(buildErrorOutput)) {
    return {
      attempted: false,
      succeeded: false,
      summary: 'Build error does not match known broken import fault',
    };
  }

  const appTsxPath = join(projectDir, 'src', 'App.tsx');
  if (!existsSync(appTsxPath)) {
    return {
      attempted: true,
      succeeded: false,
      summary: 'Repair failed: src/App.tsx not found',
    };
  }

  const content = readFileSync(appTsxPath, 'utf8');
  if (!BROKEN_IMPORT_PATTERN.test(content)) {
    return {
      attempted: true,
      succeeded: false,
      summary: 'Repair failed: broken import not present in src/App.tsx',
    };
  }

  const fixed = content.replace(BROKEN_IMPORT_PATTERN, '');
  if (fixed === content) {
    return {
      attempted: true,
      succeeded: false,
      summary: 'Repair failed: could not remove broken import from src/App.tsx',
    };
  }

  writeFileSync(appTsxPath, fixed, 'utf8');

  return {
    attempted: true,
    succeeded: true,
    summary: 'Removed broken test import from src/App.tsx',
  };
}
