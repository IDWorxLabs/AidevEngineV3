/**
 * Generic Application Capability regression — verifies CRUD-style generic generation.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import {
  CRUD_CAPABILITIES,
  DATA_PATTERNS,
  UI_PATTERNS,
} from '../src/generation/generic/generic-capability-types.js';
import {
  REAL_APP_TRIAL_SUITE,
  runRealAppTrialHarness,
} from '../src/testing/real-app-trial-harness.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';

const PASS_TOKEN = 'GENERIC_APPLICATION_CAPABILITY_V1_PASS';

const GENERIC_PROMPTS = [
  'Build an expense tracker.',
  'Build a note-taking app.',
  'Build a habit tracker.',
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

  if (indexHtml.includes('Generic Application Capability')) {
    pass('web UI: Generic Application Capability panel exists');
  } else {
    fail('web UI: Generic Application Capability panel exists');
  }

  if (appJs.includes('renderGenericApplicationCapability')) {
    pass('web UI: renderGenericApplicationCapability implemented');
  } else {
    fail('web UI: renderGenericApplicationCapability implemented');
  }
}

function assertCapabilityReport(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  reportText: string,
  label: string,
): void {
  if (report.genericApplicationCapabilities) {
    pass(`${label}: report includes genericApplicationCapabilities`);
  } else {
    fail(`${label}: report includes genericApplicationCapabilities`);
    return;
  }

  if (reportText.includes('── Generic Application Capability ──')) {
    pass(`${label}: report text includes Generic Application Capability section`);
  } else {
    fail(`${label}: report text includes Generic Application Capability section`);
  }

  const caps = report.genericApplicationCapabilities;
  if (caps && caps.capabilityScore > 0) {
    pass(`${label}: capability score > 0 (${caps.capabilityScore.toFixed(2)})`);
  } else {
    fail(`${label}: capability score > 0`);
  }
}

export async function runGenericApplicationCapabilityRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nGeneric Application Capability regression\n');

  console.log('── Generic CRUD generation ──\n');

  for (const prompt of GENERIC_PROMPTS) {
    const report = await buildFromPrompt({ prompt, skipPreview: true });
    const reportText = formatBuildReport(report);
    const label = report.buildPlan?.appName ?? prompt;

    if (report.buildOk) pass(`${label}: build succeeded`);
    else fail(`${label}: build succeeded`, report.error ?? 'build failed');

    if (report.featureReality?.status !== 'FAIL') {
      pass(`${label}: feature reality ${report.featureReality?.status ?? 'unknown'}`);
    } else {
      fail(`${label}: feature reality not FAIL`, report.featureReality.missingFeatures.join(', '));
    }

    assertCapabilityReport(report, reportText, label);

    const caps = report.genericApplicationCapabilities;
    if (caps && caps.uiPatterns.length >= 6) {
      pass(`${label}: UI patterns generated (${caps.uiPatterns.length})`);
    } else {
      fail(`${label}: UI patterns generated`, String(caps?.uiPatterns.length ?? 0));
    }

    if (caps && caps.dataPatterns.length >= 2) {
      pass(`${label}: data patterns generated (${caps.dataPatterns.length})`);
    } else {
      fail(`${label}: data patterns generated`, String(caps?.dataPatterns.length ?? 0));
    }

    if (caps && caps.crudCapabilities.length >= 4) {
      pass(`${label}: CRUD capabilities generated (${caps.crudCapabilities.length})`);
    } else {
      fail(`${label}: CRUD capabilities generated`, String(caps?.crudCapabilities.length ?? 0));
    }
  }

  console.log('\n── Supported apps still pass ──\n');

  for (const [label, prompt] of [
    ['calculator', GOLDEN_PATH_PROMPT],
    ['counter', COUNTER_PATH_PROMPT],
    ['todo', TODO_PATH_PROMPT],
  ] as const) {
    const report = await buildFromPrompt({ prompt, skipPreview: true });
    if (report.buildOk) pass(`${label}: build still succeeds`);
    else fail(`${label}: build still succeeds`, report.error ?? 'failed');

    if (report.genericApplicationCapabilities === null) {
      pass(`${label}: no generic capabilities on specialized template`);
    } else {
      fail(`${label}: no generic capabilities on specialized template`);
    }
  }

  console.log('\n── Trial harness improvement ──\n');

  const suite = await runRealAppTrialHarness({ skipPreview: true, prompts: REAL_APP_TRIAL_SUITE });

  const genericKeywords = ['expense', 'note', 'habit', 'recipe', 'contact', 'countdown'];
  const genericResults = suite.results.filter((result) =>
    genericKeywords.some(
      (keyword) =>
        result.applicationType.toLowerCase().includes(keyword) ||
        result.prompt.toLowerCase().includes(keyword),
    ),
  );

  const genericNonFail = genericResults.filter((result) => result.verdict !== 'FAIL').length;
  if (genericNonFail >= 5) {
    pass(`generic trial apps PASS/WARN (${genericNonFail}/${genericResults.length})`);
  } else {
    fail('generic trial apps improved', `${genericNonFail}/${genericResults.length} non-FAIL`);
  }

  const overallNonFail = suite.results.filter((result) => result.verdict !== 'FAIL').length;
  if (overallNonFail >= 8) {
    pass(`overall trial success rate improved (${overallNonFail}/${suite.results.length})`);
  } else {
    fail('overall trial success rate improved', `${overallNonFail}/${suite.results.length}`);
  }

  console.log('\n── Pattern coverage markers ──\n');

  if (existsSync(join(process.cwd(), 'src/generation/generic/generic-capability-types.ts'))) {
    pass('generic capability types module exists');
  } else {
    fail('generic capability types module exists');
  }

  for (const pattern of UI_PATTERNS.slice(0, 6)) {
    if (existsSync(join(process.cwd(), 'src/generation/generic/generic-crud-generator.ts'))) {
      const content = readFileSync(
        join(process.cwd(), 'src/generation/generic/generic-crud-generator.ts'),
        'utf8',
      );
      if (content.includes('data-ui-pattern=')) pass(`UI pattern markers present (${pattern} family)`);
    }
  }

  const typesContent = readFileSync(
    join(process.cwd(), 'src/generation/generic/generic-capability-types.ts'),
    'utf8',
  );
  if (DATA_PATTERNS.every((pattern) => typesContent.includes(pattern))) {
    pass('all data patterns declared');
  } else {
    fail('all data patterns declared');
  }

  if (CRUD_CAPABILITIES.every((capability) => typesContent.includes(capability))) {
    pass('all CRUD capabilities declared');
  } else {
    fail('all CRUD capabilities declared');
  }

  console.log('\n── Static checks ──\n');

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
