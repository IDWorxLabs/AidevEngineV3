/**
 * Real Preview Verification regression — proves generated apps render in a browser.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { runRealPreviewVerification } from '../src/testing/real-preview-runner.js';
import {
  REAL_APP_TRIAL_SUITE,
  formatRealAppTrialSummary,
  runRealAppTrialHarness,
} from '../src/testing/real-app-trial-harness.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';

const PASS_TOKEN = 'REAL_PREVIEW_VERIFICATION_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'src/feature-reality/',
  'src/build-loop/',
  'src/testing/',
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

function assertWebUiPanel(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('Preview Verification')) {
    pass('web UI: Preview Verification panel exists');
  } else {
    fail('web UI: Preview Verification panel exists');
  }

  if (appJs.includes('renderPreviewVerification')) {
    pass('web UI: renderPreviewVerification implemented');
  } else {
    fail('web UI: renderPreviewVerification implemented');
  }
}

function assertPreviewReport(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  reportText: string,
  label: string,
): void {
  const verification = report.previewVerification;
  if (!verification) {
    fail(`${label}: previewVerification in report`);
    return;
  }

  pass(`${label}: previewVerification in report`);

  if (reportText.includes('──────── Preview Verification ────────')) {
    pass(`${label}: Preview Verification section in report text`);
  } else {
    fail(`${label}: Preview Verification section in report text`);
  }

  if (verification.previewStarted) pass(`${label}: preview started`);
  else fail(`${label}: preview started`);

  if (verification.previewUrl) pass(`${label}: preview URL recorded`);
  else fail(`${label}: preview URL recorded`);

  if (verification.httpReachable) pass(`${label}: HTTP reachable`);
  else fail(`${label}: HTTP reachable`, verification.warnings.join('; '));

  if (verification.htmlLoaded) pass(`${label}: HTML loaded`);
  else fail(`${label}: HTML loaded`);

  if (verification.applicationRendered) pass(`${label}: application rendered`);
  else fail(`${label}: application rendered`, verification.warnings.join('; '));

  if (verification.evidence.length > 0) pass(`${label}: deterministic evidence recorded`);
  else fail(`${label}: deterministic evidence recorded`);

  if (verification.status === 'PASS' || verification.status === 'WARN') {
    pass(`${label}: preview status ${verification.status}`);
  } else {
    fail(`${label}: preview status acceptable`, verification.status);
  }
}

export async function runRealPreviewVerificationRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nReal Preview Verification regression\n');

  console.log('── Preview runner (supported apps) ──\n');

  for (const [label, prompt] of [
    ['calculator', GOLDEN_PATH_PROMPT],
    ['counter', COUNTER_PATH_PROMPT],
    ['todo', TODO_PATH_PROMPT],
  ] as const) {
    const report = await buildFromPrompt({ prompt, skipPreview: false });
    const reportText = formatBuildReport(report);
    assertPreviewReport(report, reportText, label);
  }

  console.log('\n── Standalone runner module ──\n');

  const standaloneReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT, skipPreview: false });
  const standaloneVerification = await runRealPreviewVerification({
    projectDir: standaloneReport.projectDir,
    previewUrl: standaloneReport.previewUrl,
    previewStarted: true,
    skipPreview: false,
  });

  if (standaloneVerification.httpReachable) pass('runner: HTTP endpoint reachable');
  else fail('runner: HTTP endpoint reachable');

  if (standaloneVerification.htmlLoaded) pass('runner: HTML returned');
  else fail('runner: HTML returned');

  if (standaloneVerification.applicationRendered) pass('runner: React application rendered');
  else fail('runner: React application rendered');

  console.log('\n── Trial harness with real preview (10 applications) ──\n');

  const suite = await runRealAppTrialHarness({ skipPreview: false, prompts: REAL_APP_TRIAL_SUITE });
  const summaryText = formatRealAppTrialSummary(suite);

  console.log(summaryText);
  console.log('');

  if (summaryText.includes('Preview Passed:')) pass('trial summary includes Preview Passed');
  else fail('trial summary includes Preview Passed');

  if (summaryText.includes('Preview Warned:')) pass('trial summary includes Preview Warned');
  else fail('trial summary includes Preview Warned');

  if (summaryText.includes('Preview Failed:')) pass('trial summary includes Preview Failed');
  else fail('trial summary includes Preview Failed');

  for (const result of suite.results) {
    const label = result.applicationType;

    if (result.previewVerification) pass(`${label}: preview verification attached`);
    else fail(`${label}: preview verification attached`);

    if (result.previewVerificationStatus === 'PASS' || result.previewVerificationStatus === 'WARN') {
      pass(`${label}: preview verification ${result.previewVerificationStatus}`);
    } else {
      fail(`${label}: preview verification acceptable`, result.previewVerificationStatus);
    }

    if (result.buildSucceeded) pass(`${label}: build evidence recorded`);
    else fail(`${label}: build evidence recorded`);

    if (result.verdict !== 'FAIL') pass(`${label}: final verdict ${result.verdict}`);
    else fail(`${label}: final verdict acceptable`, result.verdict);
  }

  const previewNonFail = suite.results.filter((result) => result.previewVerificationStatus !== 'FAIL').length;
  if (previewNonFail === suite.results.length) {
    pass(`all ${suite.results.length} trials have preview PASS/WARN`);
  } else {
    fail('all trials have preview PASS/WARN', `${previewNonFail}/${suite.results.length}`);
  }

  console.log('\n── Static checks ──\n');

  if (existsSync(join(process.cwd(), 'src', 'testing', 'real-preview-runner.ts'))) {
    pass('real-preview-runner module exists');
  } else {
    fail('real-preview-runner module exists');
  }

  if (existsSync(join(process.cwd(), 'src', 'testing', 'preview-verification-types.ts'))) {
    pass('preview-verification-types module exists');
  } else {
    fail('preview-verification-types module exists');
  }

  assertWebUiPanel();
  assertNoForbiddenHardcoding();

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
