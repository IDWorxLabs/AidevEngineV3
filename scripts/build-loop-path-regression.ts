/**
 * Build Loop Engine regression — verifies end-to-end execution stages.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { runArchitectureGuidedGenerationRegression } from './architecture-guided-generation-path-regression.js';
import { runFeatureRealityEngineRegression } from './feature-reality-engine-path-regression.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';
import { GENERIC_PROTOTYPE_PROMPT } from './generic-prototype-path-regression.js';

const PASS_TOKEN = 'BUILD_LOOP_ENGINE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'src/feature-reality/',
  'src/build-loop/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = ['LISA', 'WeatherDisplay', 'CountDisplay', 'TaskInput'];

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

function collectSourceFiles(dir: string, root: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.generated') continue;
      files.push(...collectSourceFiles(fullPath, root));
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(relative(root, fullPath).replace(/\\/g, '/'));
    }
  }

  return files;
}

function isApprovedHardcodingPath(filePath: string): boolean {
  return APPROVED_HARDCODING_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

function assertNoForbiddenHardcoding(): void {
  const srcRoot = join(process.cwd(), 'src');
  const sourceFiles = collectSourceFiles(srcRoot, srcRoot).map((file) => `src/${file}`);

  for (const filePath of sourceFiles) {
    if (isApprovedHardcodingPath(filePath)) continue;

    const content = readFileSync(join(process.cwd(), filePath), 'utf8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (content.includes(pattern)) {
        fail('no application-specific hardcoding', `${pattern} in ${filePath}`);
      }
    }
  }

  if (!failures.some((f) => f.startsWith('no application-specific'))) {
    pass('no application-specific hardcoding');
  }
}

function assertBuildLoopReport(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  reportText: string,
  label: string,
  expectPreview: boolean,
): void {
  const loop = report.buildLoop;

  if (loop) pass(`${label}: BuildLoopReport populated`);
  else fail(`${label}: BuildLoopReport populated`);

  if (reportText.includes('──────── Build Loop ────────')) {
    pass(`${label}: report text includes Build Loop section`);
  } else {
    fail(`${label}: report text includes Build Loop section`);
  }

  if (loop?.workspaceGenerated) pass(`${label}: workspace generation executed`);
  else fail(`${label}: workspace generation executed`);

  if (loop?.dependenciesInstalled) pass(`${label}: dependencies installed`);
  else fail(`${label}: dependencies installed`);

  if (loop?.installSucceeded) pass(`${label}: install succeeded`);
  else fail(`${label}: install succeeded`);

  if (loop?.buildSucceeded) pass(`${label}: build executed`);
  else fail(`${label}: build executed`);

  if (expectPreview) {
    if (loop?.previewStarted) pass(`${label}: preview started`);
    else fail(`${label}: preview started`);

    if (loop?.previewVerified) pass(`${label}: preview verified`);
    else fail(`${label}: preview verified`);

    if (loop?.previewUrl) pass(`${label}: preview URL present`);
    else fail(`${label}: preview URL present`);
  }

  if (loop && (loop.status === 'PASS' || loop.status === 'WARN')) {
    pass(`${label}: build loop verdict ${loop.status}`);
  } else {
    fail(`${label}: build loop verdict`, loop?.status ?? 'missing');
  }

  if (loop && loop.stageResults.length >= 3) {
    pass(`${label}: stage evidence recorded (${loop.stageResults.length} stages)`);
  } else {
    fail(`${label}: stage evidence recorded`);
  }
}

function assertWebUiContainsPanel(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('Build Loop')) {
    pass('web UI: index.html contains Build Loop panel');
  } else {
    fail('web UI: index.html contains Build Loop panel');
  }

  if (appJs.includes('renderBuildLoop')) {
    pass('web UI: app.js renders build loop');
  } else {
    fail('web UI: app.js renders build loop');
  }
}

export async function runBuildLoopRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nBuild Loop Engine regression\n');

  console.log('── End-to-end builds ──\n');

  const calculatorReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT });
  assertBuildLoopReport(
    calculatorReport,
    formatBuildReport(calculatorReport),
    'calculator',
    true,
  );

  const counterReport = await buildFromPrompt({ prompt: COUNTER_PATH_PROMPT });
  assertBuildLoopReport(counterReport, formatBuildReport(counterReport), 'counter', true);

  const todoReport = await buildFromPrompt({ prompt: TODO_PATH_PROMPT });
  assertBuildLoopReport(todoReport, formatBuildReport(todoReport), 'todo', true);

  const weatherReport = await buildFromPrompt({ prompt: GENERIC_PROTOTYPE_PROMPT });
  assertBuildLoopReport(
    weatherReport,
    formatBuildReport(weatherReport),
    'weather',
    true,
  );

  if (calculatorReport.ok && existsSync(calculatorReport.projectDir)) {
    pass('calculator: full pipeline ok with workspace on disk');
  } else {
    fail('calculator: full pipeline ok with workspace on disk');
  }

  console.log('\n── Static checks ──\n');

  assertWebUiContainsPanel();
  assertNoForbiddenHardcoding();

  console.log('\n── Previous validators still pass ──\n');

  const archOk = await runArchitectureGuidedGenerationRegression();
  if (archOk) pass('architecture-guided generation still passes');
  else fail('architecture-guided generation still passes');

  const featureOk = await runFeatureRealityEngineRegression();
  if (featureOk) pass('feature reality engine still passes');
  else fail('feature reality engine still passes');

  console.log('');
  if (failures.length === 0) {
    console.log(`PASSED\n${PASS_TOKEN}\n`);
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
