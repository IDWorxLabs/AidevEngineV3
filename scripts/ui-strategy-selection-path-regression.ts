/**
 * UI Strategy Selection regression — verifies domain-appropriate layout selection
 * and strategy-specific generated UI markers.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { selectUiStrategy } from '../src/generation/ui-strategy/select-ui-strategy.js';
import { UI_STRATEGY_MARKER } from '../src/generation/ui-strategy/ui-strategy-types.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { createDraftBuildPlan } from '../src/planner/create-draft-build-plan.js';
import { createArchitecturePlan } from '../src/architecture/create-architecture-plan.js';
import type { LayoutPattern } from '../src/generation/ui-strategy/ui-strategy-types.js';

const PASS_TOKEN = 'UI_STRATEGY_SELECTION_V1_PASS';

const STRATEGY_CASES = [
  {
    prompt: 'Build a booking system with reservations and calendar',
    expectedPattern: 'calendar' as LayoutPattern,
    marker: 'schedule-grid',
    component: 'ScheduleGrid',
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    expectedPattern: 'kanban' as LayoutPattern,
    marker: 'pipeline-board',
    component: 'PipelineBoard',
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    expectedPattern: 'data-table' as LayoutPattern,
    marker: 'product-table',
    component: 'ProductTable',
  },
  {
    prompt: 'Build a recipe manager with categories and favorites',
    expectedPattern: 'card-grid' as LayoutPattern,
    marker: 'recipe-card-grid',
    component: 'RecipeCardGrid',
  },
  {
    prompt: 'Build an expense tracker with dashboard and categories',
    expectedPattern: 'ledger' as LayoutPattern,
    marker: 'transaction-ledger',
    component: 'TransactionLedger',
  },
  {
    prompt: 'Build a notes app with search and tags',
    expectedPattern: 'editor' as LayoutPattern,
    marker: 'editor-pane',
    component: 'EditorPane',
  },
  {
    prompt: 'Build a restaurant POS with menu and orders',
    expectedPattern: 'pos' as LayoutPattern,
    marker: 'menu-grid',
    component: 'MenuGrid',
  },
  {
    prompt: 'Build a habit tracker with streaks and weekly overview',
    expectedPattern: 'progress-dashboard' as LayoutPattern,
    marker: 'today-checklist',
    component: 'TodayChecklist',
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

function assertModulesExist(): void {
  for (const file of [
    'src/generation/ui-strategy/ui-strategy-types.ts',
    'src/generation/ui-strategy/select-ui-strategy.ts',
    'src/generation/ui-strategy/ui-strategy-catalog.ts',
    'src/generation/ui-strategy/layout-generators/build-ui-layout.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }
}

function assertSelector(label: string, prompt: string, expectedPattern: LayoutPattern): void {
  const understanding = analyzePrompt(prompt);
  const buildPlan = createDraftBuildPlan(understanding);
  const architecturePlan = createArchitecturePlan(understanding, buildPlan);
  const result = selectUiStrategy({ understanding, buildPlan, architecturePlan });

  if (result.strategy.layoutPattern === expectedPattern) {
    pass(`${label}: selects ${expectedPattern} layout`);
  } else {
    fail(`${label}: selects ${expectedPattern} layout`, result.strategy.layoutPattern);
  }
}

async function assertGeneratedLayout(
  testCase: (typeof STRATEGY_CASES)[number],
): Promise<void> {
  const label = testCase.expectedPattern;
  const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });

  if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
  else fail(`${label}: build succeeded`, report.error ?? 'failed');

  if (report.uiStrategy?.layoutPattern === testCase.expectedPattern) {
    pass(`${label}: report uiStrategy layout`);
  } else {
    fail(`${label}: report uiStrategy layout`, report.uiStrategy?.layoutPattern ?? 'null');
  }

  const reportText = formatBuildReport(report);
  if (reportText.includes('── UI Strategy ──')) pass(`${label}: report text UI Strategy section`);
  else fail(`${label}: report text UI Strategy section`);

  if (!report.projectDir || !existsSync(join(report.projectDir, 'src/pages/Home.tsx'))) {
    fail(`${label}: Home.tsx exists`);
    return;
  }

  const homeContent = readFileSync(join(report.projectDir, 'src/pages/Home.tsx'), 'utf8');
  if (homeContent.includes(`${UI_STRATEGY_MARKER}="${testCase.expectedPattern}"`)) {
    pass(`${label}: layout marker ${testCase.expectedPattern}`);
  } else {
    fail(`${label}: layout marker ${testCase.expectedPattern}`);
  }

  if (homeContent.includes(`${UI_STRATEGY_MARKER}-surface="${testCase.marker}"`)) {
    pass(`${label}: primary surface ${testCase.marker}`);
  } else {
    fail(`${label}: primary surface ${testCase.marker}`);
  }

  if (homeContent.includes(`${UI_STRATEGY_MARKER}-component="${testCase.component}"`)) {
    pass(`${label}: strategy component ${testCase.component}`);
  } else {
    fail(`${label}: strategy component ${testCase.component}`);
  }
}

function assertWebUi(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('sidebar-ui-strategy')) pass('web UI: sidebar UI Strategy metric');
  else fail('web UI: sidebar UI Strategy metric');

  if (indexHtml.includes('card-ui-strategy')) pass('web UI: UI Strategy report card');
  else fail('web UI: UI Strategy report card');

  if (appJs.includes('renderUiStrategy')) pass('web UI: renderUiStrategy implemented');
  else fail('web UI: renderUiStrategy implemented');

  if (indexHtml.includes('Build Status') && indexHtml.includes('Preview Ready')) {
    pass('web UI: simplified sidebar metrics');
  } else {
    fail('web UI: simplified sidebar metrics');
  }
}

export async function runUiStrategySelectionRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nUI Strategy Selection regression\n');

  console.log('── Strategy modules ──\n');
  assertModulesExist();

  console.log('\n── Strategy selector ──\n');
  for (const testCase of STRATEGY_CASES) {
    assertSelector(testCase.expectedPattern, testCase.prompt, testCase.expectedPattern);
  }

  console.log('\n── Generated layouts ──\n');
  for (const testCase of STRATEGY_CASES) {
    await assertGeneratedLayout(testCase);
  }

  console.log('\n── Preview sample ──\n');
  const previewReport = await buildFromPrompt({
    prompt: 'Build an expense tracker with dashboard and categories',
    skipPreview: false,
  });
  if (previewReport.ok && previewReport.buildOk) pass('expense tracker: preview build');
  else fail('expense tracker: preview build', previewReport.error ?? 'failed');

  if (previewReport.previewVerification?.status !== 'FAIL') {
    pass('expense tracker: preview verification');
  } else {
    fail('expense tracker: preview verification');
  }

  console.log('\n── Static checks ──\n');
  assertWebUi();

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
