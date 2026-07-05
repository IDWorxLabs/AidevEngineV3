/**
 * Product Quality regression — verifies polished generated UI output.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import {
  ACCESSIBILITY_FEATURES,
  CRUD_UX_FEATURES,
  DESIGN_COMPONENTS,
  FORM_QUALITY_MARKERS,
  LIST_QUALITY_MARKERS,
} from '../src/generation/product-quality/product-quality-types.js';
import {
  REAL_APP_TRIAL_SUITE,
  formatRealAppTrialSummary,
  runRealAppTrialHarness,
} from '../src/testing/real-app-trial-harness.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';

const PASS_TOKEN = 'PRODUCT_QUALITY_V1_PASS';

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

  if (indexHtml.includes('Product Quality')) pass('web UI: Product Quality panel exists');
  else fail('web UI: Product Quality panel exists');

  if (appJs.includes('renderProductQuality')) pass('web UI: renderProductQuality implemented');
  else fail('web UI: renderProductQuality implemented');
}

function assertQualityReport(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  reportText: string,
  label: string,
  minScore: number,
): void {
  const quality = report.productQuality;
  if (!quality) {
    fail(`${label}: productQuality in report`);
    return;
  }

  pass(`${label}: productQuality in report`);

  if (reportText.includes('── Product Quality ──')) {
    pass(`${label}: Product Quality section in report text`);
  } else {
    fail(`${label}: Product Quality section in report text`);
  }

  if (quality.responsiveLayout) pass(`${label}: responsive layout generated`);
  else fail(`${label}: responsive layout generated`);

  if (quality.designComponents.length >= 3) {
    pass(`${label}: design system components (${quality.designComponents.length})`);
  } else {
    fail(`${label}: design system components`, String(quality.designComponents.length));
  }

  if (quality.accessibilityFeatures.length >= 2) {
    pass(`${label}: accessibility support (${quality.accessibilityFeatures.length})`);
  } else {
    fail(`${label}: accessibility support`, String(quality.accessibilityFeatures.length));
  }

  if (quality.qualityScore >= minScore) {
    pass(`${label}: quality score >= ${minScore} (${quality.qualityScore.toFixed(2)})`);
  } else {
    fail(`${label}: quality score >= ${minScore}`, quality.qualityScore.toFixed(2));
  }
}

export async function runProductQualityRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nProduct Quality regression\n');

  console.log('── Supported app quality ──\n');

  const calculatorReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT, skipPreview: true });
  assertQualityReport(
    calculatorReport,
    formatBuildReport(calculatorReport),
    'calculator',
    0.35,
  );

  console.log('\n── Generic CRUD quality ──\n');

  const expenseReport = await buildFromPrompt({
    prompt: 'Build an expense tracker.',
    skipPreview: true,
  });
  const expenseText = formatBuildReport(expenseReport);
  assertQualityReport(expenseReport, expenseText, 'expense tracker', 0.55);

  const quality = expenseReport.productQuality;
  if (quality && quality.crudUxFeatures.length >= 3) {
    pass(`expense tracker: CRUD UX features (${quality.crudUxFeatures.length})`);
  } else {
    fail('expense tracker: CRUD UX features', String(quality?.crudUxFeatures.length ?? 0));
  }

  if (quality && quality.layoutFeatures.length >= 4) {
    pass(`expense tracker: layout features (${quality.layoutFeatures.length})`);
  } else {
    fail('expense tracker: layout features', String(quality?.layoutFeatures.length ?? 0));
  }

  console.log('\n── Generated asset markers ──\n');

  const stylesPath = join(process.cwd(), 'src', 'generation', 'product-quality', 'design-system.ts');
  if (existsSync(stylesPath)) pass('design-system module exists');
  else fail('design-system module exists');

  const expenseCss = readFileSync(join(expenseReport.projectDir, 'src', 'styles', 'product-quality.css'), 'utf8');
  if (expenseCss.includes('--ds-color-primary')) pass('product-quality.css generated in workspace');
  else fail('product-quality.css generated in workspace');

  const expenseForm = readFileSync(
    join(expenseReport.projectDir, 'src', 'components', 'EntityFormView.tsx'),
    'utf8',
  );
  if (expenseForm.includes(FORM_QUALITY_MARKERS.fieldGroup)) pass('improved forms: field groups');
  else fail('improved forms: field groups');

  if (expenseForm.includes(FORM_QUALITY_MARKERS.disabledSubmit)) pass('improved forms: disabled submit');
  else fail('improved forms: disabled submit');

  const expenseList = readFileSync(
    join(expenseReport.projectDir, 'src', 'components', 'EntityListView.tsx'),
    'utf8',
  );
  if (expenseList.includes(LIST_QUALITY_MARKERS.scrollable)) pass('improved lists: scrollable layout');
  else fail('improved lists: scrollable layout');

  if (expenseList.includes(LIST_QUALITY_MARKERS.selection)) pass('improved lists: selection state');
  else fail('improved lists: selection state');

  console.log('\n── Trial harness product quality evidence ──\n');

  const suite = await runRealAppTrialHarness({ skipPreview: true, prompts: REAL_APP_TRIAL_SUITE.slice(0, 4) });
  console.log(formatRealAppTrialSummary(suite));
  console.log('');

  if (suite.averageQualityScore >= 0.4) {
    pass(`trial average quality score (${suite.averageQualityScore.toFixed(2)})`);
  } else {
    fail('trial average quality score', suite.averageQualityScore.toFixed(2));
  }

  for (const result of suite.results) {
    if (result.productQuality) {
      pass(`${result.applicationType}: product quality evidence attached`);
    } else {
      fail(`${result.applicationType}: product quality evidence attached`);
    }
  }

  const typesContent = readFileSync(
    join(process.cwd(), 'src', 'generation', 'product-quality', 'product-quality-types.ts'),
    'utf8',
  );
  if (DESIGN_COMPONENTS.every((item) => typesContent.includes(item))) pass('design components declared');
  else fail('design components declared');

  if (ACCESSIBILITY_FEATURES.every((item) => typesContent.includes(item))) {
    pass('accessibility features declared');
  } else {
    fail('accessibility features declared');
  }

  if (CRUD_UX_FEATURES.every((item) => typesContent.includes(item))) pass('CRUD UX features declared');
  else fail('CRUD UX features declared');

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
