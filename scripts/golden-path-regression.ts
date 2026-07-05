/**
 * Frozen golden path regression — proves only the working build pipeline.
 * Prompt: "Build a calculator app"
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { assertBuildPlan } from './regression-build-plan.js';
import { assertGeneratedAppUsesPlanAppName } from './regression-generated-app.js';
import { assertUnderstanding } from './regression-understanding.js';
import { assertGenerationMode } from './regression-generation-mode.js';
import { assertArchitecture } from './regression-architecture.js';

export const GOLDEN_PATH_PROMPT = 'Build a calculator app';

const REQUIRED_ROOT_FILES = ['package.json', 'index.html', 'vite.config.ts', 'tsconfig.json'] as const;
const REQUIRED_SRC_FILES = ['src/main.tsx', 'src/App.tsx', 'src/index.css'] as const;

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

async function verifyPreview(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

function assertReportText(reportText: string, report: Awaited<ReturnType<typeof buildFromPrompt>>): void {
  const checks: Array<[string, boolean]> = [
    ['report includes status', /Status:\s+(SUCCESS|FAILED)/.test(reportText)],
    ['report includes duration', /Duration:\s+\d/.test(reportText)],
    ['report includes project path', reportText.includes(report.projectDir)],
    ['report includes file list', report.generatedFiles.every((f) => reportText.includes(f))],
    ['report includes install result', /npm install:\s+(OK|FAIL)/.test(reportText)],
    ['report includes build result', /npm build:\s+(OK|FAIL)/.test(reportText)],
    ['report includes preview URL', report.previewUrl ? reportText.includes(report.previewUrl) : false],
  ];

  for (const [label, ok] of checks) {
    if (ok) pass(label);
    else fail(label);
  }
}

export async function runGoldenPathRegression(): Promise<boolean> {
  failures.length = 0;
  console.log(`\nGolden path regression: "${GOLDEN_PATH_PROMPT}"\n`);

  const report = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT });
  const reportText = formatBuildReport(report);

  console.log(reportText);
  console.log('\n── Assertions ──\n');

  // 1. Project folder created
  if (existsSync(report.projectDir)) {
    pass('1. project folder created');
  } else {
    fail('1. project folder created', report.projectDir);
  }

  // 2. Required generated files on disk
  for (const file of REQUIRED_ROOT_FILES) {
    const path = join(report.projectDir, file);
    if (existsSync(path)) pass(`2. contains ${file}`);
    else fail(`2. contains ${file}`, 'missing on disk');
  }

  for (const file of REQUIRED_SRC_FILES) {
    const path = join(report.projectDir, file);
    if (existsSync(path)) pass(`2. contains ${file}`);
    else fail(`2. contains ${file}`, 'missing on disk');
  }

  // 3. npm install succeeded
  if (report.installOk) pass('3. npm install succeeded');
  else fail('3. npm install succeeded', report.error ?? 'installOk is false');

  // 4. npm run build succeeded
  if (report.buildOk) pass('4. npm run build succeeded');
  else fail('4. npm run build succeeded', report.error ?? 'buildOk is false');

  // 5. Live preview URL reachable
  if (report.previewUrl) {
    const reachable = await verifyPreview(report.previewUrl);
    if (reachable) pass(`5. preview URL reachable (${report.previewUrl})`);
    else fail('5. preview URL reachable', report.previewUrl);
  } else {
    fail('5. preview URL reachable', 'no preview URL in report');
  }

  // 6. Final report includes required fields
  assertReportText(reportText, report);

  assertUnderstanding(
    report,
    reportText,
    { expectSupported: true, expectMatchedAppType: 'calculator', minConfidence: 0.95 },
    pass,
    fail,
  );

  assertGenerationMode(report, reportText, 'specialized-template', pass, fail);

  assertArchitecture(
    report,
    reportText,
    {
      expectProjectType: 'Calculator utility application',
      expectStack: ['Vite', 'React', 'TypeScript'],
      expectPages: ['Calculator'],
    },
    pass,
    fail,
  );

  // 7. Build plan present
  assertBuildPlan(report, reportText, 'calculator', pass, fail);
  assertGeneratedAppUsesPlanAppName(report, pass, fail);

  console.log('');
  if (failures.length === 0) {
    const total =
      1 +
      REQUIRED_ROOT_FILES.length +
      REQUIRED_SRC_FILES.length +
      3 +
      7 +
      10 +
      1;
    console.log(`PASSED (${total} checks)\n`);
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
