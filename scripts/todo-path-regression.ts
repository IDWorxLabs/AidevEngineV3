/**
 * Todo path regression — same checks as golden path, for "Build a todo app".
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

export const TODO_PATH_PROMPT = 'Build a todo app';

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

export async function runTodoPathRegression(): Promise<boolean> {
  failures.length = 0;
  console.log(`\nTodo path regression: "${TODO_PATH_PROMPT}"\n`);

  const report = await buildFromPrompt({ prompt: TODO_PATH_PROMPT });
  const reportText = formatBuildReport(report);

  console.log(reportText);
  console.log('\n── Assertions ──\n');

  if (report.appType !== 'todo') {
    fail('0. app type is todo', `got "${report.appType}"`);
  } else {
    pass('0. app type is todo');
  }

  if (existsSync(report.projectDir)) {
    pass('1. project folder created');
  } else {
    fail('1. project folder created', report.projectDir);
  }

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

  if (report.installOk) pass('3. npm install succeeded');
  else fail('3. npm install succeeded', report.error ?? 'installOk is false');

  if (report.buildOk) pass('4. npm run build succeeded');
  else fail('4. npm run build succeeded', report.error ?? 'buildOk is false');

  if (report.previewUrl) {
    const reachable = await verifyPreview(report.previewUrl);
    if (reachable) pass(`5. preview URL reachable (${report.previewUrl})`);
    else fail('5. preview URL reachable', report.previewUrl);
  } else {
    fail('5. preview URL reachable', 'no preview URL in report');
  }

  assertReportText(reportText, report);
  assertUnderstanding(
    report,
    reportText,
    { expectSupported: true, expectMatchedAppType: 'todo', minConfidence: 0.95 },
    pass,
    fail,
  );
  assertGenerationMode(report, reportText, 'specialized-template', pass, fail);
  assertArchitecture(
    report,
    reportText,
    { expectProjectType: 'Todo list application', expectPages: ['Todo list'] },
    pass,
    fail,
  );
  assertBuildPlan(report, reportText, 'todo', pass, fail);
  assertGeneratedAppUsesPlanAppName(report, pass, fail);

  console.log('');
  if (failures.length === 0) {
    const total = 1 + 1 + REQUIRED_ROOT_FILES.length + REQUIRED_SRC_FILES.length + 3 + 7 + 10 + 1;
    console.log(`PASSED (${total} checks)\n`);
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
