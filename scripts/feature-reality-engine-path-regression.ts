/**
 * Feature Reality Engine regression — verifies features are proven in generated code.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { runArchitectureGuidedGenerationRegression } from './architecture-guided-generation-path-regression.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';
import { GENERIC_PROTOTYPE_PROMPT } from './generic-prototype-path-regression.js';

const PASS_TOKEN = 'FEATURE_REALITY_ENGINE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'src/feature-reality/',
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

function evidenceIncludes(evidence: string[], patterns: string[]): boolean {
  const combined = evidence.join('\n').toLowerCase();
  return patterns.every((pattern) => combined.includes(pattern.toLowerCase()));
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
        fail('no LISA-specific or fixture-only hardcoding', `${pattern} in ${filePath}`);
      }
    }
  }

  if (!failures.some((f) => f.startsWith('no LISA-specific'))) {
    pass('no LISA-specific or fixture-only hardcoding');
  }
}

function assertFeatureRealityReport(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  reportText: string,
  label: string,
): void {
  if (report.featureReality) pass(`${label}: report includes featureReality`);
  else fail(`${label}: report includes featureReality`);

  if (reportText.includes('── Feature Reality ──')) {
    pass(`${label}: report text includes Feature Reality section`);
  } else {
    fail(`${label}: report text includes Feature Reality section`);
  }
}

function assertWebUiContainsPanel(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('Feature Reality')) {
    pass('web UI: index.html contains Feature Reality panel');
  } else {
    fail('web UI: index.html contains Feature Reality panel');
  }

  if (appJs.includes('renderFeatureReality')) {
    pass('web UI: app.js renders feature reality');
  } else {
    fail('web UI: app.js renders feature reality');
  }
}

export async function runFeatureRealityEngineRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nFeature Reality Engine regression\n');

  console.log('── Supported apps ──\n');

  const calculatorReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT, skipPreview: true });
  const calculatorText = formatBuildReport(calculatorReport);
  assertFeatureRealityReport(calculatorReport, calculatorText, 'calculator');

  const calculatorEvidence = [
    ...(calculatorReport.featureReality?.generatedFeatureEvidence ?? []),
    ...(calculatorReport.featureReality?.renderedFeatureEvidence ?? []),
  ];
  if (evidenceIncludes(calculatorEvidence, ['display'])) pass('calculator: display evidence');
  else fail('calculator: display evidence');
  if (evidenceIncludes(calculatorEvidence, ['input']) || evidenceIncludes(calculatorEvidence, ['keypad'])) {
    pass('calculator: input evidence');
  } else {
    fail('calculator: input evidence');
  }
  if (
    evidenceIncludes(calculatorEvidence, ['arithmetic']) ||
    evidenceIncludes(calculatorEvidence, ['+']) ||
    evidenceIncludes(calculatorEvidence, ['evaluate'])
  ) {
    pass('calculator: calculation evidence');
  } else {
    fail('calculator: calculation evidence');
  }
  if (calculatorReport.featureReality?.status === 'PASS') {
    pass('calculator: feature reality status PASS');
  } else {
    fail('calculator: feature reality status PASS', calculatorReport.featureReality?.status);
  }

  const counterReport = await buildFromPrompt({ prompt: COUNTER_PATH_PROMPT, skipPreview: true });
  const counterText = formatBuildReport(counterReport);
  assertFeatureRealityReport(counterReport, counterText, 'counter');

  const counterEvidence = [
    ...(counterReport.featureReality?.generatedFeatureEvidence ?? []),
    ...(counterReport.featureReality?.renderedFeatureEvidence ?? []),
  ];
  if (evidenceIncludes(counterEvidence, ['count'])) pass('counter: count display evidence');
  else fail('counter: count display evidence');
  if (
    evidenceIncludes(counterEvidence, ['increment']) ||
    evidenceIncludes(counterEvidence, ['decrement']) ||
    evidenceIncludes(counterEvidence, ['control'])
  ) {
    pass('counter: increment/decrement control evidence');
  } else {
    fail('counter: increment/decrement control evidence');
  }

  const todoReport = await buildFromPrompt({ prompt: TODO_PATH_PROMPT, skipPreview: true });
  const todoText = formatBuildReport(todoReport);
  assertFeatureRealityReport(todoReport, todoText, 'todo');

  const todoEvidence = [
    ...(todoReport.featureReality?.generatedFeatureEvidence ?? []),
    ...(todoReport.featureReality?.renderedFeatureEvidence ?? []),
  ];
  if (evidenceIncludes(todoEvidence, ['input']) || evidenceIncludes(todoEvidence, ['taskinput'])) {
    pass('todo: input evidence');
  } else {
    fail('todo: input evidence');
  }
  if (evidenceIncludes(todoEvidence, ['list']) || evidenceIncludes(todoEvidence, ['tasklist'])) {
    pass('todo: list evidence');
  } else {
    fail('todo: list evidence');
  }
  if (evidenceIncludes(todoEvidence, ['item']) || evidenceIncludes(todoEvidence, ['taskitem'])) {
    pass('todo: item evidence');
  } else {
    fail('todo: item evidence');
  }

  console.log('\n── Generic weather prototype ──\n');

  const weatherReport = await buildFromPrompt({ prompt: GENERIC_PROTOTYPE_PROMPT, skipPreview: true });
  const weatherText = formatBuildReport(weatherReport);
  assertFeatureRealityReport(weatherReport, weatherText, 'weather');

  const weatherEvidence = [
    ...(weatherReport.featureReality?.generatedFeatureEvidence ?? []),
    ...(weatherReport.featureReality?.renderedFeatureEvidence ?? []),
  ];
  if (evidenceIncludes(weatherEvidence, ['search'])) pass('weather: search evidence');
  else fail('weather: search evidence');
  if (evidenceIncludes(weatherEvidence, ['weather'])) pass('weather: weather display evidence');
  else fail('weather: weather display evidence');
  if (evidenceIncludes(weatherEvidence, ['forecast'])) pass('weather: forecast card evidence');
  else fail('weather: forecast card evidence');
  if (evidenceIncludes(weatherEvidence, ['weatherservice']) || evidenceIncludes(weatherEvidence, ['service:'])) {
    pass('weather: placeholder service evidence');
  } else {
    fail('weather: placeholder service evidence');
  }

  if (
    weatherReport.featureReality &&
    weatherReport.featureReality.missingFeatures.length > 0 &&
    (weatherReport.featureReality.status === 'WARN' || weatherReport.featureReality.status === 'FAIL')
  ) {
    pass('weather: missing requested features reported as WARN or FAIL');
  } else if (
    weatherReport.featureReality &&
    weatherReport.featureReality.missingFeatures.length === 0
  ) {
    pass('weather: no missing features (acceptable)');
  } else {
    fail(
      'weather: missing requested features reported as WARN or FAIL',
      `status=${weatherReport.featureReality?.status}, missing=${weatherReport.featureReality?.missingFeatures.join(', ')}`,
    );
  }

  console.log('\n── Static checks ──\n');

  assertWebUiContainsPanel();
  assertNoForbiddenHardcoding();

  console.log('\n── Architecture-guided generation still passes ──\n');

  const archOk = await runArchitectureGuidedGenerationRegression();
  if (archOk) pass('architecture-guided generation regression still passes');
  else fail('architecture-guided generation regression still passes');

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
