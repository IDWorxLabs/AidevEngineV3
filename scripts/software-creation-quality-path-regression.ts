/**
 * Software Creation Quality regression — verifies starter data, domain forms,
 * computed metrics, and richer generated application output.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import {
  SOFTWARE_CREATION_MARKER,
  resolveDomainCreationProfile,
} from '../src/generation/generic/domain-creation-profiles.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { inferApplicationDomain } from '../src/generation/generic/domain-profiles.js';

const PASS_TOKEN = 'SOFTWARE_CREATION_QUALITY_V1_PASS';

const DOMAIN_CASES = [
  {
    prompt: 'Build a booking system with reservations and calendar',
    domainId: 'booking-system',
    seedHints: ['Alex Morgan', 'Jamie Park', 'Consultation'],
    formHints: ['Customer name', 'Service / type', 'Status'],
    actionLabel: 'Create booking',
    filterHint: 'Confirmed',
    metricHints: ['useDomainMetrics', 'todayCount', 'upcoming'],
  },
  {
    prompt: 'Build an expense tracker with dashboard, categories, search and editing',
    domainId: 'expense-tracker',
    seedHints: ['Salary deposit', 'Grocery shopping', 'recordType'],
    formHints: ['Type', 'Amount', 'Category'],
    actionLabel: 'Add transaction',
    filterHint: 'Income',
    metricHints: ['useDomainMetrics', 'balance', 'income'],
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    domainId: 'crm',
    seedHints: ['Sarah Chen', 'Marcus Lee', 'stage'],
    formHints: ['Customer name', 'Company', 'Stage'],
    actionLabel: 'Add customer',
    filterHint: 'Lead',
    metricHints: ['useDomainMetrics', 'pipelineValue', 'activeDeals'],
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    domainId: 'inventory-system',
    seedHints: ['Wireless mouse', 'Notebook pack', 'reorderLevel'],
    formHints: ['Product name', 'SKU', 'Stock quantity'],
    actionLabel: 'Add product',
    filterHint: 'Low Stock',
    metricHints: ['useDomainMetrics', 'lowStock', 'stockValue'],
  },
  {
    prompt: 'Build a recipe manager with categories and favorites',
    domainId: 'recipe-manager',
    seedHints: ['Avocado toast', 'cookingTime', 'ingredients'],
    formHints: ['Recipe name', 'Ingredients', 'Cooking time'],
    actionLabel: 'Add recipe',
    filterHint: 'Breakfast',
    metricHints: ['useDomainMetrics', 'recipes'],
  },
] as const;

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

function readProjectCorpus(projectDir: string): string {
  const paths = [
    'src/services/EntityService.ts',
    'src/hooks/useDomainMetrics.ts',
    'src/pages/Home.tsx',
    'src/components/Toolbar.tsx',
    'src/components/EntityFormView.tsx',
    'src/components/FilterBar.tsx',
    'src/components/DashboardSummary.tsx',
    'src/components/ChartPlaceholder.tsx',
    'src/components/RecentActivityPanel.tsx',
    'src/components/EntityListView.tsx',
  ];

  return paths
    .map((rel) => {
      const full = join(projectDir, rel);
      return existsSync(full) ? readFileSync(full, 'utf8') : '';
    })
    .join('\n');
}

function assertCreationModulesExist(): void {
  for (const file of [
    'src/generation/generic/domain-creation-profiles.ts',
    'src/generation/generic/domain-components.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }

  const content = readFileSync(
    join(process.cwd(), 'src/generation/generic/domain-creation-profiles.ts'),
    'utf8',
  );
  if (content.includes(SOFTWARE_CREATION_MARKER)) {
    pass('creation profiles export SOFTWARE_CREATION_MARKER');
  } else {
    fail('creation profiles export SOFTWARE_CREATION_MARKER');
  }
}

function assertDomainCreationProfile(label: string, prompt: string, domainId: string): void {
  const understanding = analyzePrompt(prompt);
  const buildPlan = { appName: understanding.suggestedAppName, features: [] };
  const domain = inferApplicationDomain(understanding, buildPlan as never);
  const creation = resolveDomainCreationProfile(understanding, buildPlan as never);

  if (domain.domainId === domainId) pass(`${label}: domain profile id`);
  else fail(`${label}: domain profile id`, domain.domainId);

  if (creation.seedData.length >= 2) pass(`${label}: seed data records`);
  else fail(`${label}: seed data records`, String(creation.seedData.length));

  if (creation.filterOptions.length >= 3) pass(`${label}: domain filter options`);
  else fail(`${label}: domain filter options`);

  if (creation.metricsComputation.includes('return')) pass(`${label}: metrics computation`);
  else fail(`${label}: metrics computation`);
}

async function assertGeneratedApp(
  testCase: (typeof DOMAIN_CASES)[number],
): Promise<void> {
  const label = testCase.domainId;
  const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });
  const projectDir = report.projectDir;

  if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
  else fail(`${label}: build succeeded`, report.error ?? 'failed');

  if (!projectDir || !existsSync(projectDir)) {
    fail(`${label}: project directory exists`);
    return;
  }

  const corpus = readProjectCorpus(projectDir);
  const serviceContent = readFileSync(join(projectDir, 'src/services/EntityService.ts'), 'utf8');

  for (const hint of testCase.seedHints) {
    if (serviceContent.includes(hint)) pass(`${label}: seed data includes "${hint}"`);
    else fail(`${label}: seed data includes "${hint}"`);
  }

  if (!serviceContent.includes('private items: Entity[] = [')) {
    fail(`${label}: EntityService initializes with seed array`);
  } else if (serviceContent.includes('private items: Entity[] = [];')) {
    fail(`${label}: EntityService not empty on load`);
  } else {
    pass(`${label}: EntityService initializes with seed array`);
  }

  for (const hint of testCase.formHints) {
    if (corpus.includes(hint)) pass(`${label}: form field "${hint}"`);
    else fail(`${label}: form field "${hint}"`);
  }

  if (corpus.includes(testCase.actionLabel)) pass(`${label}: action label "${testCase.actionLabel}"`);
  else fail(`${label}: action label "${testCase.actionLabel}"`);

  if (corpus.includes(testCase.filterHint)) pass(`${label}: filter option "${testCase.filterHint}"`);
  else fail(`${label}: filter option "${testCase.filterHint}"`);

  for (const hint of testCase.metricHints) {
    if (corpus.includes(hint)) pass(`${label}: computed metric hint "${hint}"`);
    else fail(`${label}: computed metric hint "${hint}"`);
  }

  if (corpus.includes(SOFTWARE_CREATION_MARKER)) pass(`${label}: software creation markers`);
  else fail(`${label}: software creation markers`);

  if (corpus.includes('chart-bar-row')) pass(`${label}: CSS chart bars`);
  else fail(`${label}: CSS chart bars`);

  if (corpus.includes('recent-activity-list')) pass(`${label}: starter list section`);
  else fail(`${label}: starter list section`);

  const homeContent = readFileSync(join(projectDir, 'src/pages/Home.tsx'), 'utf8');
  const showsStarterList =
    homeContent.includes('visibleItems[0]') ||
    homeContent.includes('visibleItems.map') ||
    homeContent.includes('visibleItems.slice') ||
    homeContent.includes('todayItems.map') ||
    homeContent.includes('upcoming.map');
  if (showsStarterList) pass(`${label}: list visible on load (not empty-only)`);
  else fail(`${label}: list visible on load (not empty-only)`);

  if (homeContent.includes('useDomainMetrics')) pass(`${label}: dashboard metrics hook wired`);
  else fail(`${label}: dashboard metrics hook wired`);
}

export async function runSoftwareCreationQualityRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nSoftware Creation Quality regression\n');

  console.log('── Creation profile modules ──\n');
  assertCreationModulesExist();

  console.log('\n── Domain creation profiles ──\n');
  for (const testCase of DOMAIN_CASES) {
    assertDomainCreationProfile(testCase.domainId, testCase.prompt, testCase.domainId);
  }

  console.log('\n── Generated application quality ──\n');
  for (const testCase of DOMAIN_CASES) {
    await assertGeneratedApp(testCase);
  }

  console.log('\n── Preview verification (expense tracker sample) ──\n');
  const previewReport = await buildFromPrompt({
    prompt: 'Build an expense tracker with dashboard and categories',
    skipPreview: false,
  });
  if (previewReport.ok && previewReport.buildOk) pass('expense tracker: build for preview');
  else fail('expense tracker: build for preview', previewReport.error ?? 'failed');

  if (previewReport.previewVerification?.status !== 'FAIL') {
    pass('expense tracker: preview verification');
  } else {
    fail(
      'expense tracker: preview verification',
      previewReport.previewVerification.warnings.join('; ') || 'failed',
    );
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
