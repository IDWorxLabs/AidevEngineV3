/**
 * Product Presentation Intelligence Engine (PPIE) regression — verifies PPIE runs
 * after product design intelligence and decides presentation hierarchy and
 * progressive disclosure so generated apps lead with real product content instead
 * of engineering/planning metadata.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { planCrudExperience } from '../src/generation/plan-crud-experience.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { createDraftBuildPlan } from '../src/planner/create-draft-build-plan.js';
import { createArchitecturePlan } from '../src/architecture/create-architecture-plan.js';
import { validateProductPresentationModel } from '../src/product-presentation/product-presentation-validator.js';
import { isKnownPresentationDomain } from '../src/product-presentation/product-presentation-catalog.js';
import { PRODUCT_PRESENTATION_MARKER } from '../src/product-presentation/product-presentation-types.js';
import { WORKFLOW_MARKER } from '../src/workflow/workflow-types.js';
import { PRODUCT_EXPERIENCE_MARKER } from '../src/product-experience/product-experience-types.js';
import { PRODUCT_ARCHITECTURE_MARKER } from '../src/product-architecture/product-architecture-types.js';
import { PRODUCT_DESIGN_MARKER } from '../src/product-design/product-design-types.js';

const PASS_TOKEN = 'PRODUCT_PRESENTATION_INTELLIGENCE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/workflow/',
  'src/product-experience/',
  'src/product-architecture/',
  'src/product-design/',
  'src/product-presentation/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = ['LISA', 'WeatherDisplay', 'CountDisplay', 'TaskInput'];

const PPIE_CASES = [
  {
    prompt: 'Build a booking system with reservations and calendar',
    label: 'Booking System',
    domainId: 'booking-system',
    presentationMode: 'Focused',
    primarySurface: "Today's schedule and available slots",
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    label: 'CRM',
    domainId: 'crm',
    presentationMode: 'Dense',
    primarySurface: 'Pipeline board with deal columns',
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    label: 'Inventory System',
    domainId: 'inventory-system',
    presentationMode: 'Dense',
    primarySurface: 'Stock metrics and product table',
  },
  {
    prompt: 'Build an expense tracker with dashboard and categories',
    label: 'Expense Tracker',
    domainId: 'expense-tracker',
    presentationMode: 'Focused',
    primarySurface: 'Balance summary and ledger',
  },
  {
    prompt: 'Build a recipe manager with categories and favorites',
    label: 'Recipe Manager',
    domainId: 'recipe-manager',
    presentationMode: 'Balanced',
    primarySurface: 'Recipe cards and discovery',
  },
  {
    prompt: 'Build a notes app with search and tags',
    label: 'Notes App',
    domainId: 'notes-app',
    presentationMode: 'Focused',
    primarySurface: 'Notes list and editor',
  },
] as const;

const GENERIC_CASES = [
  { prompt: 'Build a wine collection tracker', label: 'Wine Collection Tracker' },
  { prompt: 'Build a vintage vinyl record catalog', label: 'Vinyl Record Catalog' },
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
    'src/product-presentation/product-presentation-types.ts',
    'src/product-presentation/product-presentation-engine.ts',
    'src/product-presentation/product-presentation-catalog.ts',
    'src/product-presentation/product-presentation-validator.ts',
    'src/product-presentation/product-presentation-report.ts',
    'src/product-presentation/product-presentation-renderer.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }
}

function assertPipelineOrdering(): void {
  const planSource = readFileSync(join(process.cwd(), 'src/generation/plan-crud-experience.ts'), 'utf8');
  const pdieIdx = planSource.indexOf('buildProductDesignModel(');
  const ppieIdx = planSource.indexOf('buildProductPresentationModel(');
  if (pdieIdx >= 0 && ppieIdx > pdieIdx) {
    pass('pipeline: product design before product presentation');
  } else {
    fail('pipeline: product design before product presentation');
  }

  const crudGen = readFileSync(
    join(process.cwd(), 'src/generation/generic/generic-crud-generator.ts'),
    'utf8',
  );
  const layoutIdx = crudGen.indexOf('buildUiLayoutHomePage(');
  const pdieApplyIdx = crudGen.indexOf('applyProductDesignToLayout(');
  const ppieApplyIdx = crudGen.indexOf('applyProductPresentationToLayout(');

  if (layoutIdx >= 0 && pdieApplyIdx > layoutIdx && ppieApplyIdx > pdieApplyIdx) {
    pass('pipeline: PPIE applied after PDIE during UI generation');
  } else {
    fail('pipeline: PPIE applied after PDIE during UI generation');
  }

  if (ppieApplyIdx >= 0 && layoutIdx < ppieApplyIdx) {
    pass('pipeline: PPIE runs before final Home.tsx assembly');
  } else {
    fail('pipeline: PPIE runs before final Home.tsx assembly');
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
    join(process.cwd(), 'src/product-presentation/product-presentation-engine.ts'),
    'utf8',
  );
  if (!engineSource.includes('originalPrompt') && !engineSource.includes('appName')) {
    pass('PPIE engine: no prompt or app name branching');
  } else {
    fail('PPIE engine: no prompt or app name branching');
  }

  if (!failures.some((f) => f.startsWith('no application-specific'))) {
    pass('no application-specific hardcoding outside catalog modules');
  }
}

function assertPlannedPresentation(testCase: (typeof PPIE_CASES)[number]): void {
  const label = testCase.label;
  const understanding = analyzePrompt(testCase.prompt);
  const buildPlan = createDraftBuildPlan(understanding);
  const architecturePlan = createArchitecturePlan(understanding, buildPlan);
  const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
  const model = planned.plan.productPresentationModel;
  const validation = validateProductPresentationModel(model);

  if (validation.valid) pass(`${label}: product presentation model validates`);
  else fail(`${label}: product presentation model validates`, validation.errors.join('; '));

  if (planned.plan.domainProfile.domainId === testCase.domainId) {
    pass(`${label}: resolved domain`);
  } else {
    fail(`${label}: resolved domain`, planned.plan.domainProfile.domainId);
  }

  if (isKnownPresentationDomain(planned.plan.domainProfile.domainId)) {
    pass(`${label}: uses known domain-specific presentation blueprint (not generic fallback)`);
  } else {
    fail(`${label}: uses known domain-specific presentation blueprint (not generic fallback)`);
  }

  if (model.presentationMode === testCase.presentationMode) pass(`${label}: presentation mode`);
  else fail(`${label}: presentation mode`, model.presentationMode);

  if (model.primarySurface === testCase.primarySurface) pass(`${label}: primary surface`);
  else fail(`${label}: primary surface`, model.primarySurface);

  if (model.secondarySurfaces.length > 0) pass(`${label}: secondary surfaces`);
  else fail(`${label}: secondary surfaces`);

  if (model.hiddenEngineeringSurfaces.length >= 3) pass(`${label}: hidden engineering surfaces`);
  else fail(`${label}: hidden engineering surfaces`);

  if (model.dashboardComposition.length > 0) pass(`${label}: dashboard composition`);
  else fail(`${label}: dashboard composition`);

  if (
    model.roleInformationPlacement === 'Engineering report only' &&
    model.riskInformationPlacement === 'Engineering report only' &&
    model.futureCapabilityPlacement === 'Engineering report only'
  ) {
    pass(`${label}: roles/risk/future capability confined to engineering report`);
  } else {
    fail(`${label}: roles/risk/future capability confined to engineering report`);
  }

  if (model.aboveTheFoldPriority.length > 0) pass(`${label}: above the fold priority`);
  else fail(`${label}: above the fold priority`);

  if (model.screenSections.length > 0) pass(`${label}: screen sections`);
  else fail(`${label}: screen sections`);

  if (model.collapsedSections.length > 0) pass(`${label}: collapsed sections`);
  else fail(`${label}: collapsed sections`);

  if (model.drawerSections.length > 0) pass(`${label}: drawer sections`);
  else fail(`${label}: drawer sections`);

  if (model.modalSections.length > 0) pass(`${label}: modal sections`);
  else fail(`${label}: modal sections`);
}

async function assertGeneratedPresentation(
  testCase: (typeof PPIE_CASES)[number],
): Promise<void> {
  const label = testCase.label;
  const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });

  if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
  else fail(`${label}: build succeeded`, report.error ?? 'failed');

  if (report.productPresentation) pass(`${label}: productPresentation on report`);
  else fail(`${label}: productPresentation on report`);

  const reportText = formatBuildReport(report);
  if (reportText.includes('Product Presentation Intelligence')) {
    pass(`${label}: engineering report section`);
  } else {
    fail(`${label}: engineering report section`);
  }

  for (const field of [
    'Presentation Mode',
    'Primary Surface',
    'Secondary Surfaces',
    'Hidden Engineering Surfaces',
    'Dashboard Composition',
    'Navigation Placement',
    'CTA Placement',
    'Search Placement',
    'Filter Placement',
    'Settings Placement',
    'Notification Placement',
    'Role Information Placement',
    'Risk Information Placement',
    'Future Capability Placement',
    'Information Density',
    'Progressive Disclosure Strategy',
    'Above The Fold Priority',
    'Screen Sections',
    'Collapsed Sections',
    'Drawer Sections',
    'Modal Sections',
    'Empty State Placement',
    'Detail View Placement',
    'Reporting Placement',
    'Mobile Presentation Strategy',
    'Presentation Confidence',
  ]) {
    if (reportText.includes(field)) pass(`${label}: report field ${field}`);
    else fail(`${label}: report field ${field}`);
  }

  if (!report.projectDir || !existsSync(join(report.projectDir, 'src/pages/Home.tsx'))) {
    fail(`${label}: Home.tsx exists`);
    return;
  }

  const homeContent = readFileSync(join(report.projectDir, 'src/pages/Home.tsx'), 'utf8');

  if (homeContent.includes(`${PRODUCT_PRESENTATION_MARKER}="presentation-driven"`)) {
    pass(`${label}: presentation-driven marker`);
  } else {
    fail(`${label}: presentation-driven marker`);
  }

  if (homeContent.includes(`${PRODUCT_PRESENTATION_MARKER}="engineering-drawer"`)) {
    pass(`${label}: engineering intelligence drawer injected`);
  } else {
    fail(`${label}: engineering intelligence drawer injected`);
  }

  const drawerIdx = homeContent.indexOf(`${PRODUCT_PRESENTATION_MARKER}="engineering-drawer"`);
  const drawerTagIdx = homeContent.lastIndexOf('<details', drawerIdx >= 0 ? drawerIdx : 0);
  const drawerOpenTag = drawerIdx >= 0 ? homeContent.slice(drawerTagIdx, drawerIdx) : '';

  if (drawerIdx >= 0 && !drawerOpenTag.includes(' open')) {
    pass(`${label}: engineering drawer collapsed by default`);
  } else {
    fail(`${label}: engineering drawer collapsed by default`);
  }

  const workflowIdx = homeContent.indexOf('workflow-journey-banner');
  const experienceIdx = homeContent.indexOf('pxie-guidance-panel');
  const architectureIdx = homeContent.indexOf('paie-architecture-panel');
  const designIdx = homeContent.indexOf('pdie-design-panel');

  if (drawerIdx >= 0 && workflowIdx > drawerTagIdx && experienceIdx > drawerTagIdx) {
    pass(`${label}: workflow and experience planning panels moved into drawer`);
  } else {
    fail(`${label}: workflow and experience planning panels moved into drawer`);
  }

  if (drawerIdx >= 0 && architectureIdx > drawerTagIdx) {
    pass(`${label}: product architecture metadata is not shown as primary user content`);
  } else {
    fail(`${label}: product architecture metadata is not shown as primary user content`);
  }

  if (drawerIdx >= 0 && designIdx > drawerTagIdx) {
    pass(`${label}: product design metadata moved into drawer`);
  } else {
    fail(`${label}: product design metadata moved into drawer`);
  }

  if (homeContent.includes(WORKFLOW_MARKER)) pass(`${label}: workflow markers preserved`);
  else fail(`${label}: workflow markers preserved`);

  if (homeContent.includes(PRODUCT_EXPERIENCE_MARKER)) pass(`${label}: product experience markers preserved`);
  else fail(`${label}: product experience markers preserved`);

  if (homeContent.includes(PRODUCT_ARCHITECTURE_MARKER)) {
    pass(`${label}: product architecture markers preserved`);
  } else {
    fail(`${label}: product architecture markers preserved`);
  }

  if (homeContent.includes(PRODUCT_DESIGN_MARKER)) pass(`${label}: product design markers preserved`);
  else fail(`${label}: product design markers preserved`);

  if (homeContent.includes('paie-product-nav')) pass(`${label}: primary product navigation preserved`);
  else fail(`${label}: primary product navigation preserved`);

  if (homeContent.includes(`data-domain-layout="${testCase.domainId}"`)) {
    pass(`${label}: domain-specific primary surface present in UI`);
  } else {
    fail(`${label}: domain-specific primary surface present in UI`);
  }

  if (homeContent.includes('<NavigationHeader')) pass(`${label}: navigation header present`);
  else fail(`${label}: navigation header present`);

  if (homeContent.includes('SearchBar')) pass(`${label}: search functionality present`);
  else fail(`${label}: search functionality present`);

  if (homeContent.includes('FilterBar')) pass(`${label}: filter functionality present`);
  else fail(`${label}: filter functionality present`);

  if (homeContent.includes('openCreate')) pass(`${label}: add/create functionality present`);
  else fail(`${label}: add/create functionality present`);

  if (homeContent.includes('openEdit') || homeContent.includes('EntityFormView')) {
    pass(`${label}: edit functionality present`);
  } else {
    fail(`${label}: edit functionality present`);
  }

  if (homeContent.includes('deleteItem') || homeContent.includes('ConfirmationDialog')) {
    pass(`${label}: delete functionality present`);
  } else {
    fail(`${label}: delete functionality present`);
  }

  if (homeContent.includes('data-accessibility=')) pass(`${label}: accessibility attributes preserved`);
  else fail(`${label}: accessibility attributes preserved`);
}

function assertDomainDifferentiation(): void {
  const models = PPIE_CASES.map((testCase) => {
    const understanding = analyzePrompt(testCase.prompt);
    const buildPlan = createDraftBuildPlan(understanding);
    const architecturePlan = createArchitecturePlan(understanding, buildPlan);
    const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
    return { label: testCase.label, model: planned.plan.productPresentationModel };
  });

  const signatures = new Set(
    models.map(
      ({ model }) =>
        `${model.presentationMode}|${model.primarySurface}|${model.dashboardComposition.join(',')}`,
    ),
  );

  if (signatures.size === models.length) {
    pass('domain intelligence: every known domain has a distinct presentation strategy');
  } else {
    fail(
      'domain intelligence: every known domain has a distinct presentation strategy',
      `${signatures.size} unique of ${models.length}`,
    );
  }
}

function assertGenericInference(): void {
  const understandingBooking = analyzePrompt(PPIE_CASES[0].prompt);
  const bookingModel = planCrudExperience({
    understanding: understandingBooking,
    buildPlan: createDraftBuildPlan(understandingBooking),
    architecturePlan: createArchitecturePlan(understandingBooking, createDraftBuildPlan(understandingBooking)),
  }).plan.productPresentationModel;

  const genericModels = GENERIC_CASES.map((testCase) => {
    const understanding = analyzePrompt(testCase.prompt);
    const buildPlan = createDraftBuildPlan(understanding);
    const architecturePlan = createArchitecturePlan(understanding, buildPlan);
    const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
    return {
      label: testCase.label,
      domainId: planned.plan.domainProfile.domainId,
      model: planned.plan.productPresentationModel,
    };
  });

  for (const { label, model } of genericModels) {
    const validation = validateProductPresentationModel(model);
    if (validation.valid) pass(`${label}: generic inferred presentation model validates`);
    else fail(`${label}: generic inferred presentation model validates`, validation.errors.join('; '));
  }

  const differsFromBooking = genericModels.some(
    ({ model }) =>
      model.primarySurface !== bookingModel.primarySurface ||
      model.presentationMode !== bookingModel.presentationMode,
  );
  if (differsFromBooking) {
    pass('generic fallback: infers presentation distinct from a known domain (no universal style)');
  } else {
    fail('generic fallback: infers presentation distinct from a known domain (no universal style)');
  }
}

function assertWebUi(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('card-product-presentation')) pass('web UI: Product Presentation report card');
  else fail('web UI: Product Presentation report card');

  if (appJs.includes('renderProductPresentation')) pass('web UI: renderProductPresentation implemented');
  else fail('web UI: renderProductPresentation implemented');

  if (appJs.includes("['product-presentation', 'card-product-presentation']")) {
    pass('web UI: product presentation in REPORT_CARD_MAP');
  } else {
    fail('web UI: product presentation in REPORT_CARD_MAP');
  }

  if (indexHtml.includes('sidebar-presentation-summary')) {
    pass('web UI: sidebar compact presentation summary');
  } else {
    fail('web UI: sidebar compact presentation summary');
  }

  if (appJs.includes('sidebar-presentation-summary')) pass('web UI: sidebar presentation populated');
  else fail('web UI: sidebar presentation populated');
}

export async function runProductPresentationIntelligenceRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nProduct Presentation Intelligence Engine regression\n');

  console.log('── PPIE modules ──\n');
  assertModulesExist();

  console.log('\n── Pipeline ordering ──\n');
  assertPipelineOrdering();

  console.log('\n── Domain-driven design ──\n');
  assertNoForbiddenHardcoding();

  console.log('\n── Planned product presentation ──\n');
  for (const testCase of PPIE_CASES) {
    assertPlannedPresentation(testCase);
  }

  console.log('\n── Domain differentiation ──\n');
  assertDomainDifferentiation();

  console.log('\n── Generic domain inference ──\n');
  assertGenericInference();

  console.log('\n── Generated product presentation ──\n');
  for (const testCase of PPIE_CASES) {
    await assertGeneratedPresentation(testCase);
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
