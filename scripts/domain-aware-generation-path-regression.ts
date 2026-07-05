/**
 * Domain-Aware Generation regression — verifies naming, category detection,
 * shared domain components, and domain-specific layouts in generated apps.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { inferApplicationIdentity } from '../src/understanding/infer-application-identity.js';
import {
  DOMAIN_COMPONENT_MARKER,
  DOMAIN_LAYOUT_MARKER,
} from '../src/generation/generic/domain-profiles.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';

const PASS_TOKEN = 'DOMAIN_AWARE_GENERATION_V1_PASS';

const DOMAIN_CASES = [
  {
    prompt: 'Build an expense tracker with dashboard, categories, search and editing',
    expectedName: 'Expense Tracker',
    expectedCategory: 'Expense Tracker',
    expectedDomainId: 'expense-tracker',
  },
  {
    prompt: 'Build a recipe manager with categories and favorites',
    expectedName: 'Recipe Manager',
    expectedCategory: 'Recipe Manager',
    expectedDomainId: 'recipe-manager',
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    expectedName: 'CRM',
    expectedCategory: 'CRM',
    expectedDomainId: 'crm',
  },
  {
    prompt: 'Build a habit tracker with streaks and weekly overview',
    expectedName: 'Habit Tracker',
    expectedCategory: 'Habit Tracker',
    expectedDomainId: 'habit-tracker',
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    expectedName: 'Inventory System',
    expectedCategory: 'Inventory System',
    expectedDomainId: 'inventory-system',
  },
] as const;

const SHARED_DOMAIN_COMPONENTS = [
  'DashboardSummary',
  'ChartPlaceholder',
  'RecentActivityPanel',
  'FilterBar',
  'SearchBar',
  'EmptyState',
  'ConfirmationDialog',
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

function extractDomain(prompt: string): string {
  const match = prompt.match(/^\s*build\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s+app)?\s*$/i);
  return match?.[1]?.trim().toLowerCase() ?? prompt.toLowerCase();
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

function assertWebUiPresentation(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');
  const stylesCss = readFileSync(join(process.cwd(), 'web', 'styles.css'), 'utf8');

  if (indexHtml.includes('What would you like to build?')) pass('web UI: hero heading present');
  else fail('web UI: hero heading present');

  if (indexHtml.includes('quick-report')) pass('web UI: simplified quick report present');
  else fail('web UI: simplified quick report present');

  if (indexHtml.includes('report-drawer')) pass('web UI: engineering report drawer present');
  else fail('web UI: engineering report drawer present');

  if (appJs.includes('renderQuickReport')) pass('web UI: renderQuickReport implemented');
  else fail('web UI: renderQuickReport implemented');

  if (appJs.includes('timeline-stage-progress')) pass('web UI: timeline stage progress implemented');
  else fail('web UI: timeline stage progress implemented');

  if (appJs.includes('resetWorkspaceUI')) pass('web UI: resetWorkspaceUI implemented');
  else fail('web UI: resetWorkspaceUI implemented');
}

function assertDomainModulesExist(): void {
  for (const file of [
    'src/understanding/infer-application-identity.ts',
    'src/generation/generic/domain-profiles.ts',
    'src/generation/generic/domain-components.ts',
    'src/generation/generic/domain-creation-profiles.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }
}

function assertGeneratedDomainLayout(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  expectedDomainId: string,
  label: string,
): void {
  const projectDir = report.projectDir;
  if (!projectDir || !existsSync(projectDir)) {
    fail(`${label}: project directory exists`);
    return;
  }

  pass(`${label}: project directory exists`);

  const homePath = join(projectDir, 'src', 'pages', 'Home.tsx');
  if (!existsSync(homePath)) {
    fail(`${label}: Home.tsx generated`);
    return;
  }

  const homeContent = readFileSync(homePath, 'utf8');
  if (homeContent.includes(`${DOMAIN_LAYOUT_MARKER}="${expectedDomainId}"`)) {
    pass(`${label}: domain layout marker (${expectedDomainId})`);
  } else {
    fail(`${label}: domain layout marker (${expectedDomainId})`);
  }

  for (const component of SHARED_DOMAIN_COMPONENTS) {
    const componentPath = join(projectDir, 'src', 'components', `${component}.tsx`);
    if (existsSync(componentPath)) {
      pass(`${label}: shared component ${component}`);
    } else {
      fail(`${label}: shared component ${component}`);
    }
  }

  const srcDir = join(projectDir, 'src');
  const relativeFiles = collectSourceFiles(srcDir, srcDir);
  const corpus = relativeFiles
    .map((rel) => readFileSync(join(srcDir, rel), 'utf8'))
    .join('\n');
  if (corpus.includes(DOMAIN_COMPONENT_MARKER)) {
    pass(`${label}: domain component markers present`);
  } else {
    fail(`${label}: domain component markers present`);
  }
}

export async function runDomainAwareGenerationRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nDomain-Aware Generation regression\n');

  console.log('── Application identity & naming ──\n');

  for (const testCase of DOMAIN_CASES) {
    const understanding = analyzePrompt(testCase.prompt);
    const domain = extractDomain(testCase.prompt);
    const identity = inferApplicationIdentity(testCase.prompt, domain);

    if (understanding.suggestedAppName === testCase.expectedName) {
      pass(`${testCase.expectedName}: suggestedAppName`);
    } else {
      fail(`${testCase.expectedName}: suggestedAppName`, understanding.suggestedAppName);
    }

    if (understanding.applicationCategory === testCase.expectedCategory) {
      pass(`${testCase.expectedName}: applicationCategory`);
    } else {
      fail(`${testCase.expectedName}: applicationCategory`, understanding.applicationCategory ?? 'null');
    }

    if (identity.domainId === testCase.expectedDomainId) {
      pass(`${testCase.expectedName}: domainId`);
    } else {
      fail(`${testCase.expectedName}: domainId`, identity.domainId);
    }

    if (!understanding.suggestedAppName.toLowerCase().includes('with ')) {
      pass(`${testCase.expectedName}: name excludes feature qualifiers`);
    } else {
      fail(`${testCase.expectedName}: name excludes feature qualifiers`, understanding.suggestedAppName);
    }
  }

  console.log('\n── Domain-aware generation builds ──\n');

  for (const testCase of DOMAIN_CASES.slice(0, 3)) {
    const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });
    const reportText = formatBuildReport(report);
    const label = testCase.expectedName;

    if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
    else fail(`${label}: build succeeded`, report.error ?? 'failed');

    if (report.understanding?.applicationCategory === testCase.expectedCategory) {
      pass(`${label}: report applicationCategory`);
    } else {
      fail(`${label}: report applicationCategory`, report.understanding?.applicationCategory ?? 'null');
    }

    if (report.featureReality?.status !== 'FAIL') {
      pass(`${label}: feature reality ${report.featureReality?.status ?? 'unknown'}`);
    } else {
      fail(`${label}: feature reality not FAIL`, report.featureReality.missingFeatures.join(', '));
    }

    if (reportText.includes('Category:')) pass(`${label}: report includes category`);
    else fail(`${label}: report includes category`);

    assertGeneratedDomainLayout(report, testCase.expectedDomainId, label);
  }

  console.log('\n── Specialized templates unaffected ──\n');

  const calculatorReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT, skipPreview: true });
  if (calculatorReport.ok && calculatorReport.buildOk) pass('calculator: build still succeeds');
  else fail('calculator: build still succeeds', calculatorReport.error ?? 'failed');

  console.log('\n── Static checks ──\n');

  assertDomainModulesExist();
  assertWebUiPresentation();
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
