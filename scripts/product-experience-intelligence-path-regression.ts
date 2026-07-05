/**
 * Product Experience Intelligence Engine regression — verifies PXIE runs after
 * workflow intelligence and shapes generated UI with domain-specific experience.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { planCrudExperience } from '../src/generation/plan-crud-experience.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { createDraftBuildPlan } from '../src/planner/create-draft-build-plan.js';
import { createArchitecturePlan } from '../src/architecture/create-architecture-plan.js';
import { validateProductExperienceModel } from '../src/product-experience/product-experience-validator.js';
import { PRODUCT_EXPERIENCE_MARKER } from '../src/product-experience/product-experience-types.js';

const PASS_TOKEN = 'PRODUCT_EXPERIENCE_INTELLIGENCE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/workflow/',
  'src/product-experience/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = ['LISA', 'WeatherDisplay', 'CountDisplay', 'TaskInput'];

const PXIE_CASES = [
  {
    prompt: 'Build a booking system with reservations and calendar',
    emptyState: 'No bookings yet',
    loading: 'Preparing your schedule',
    primaryCta: 'Create Booking',
    trust: 'Schedule updated live',
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    emptyState: 'No leads in this stage',
    loading: 'Loading pipeline',
    primaryCta: 'Move Lead',
    trust: 'Pipeline metrics update',
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    emptyState: 'No products match this filter',
    loading: 'Checking stock levels',
    primaryCta: 'Adjust Stock',
    trust: 'Low-stock alerts update automatically',
  },
  {
    prompt: 'Build a recipe manager with categories and favorites',
    emptyState: 'No recipes found',
    loading: 'Loading recipes',
    primaryCta: 'Open Recipe',
    trust: 'Ingredients saved',
  },
  {
    prompt: 'Build an expense tracker with dashboard and categories',
    emptyState: 'No transactions found',
    loading: 'Calculating totals',
    primaryCta: 'Add Transaction',
    trust: 'Totals calculated from transactions',
  },
  {
    prompt: 'Build a notes app with search and tags',
    emptyState: 'No note selected',
    loading: 'Opening workspace',
    primaryCta: 'Write Note',
    trust: 'Autosave enabled',
  },
  {
    prompt: 'Build a habit tracker with streaks and weekly overview',
    emptyState: 'No habits for today',
    loading: "Loading today's checklist",
    primaryCta: 'Complete Habit',
    trust: 'Progress updates',
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

function collectSourceFiles(dir: string, root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
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

function assertModulesExist(): void {
  for (const file of [
    'src/product-experience/product-experience-types.ts',
    'src/product-experience/product-experience-engine.ts',
    'src/product-experience/product-experience-catalog.ts',
    'src/product-experience/product-experience-validator.ts',
    'src/product-experience/product-experience-report.ts',
    'src/product-experience/product-experience-renderer.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }
}

function assertPipelineOrdering(): void {
  const planSource = readFileSync(join(process.cwd(), 'src/generation/plan-crud-experience.ts'), 'utf8');
  const workflowIdx = planSource.indexOf('buildWorkflowModel(');
  const pxieIdx = planSource.indexOf('buildProductExperienceModel(');
  if (workflowIdx >= 0 && pxieIdx > workflowIdx) {
    pass('pipeline: workflow intelligence before product experience');
  } else {
    fail('pipeline: workflow intelligence before product experience');
  }

  const crudGen = readFileSync(
    join(process.cwd(), 'src/generation/generic/generic-crud-generator.ts'),
    'utf8',
  );
  const layoutIdx = crudGen.indexOf('buildUiLayoutHomePage(');
  const workflowApplyIdx = crudGen.indexOf('applyWorkflowToLayout(');
  const pxieApplyIdx = crudGen.indexOf('applyProductExperienceToLayout(');

  if (layoutIdx >= 0 && workflowApplyIdx > layoutIdx && pxieApplyIdx > workflowApplyIdx) {
    pass('pipeline: PXIE applied after workflow during UI generation');
  } else {
    fail('pipeline: PXIE applied after workflow during UI generation');
  }

  if (pxieApplyIdx >= 0 && layoutIdx < pxieApplyIdx) {
    pass('pipeline: PXIE runs before final Home.tsx assembly');
  } else {
    fail('pipeline: PXIE runs before final Home.tsx assembly');
  }
}

function assertNoForbiddenHardcoding(): void {
  const srcRoot = join(process.cwd(), 'src');
  const sourceFiles = collectSourceFiles(srcRoot, srcRoot).map((file) => `src/${file}`);

  for (const filePath of sourceFiles) {
    if (APPROVED_HARDCODING_PREFIXES.some((prefix) => filePath.startsWith(prefix))) continue;

    const content = readFileSync(join(process.cwd(), filePath), 'utf8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (content.includes(pattern)) {
        fail('no application-specific hardcoding', `${pattern} in ${filePath}`);
      }
    }
  }

  const engineSource = readFileSync(
    join(process.cwd(), 'src/product-experience/product-experience-engine.ts'),
    'utf8',
  );
  if (!engineSource.includes('originalPrompt') && !engineSource.includes('appName')) {
    pass('PXIE engine: no prompt or app name branching');
  } else {
    fail('PXIE engine: no prompt or app name branching');
  }

  if (!failures.some((f) => f.startsWith('no application-specific'))) {
    pass('no application-specific hardcoding outside catalog modules');
  }
}

function assertPlannedExperience(testCase: (typeof PXIE_CASES)[number]): void {
  const label = testCase.primaryCta;
  const understanding = analyzePrompt(testCase.prompt);
  const buildPlan = createDraftBuildPlan(understanding);
  const architecturePlan = createArchitecturePlan(understanding, buildPlan);
  const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
  const model = planned.plan.productExperienceModel;
  const validation = validateProductExperienceModel(model);

  if (validation.valid) pass(`${label}: product experience model validates`);
  else fail(`${label}: product experience model validates`, validation.errors.join('; '));

  if (model.informationHierarchy.length >= 3) pass(`${label}: information hierarchy`);
  else fail(`${label}: information hierarchy`);

  if (model.visualHierarchy.length > 0) pass(`${label}: visual hierarchy`);
  else fail(`${label}: visual hierarchy`);

  if (model.attentionFlow.length > 0) pass(`${label}: attention flow`);
  else fail(`${label}: attention flow`);

  if (model.ctaHierarchy.primary) pass(`${label}: CTA hierarchy primary`);
  else fail(`${label}: CTA hierarchy primary`);

  if (model.feedbackModel.afterCreate) pass(`${label}: feedback model`);
  else fail(`${label}: feedback model`);

  if (model.emptyStateStrategy.includes(testCase.emptyState.split('.')[0]!)) {
    pass(`${label}: domain empty state`);
  } else {
    fail(`${label}: domain empty state`, model.emptyStateStrategy);
  }

  if (model.loadingStateStrategy.includes(testCase.loading.split('...')[0]!)) {
    pass(`${label}: domain loading state`);
  } else {
    fail(`${label}: domain loading state`, model.loadingStateStrategy);
  }

  if (model.errorStateStrategy.trim()) pass(`${label}: error state strategy`);
  else fail(`${label}: error state strategy`);

  if (model.successStateStrategy.trim()) pass(`${label}: success state strategy`);
  else fail(`${label}: success state strategy`);

  if (model.trustSignals.some((s) => s.includes(testCase.trust.split(' ')[0]!))) {
    pass(`${label}: trust signals`);
  } else {
    fail(`${label}: trust signals`, model.trustSignals.join('; '));
  }

  if (model.frictionReduction.length > 0) pass(`${label}: friction reduction`);
  else fail(`${label}: friction reduction`);

  if (model.accessibilityGuidance.length > 0) pass(`${label}: accessibility guidance`);
  else fail(`${label}: accessibility guidance`);

  const microcopy = model.microcopyGuidelines.join(' ').toLowerCase();
  if (!microcopy.includes('create item') && !microcopy.includes('update item')) {
    pass(`${label}: microcopy avoids generic labels`);
  } else {
    fail(`${label}: microcopy avoids generic labels`);
  }
}

async function assertGeneratedExperience(
  testCase: (typeof PXIE_CASES)[number],
): Promise<void> {
  const label = testCase.primaryCta;
  const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });

  if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
  else fail(`${label}: build succeeded`, report.error ?? 'failed');

  if (report.productExperience) pass(`${label}: productExperience on report`);
  else fail(`${label}: productExperience on report`);

  const reportText = formatBuildReport(report);
  if (reportText.includes('Product Experience Intelligence')) {
    pass(`${label}: engineering report section`);
  } else {
    fail(`${label}: engineering report section`);
  }

  for (const field of [
    'Experience Goal',
    'Information Hierarchy',
    'Visual Hierarchy',
    'Attention Flow',
    'CTA Hierarchy',
    'Feedback Model',
    'Empty State Strategy',
    'Trust Signals',
    'Experience Confidence',
  ]) {
    if (reportText.includes(field)) pass(`${label}: report field ${field}`);
    else fail(`${label}: report field ${field}`);
  }

  if (!report.projectDir || !existsSync(join(report.projectDir, 'src/pages/Home.tsx'))) {
    fail(`${label}: Home.tsx exists`);
    return;
  }

  const homeContent = readFileSync(join(report.projectDir, 'src/pages/Home.tsx'), 'utf8');

  if (homeContent.includes(`${PRODUCT_EXPERIENCE_MARKER}="experience-driven"`)) {
    pass(`${label}: experience-driven marker`);
  } else {
    fail(`${label}: experience-driven marker`);
  }

  if (homeContent.includes(`${PRODUCT_EXPERIENCE_MARKER}="guidance-panel"`)) {
    pass(`${label}: guidance panel marker`);
  } else {
    fail(`${label}: guidance panel marker`);
  }

  if (homeContent.includes(`${PRODUCT_EXPERIENCE_MARKER}="empty-state"`)) {
    pass(`${label}: empty state marker`);
  } else {
    fail(`${label}: empty state marker`);
  }

  if (homeContent.includes('pxie-primary-cta')) pass(`${label}: primary CTA prominence`);
  else fail(`${label}: primary CTA prominence`);

  if (homeContent.includes(testCase.emptyState.split('.')[0]!)) {
    pass(`${label}: domain empty state in UI`);
  } else {
    fail(`${label}: domain empty state in UI`);
  }

  if (homeContent.includes(testCase.loading.split('...')[0]!)) {
    pass(`${label}: domain loading label in UI`);
  } else {
    fail(`${label}: domain loading label in UI`);
  }

  if (homeContent.includes(`${PRODUCT_EXPERIENCE_MARKER}="trust"`)) {
    pass(`${label}: trust signal in UI`);
  } else {
    fail(`${label}: trust signal in UI`);
  }
}

function assertWebUi(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('card-product-experience')) pass('web UI: Product Experience report card');
  else fail('web UI: Product Experience report card');

  if (appJs.includes('renderProductExperience')) pass('web UI: renderProductExperience implemented');
  else fail('web UI: renderProductExperience implemented');

  if (appJs.includes("['product-experience', 'card-product-experience']")) {
    pass('web UI: product experience in REPORT_CARD_MAP');
  } else {
    fail('web UI: product experience in REPORT_CARD_MAP');
  }

  if (indexHtml.includes('sidebar-experience')) pass('web UI: sidebar compact experience summary');
  else fail('web UI: sidebar compact experience summary');

  if (appJs.includes('sidebar-experience')) pass('web UI: sidebar experience populated');
  else fail('web UI: sidebar experience populated');
}

export async function runProductExperienceIntelligenceRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nProduct Experience Intelligence Engine regression\n');

  console.log('── PXIE modules ──\n');
  assertModulesExist();

  console.log('\n── Pipeline ordering ──\n');
  assertPipelineOrdering();

  console.log('\n── Domain-driven design ──\n');
  assertNoForbiddenHardcoding();

  console.log('\n── Planned product experience ──\n');
  for (const testCase of PXIE_CASES) {
    assertPlannedExperience(testCase);
  }

  console.log('\n── Generated product experience ──\n');
  for (const testCase of PXIE_CASES) {
    await assertGeneratedExperience(testCase);
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
