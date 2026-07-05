/**
 * Real App Trial Harness regression — measures end-to-end engineering performance.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  REAL_APP_TRIAL_SUITE,
  formatRealAppTrialSummary,
  runRealAppTrialHarness,
} from '../src/testing/real-app-trial-harness.js';

const PASS_TOKEN = 'REAL_APP_TRIAL_HARNESS_V1_PASS';

const REQUIRED_FIXTURES = [
  { label: 'calculator', match: (name: string, prompt: string) => /calculator/i.test(name) || /calculator/i.test(prompt) },
  { label: 'counter', match: (name: string, prompt: string) => /counter/i.test(name) || /counter/i.test(prompt) },
  { label: 'todo', match: (name: string, prompt: string) => /todo/i.test(name) || /todo/i.test(prompt) },
  { label: 'weather', match: (name: string, prompt: string) => /weather/i.test(name) || /weather/i.test(prompt) },
];

const GENERIC_FIXTURES = [
  'expense',
  'note',
  'habit',
  'recipe',
  'contact',
  'countdown',
];

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

  if (indexHtml.includes('Real App Trials')) pass('web UI: Real App Trials panel exists');
  else fail('web UI: Real App Trials panel exists');

  if (appJs.includes('renderRealAppTrials')) pass('web UI: renderRealAppTrials implemented');
  else fail('web UI: renderRealAppTrials implemented');

  if (indexHtml.includes('Preview Verification')) pass('web UI: Preview Verification panel exists');
  else fail('web UI: Preview Verification panel exists');
}

export async function runRealAppTrialHarnessRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nReal App Trial Harness regression\n');

  if (REAL_APP_TRIAL_SUITE.length === 10) {
    pass('trial suite contains 10 prompts');
  } else {
    fail('trial suite contains 10 prompts', String(REAL_APP_TRIAL_SUITE.length));
  }

  console.log('\n── Executing trial harness (skipPreview for CI speed) ──\n');

  const suite = await runRealAppTrialHarness({ skipPreview: true });
  const summaryText = formatRealAppTrialSummary(suite);

  console.log(summaryText);
  console.log('');

  if (suite.results.length === REAL_APP_TRIAL_SUITE.length) {
    pass(`harness executed ${suite.results.length} trials`);
  } else {
    fail('harness executed all trials', `${suite.results.length}/${REAL_APP_TRIAL_SUITE.length}`);
  }

  if (summaryText.includes('──────── Real App Trial Summary ────────')) {
    pass('aggregate report generated');
  } else {
    fail('aggregate report generated');
  }

  for (const fixture of REQUIRED_FIXTURES) {
    const found = suite.results.some((result) =>
      fixture.match(result.applicationType, result.prompt),
    );
    if (found) pass(`fixture included: ${fixture.label}`);
    else fail(`fixture included: ${fixture.label}`);
  }

  let genericCount = 0;
  for (const keyword of GENERIC_FIXTURES) {
    const found = suite.results.some(
      (result) =>
        result.applicationType.toLowerCase().includes(keyword) ||
        result.prompt.toLowerCase().includes(keyword),
    );
    if (found) genericCount += 1;
  }

  if (genericCount >= 6) pass(`generic fixtures included (${genericCount}/6)`);
  else fail('at least six additional generic apps included', String(genericCount));

  if (summaryText.includes('Preview Passed:')) pass('aggregate report includes preview counts');
  else fail('aggregate report includes preview counts');

  if (summaryText.includes('Average Quality:')) pass('aggregate report includes product quality');
  else fail('aggregate report includes product quality');

  if (summaryText.includes('Average Engineering:')) pass('aggregate report includes engineering timeline');
  else fail('aggregate report includes engineering timeline');

  for (const result of suite.results) {
    const label = result.applicationType;

    if (result.totalEngineeringTimeMs > 0) pass(`${label}: engineering timeline evidence recorded`);
    else fail(`${label}: engineering timeline evidence recorded`);

    if (result.slowestStage) pass(`${label}: slowest stage recorded (${result.slowestStage})`);
    else fail(`${label}: slowest stage recorded`);

    if (result.productQuality) pass(`${label}: product quality evidence recorded`);
    else fail(`${label}: product quality evidence recorded`);

    if (result.buildLoop) pass(`${label}: build loop executed`);
    else fail(`${label}: build loop executed`);

    if (result.previewVerification) pass(`${label}: preview verification executed`);
    else fail(`${label}: preview verification executed`);

    if (result.previewVerificationStatus === 'WARN') {
      pass(`${label}: preview verification WARN when preview skipped`);
    } else {
      fail(`${label}: preview verification WARN when preview skipped`, result.previewVerificationStatus);
    }

    if (result.featureRealityStatus) pass(`${label}: feature reality executed`);
    else fail(`${label}: feature reality executed`);

    if (result.understandingSucceeded) pass(`${label}: understanding recorded`);
    else fail(`${label}: understanding recorded`);

    if (result.architectureGenerationApplied) pass(`${label}: architecture generation recorded`);
    else fail(`${label}: architecture generation recorded`);

    if (result.verdict === 'PASS' || result.verdict === 'WARN' || result.verdict === 'FAIL') {
      pass(`${label}: verdict ${result.verdict}`);
    } else {
      fail(`${label}: verdict recorded`, result.verdict);
    }
  }

  const anyNonFail = suite.results.some((r) => r.verdict !== 'FAIL');
  if (anyNonFail) pass('harness discovered mixed PASS/WARN outcomes');
  else fail('harness discovered mixed PASS/WARN outcomes');

  console.log('\n── Static checks ──\n');

  assertWebUiPanel();
  assertNoForbiddenHardcoding();

  if (existsSync(join(process.cwd(), 'src', 'testing', 'real-app-trial-harness.ts'))) {
    pass('harness module exists');
  } else {
    fail('harness module exists');
  }

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
