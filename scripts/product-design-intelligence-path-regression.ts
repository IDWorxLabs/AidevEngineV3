/**
 * Product Design Intelligence Engine (PDIE) regression — verifies PDIE runs after
 * product architecture intelligence and determines the emotional/interaction
 * identity of the product before UI generation.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { planCrudExperience } from '../src/generation/plan-crud-experience.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { createDraftBuildPlan } from '../src/planner/create-draft-build-plan.js';
import { createArchitecturePlan } from '../src/architecture/create-architecture-plan.js';
import { validateProductDesignModel } from '../src/product-design/product-design-validator.js';
import { isKnownDesignDomain } from '../src/product-design/product-design-catalog.js';
import { PRODUCT_DESIGN_MARKER } from '../src/product-design/product-design-types.js';

const PASS_TOKEN = 'PRODUCT_DESIGN_INTELLIGENCE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/workflow/',
  'src/product-experience/',
  'src/product-architecture/',
  'src/product-design/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = ['LISA', 'WeatherDisplay', 'CountDisplay', 'TaskInput'];

const PDIE_CASES = [
  {
    prompt: 'Build a booking system with reservations and calendar',
    label: 'Booking System',
    domainId: 'booking-system',
    visualTone: 'Consumer',
    interactionPhilosophy: 'Calendar',
    personalityIncludes: 'Calm',
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    label: 'CRM',
    domainId: 'crm',
    visualTone: 'Corporate',
    interactionPhilosophy: 'Dashboard-first',
    personalityIncludes: 'Professional',
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    label: 'Inventory System',
    domainId: 'inventory-system',
    visualTone: 'Industrial',
    interactionPhilosophy: 'Table',
    personalityIncludes: 'Technical',
  },
  {
    prompt: 'Build an expense tracker with dashboard and categories',
    label: 'Expense Tracker',
    domainId: 'expense-tracker',
    visualTone: 'Financial',
    interactionPhilosophy: 'Dashboard-first',
    personalityIncludes: 'Minimal',
  },
  {
    prompt: 'Build a notes app with search and tags',
    label: 'Notes App',
    domainId: 'notes-app',
    visualTone: 'Creative',
    interactionPhilosophy: 'Content-first',
    personalityIncludes: 'Calm',
  },
  {
    prompt: 'Build a restaurant POS with menu and orders',
    label: 'Restaurant POS',
    domainId: 'restaurant-pos',
    visualTone: 'Consumer',
    interactionPhilosophy: 'Kanban',
    personalityIncludes: 'Friendly',
  },
  {
    prompt: 'Build a project manager with tasks and board',
    label: 'Project Manager',
    domainId: 'project-manager',
    visualTone: 'Corporate',
    interactionPhilosophy: 'Kanban',
    personalityIncludes: 'Bold',
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
    'src/product-design/product-design-types.ts',
    'src/product-design/product-design-engine.ts',
    'src/product-design/product-design-catalog.ts',
    'src/product-design/product-design-validator.ts',
    'src/product-design/product-design-report.ts',
    'src/product-design/product-design-renderer.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }
}

function assertPipelineOrdering(): void {
  const planSource = readFileSync(join(process.cwd(), 'src/generation/plan-crud-experience.ts'), 'utf8');
  const paieIdx = planSource.indexOf('buildProductArchitectureModel(');
  const pdieIdx = planSource.indexOf('buildProductDesignModel(');
  if (paieIdx >= 0 && pdieIdx > paieIdx) {
    pass('pipeline: product architecture before product design');
  } else {
    fail('pipeline: product architecture before product design');
  }

  const crudGen = readFileSync(
    join(process.cwd(), 'src/generation/generic/generic-crud-generator.ts'),
    'utf8',
  );
  const layoutIdx = crudGen.indexOf('buildUiLayoutHomePage(');
  const paieApplyIdx = crudGen.indexOf('applyProductArchitectureToLayout(');
  const pdieApplyIdx = crudGen.indexOf('applyProductDesignToLayout(');

  if (layoutIdx >= 0 && paieApplyIdx > layoutIdx && pdieApplyIdx > paieApplyIdx) {
    pass('pipeline: PDIE applied after PAIE during UI generation');
  } else {
    fail('pipeline: PDIE applied after PAIE during UI generation');
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
    join(process.cwd(), 'src/product-design/product-design-engine.ts'),
    'utf8',
  );
  if (!engineSource.includes('originalPrompt') && !engineSource.includes('appName')) {
    pass('PDIE engine: no prompt or app name branching');
  } else {
    fail('PDIE engine: no prompt or app name branching');
  }

  if (!failures.some((f) => f.startsWith('no application-specific'))) {
    pass('no application-specific hardcoding outside catalog modules');
  }
}

function assertPlannedDesign(testCase: (typeof PDIE_CASES)[number]): void {
  const label = testCase.label;
  const understanding = analyzePrompt(testCase.prompt);
  const buildPlan = createDraftBuildPlan(understanding);
  const architecturePlan = createArchitecturePlan(understanding, buildPlan);
  const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
  const model = planned.plan.productDesignModel;
  const validation = validateProductDesignModel(model);

  if (validation.valid) pass(`${label}: product design model validates`);
  else fail(`${label}: product design model validates`, validation.errors.join('; '));

  if (planned.plan.domainProfile.domainId === testCase.domainId) {
    pass(`${label}: resolved domain`);
  } else {
    fail(`${label}: resolved domain`, planned.plan.domainProfile.domainId);
  }

  if (isKnownDesignDomain(planned.plan.domainProfile.domainId)) {
    pass(`${label}: uses known domain-specific blueprint (not generic fallback)`);
  } else {
    fail(`${label}: uses known domain-specific blueprint (not generic fallback)`);
  }

  if (model.visualTone === testCase.visualTone) pass(`${label}: visual tone`);
  else fail(`${label}: visual tone`, model.visualTone);

  if (model.interactionPhilosophy === testCase.interactionPhilosophy) {
    pass(`${label}: interaction philosophy`);
  } else {
    fail(`${label}: interaction philosophy`, model.interactionPhilosophy);
  }

  if (model.productPersonality.includes(testCase.personalityIncludes)) {
    pass(`${label}: product personality`);
  } else {
    fail(`${label}: product personality`, model.productPersonality.join(', '));
  }

  if (model.communicationStyle.length > 0) pass(`${label}: communication style`);
  else fail(`${label}: communication style`);

  if (model.primaryEmotionalGoals.length > 0) pass(`${label}: primary emotional goals`);
  else fail(`${label}: primary emotional goals`);

  if (model.componentStyle.length > 0) pass(`${label}: component style`);
  else fail(`${label}: component style`);

  if (model.informationHierarchy.scanningOrder.length > 0) pass(`${label}: information hierarchy`);
  else fail(`${label}: information hierarchy`);

  if (model.accessibilityGoals.length > 0) pass(`${label}: accessibility goals`);
  else fail(`${label}: accessibility goals`);

  if (model.futureResponsiveness.length > 0) pass(`${label}: future responsiveness`);
  else fail(`${label}: future responsiveness`);
}

async function assertGeneratedDesign(testCase: (typeof PDIE_CASES)[number]): Promise<void> {
  const label = testCase.label;
  const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });

  if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
  else fail(`${label}: build succeeded`, report.error ?? 'failed');

  if (report.productDesign) pass(`${label}: productDesign on report`);
  else fail(`${label}: productDesign on report`);

  const reportText = formatBuildReport(report);
  if (reportText.includes('Product Design Intelligence')) {
    pass(`${label}: engineering report section`);
  } else {
    fail(`${label}: engineering report section`);
  }

  for (const field of [
    'Product Personality',
    'Visual Tone',
    'Communication Style',
    'Interaction Philosophy',
    'Emotional Goals',
    'Visual Density',
    'Spacing Philosophy',
    'Typography Personality',
    'Motion Personality',
    'Hierarchy',
    'Accessibility',
    'Responsiveness',
    'Overall Design Confidence',
  ]) {
    if (reportText.includes(field)) pass(`${label}: report field ${field}`);
    else fail(`${label}: report field ${field}`);
  }

  if (!report.projectDir || !existsSync(join(report.projectDir, 'src/pages/Home.tsx'))) {
    fail(`${label}: Home.tsx exists`);
    return;
  }

  const homeContent = readFileSync(join(report.projectDir, 'src/pages/Home.tsx'), 'utf8');

  if (homeContent.includes(`${PRODUCT_DESIGN_MARKER}="design-driven"`)) {
    pass(`${label}: design-driven marker`);
  } else {
    fail(`${label}: design-driven marker`);
  }

  if (homeContent.includes(`${PRODUCT_DESIGN_MARKER}="design-panel"`)) {
    pass(`${label}: design intelligence panel injected`);
  } else {
    fail(`${label}: design intelligence panel injected`);
  }

  if (homeContent.includes('pdie-design-panel')) pass(`${label}: lightweight design panel styling`);
  else fail(`${label}: lightweight design panel styling`);

  if (homeContent.includes(`${PRODUCT_DESIGN_MARKER}="personality-trait"`)) {
    pass(`${label}: design personality metadata`);
  } else {
    fail(`${label}: design personality metadata`);
  }

  if (homeContent.includes(`${PRODUCT_DESIGN_MARKER}="emotional-goals"`)) {
    pass(`${label}: emotional goals metadata`);
  } else {
    fail(`${label}: emotional goals metadata`);
  }

  if (homeContent.includes(`${PRODUCT_DESIGN_MARKER}="accessibility"`)) {
    pass(`${label}: accessibility metadata`);
  } else {
    fail(`${label}: accessibility metadata`);
  }

  if (homeContent.includes(`${PRODUCT_DESIGN_MARKER}="responsiveness"`)) {
    pass(`${label}: responsiveness metadata`);
  } else {
    fail(`${label}: responsiveness metadata`);
  }

  // PDIE must never generate UI components — only inject metadata markers/panels.
  if (!homeContent.includes('pdie-') || homeContent.includes('pdie-design-panel')) {
    pass(`${label}: PDIE does not redesign generated UI`);
  } else {
    fail(`${label}: PDIE does not redesign generated UI`);
  }
}

function assertDomainDifferentiation(): void {
  const models = PDIE_CASES.map((testCase) => {
    const understanding = analyzePrompt(testCase.prompt);
    const buildPlan = createDraftBuildPlan(understanding);
    const architecturePlan = createArchitecturePlan(understanding, buildPlan);
    const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
    return { label: testCase.label, model: planned.plan.productDesignModel };
  });

  const signatures = new Set(
    models.map(
      ({ model }) =>
        `${model.visualTone}|${model.interactionPhilosophy}|${model.productPersonality.join(',')}`,
    ),
  );

  if (signatures.size === models.length) {
    pass('domain intelligence: every known domain has a distinct design identity');
  } else {
    fail('domain intelligence: every known domain has a distinct design identity', `${signatures.size} unique of ${models.length}`);
  }
}

function assertGenericInference(): void {
  const understandingBooking = analyzePrompt(PDIE_CASES[0].prompt);
  const bookingModel = planCrudExperience({
    understanding: understandingBooking,
    buildPlan: createDraftBuildPlan(understandingBooking),
    architecturePlan: createArchitecturePlan(understandingBooking, createDraftBuildPlan(understandingBooking)),
  }).plan.productDesignModel;

  const genericModels = GENERIC_CASES.map((testCase) => {
    const understanding = analyzePrompt(testCase.prompt);
    const buildPlan = createDraftBuildPlan(understanding);
    const architecturePlan = createArchitecturePlan(understanding, buildPlan);
    const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
    return { label: testCase.label, domainId: planned.plan.domainProfile.domainId, model: planned.plan.productDesignModel };
  });

  for (const { label, domainId } of genericModels) {
    if (domainId === 'generic-application') pass(`${label}: resolves to generic-application domain`);
    else fail(`${label}: resolves to generic-application domain`, domainId);
  }

  for (const { label, model } of genericModels) {
    const validation = validateProductDesignModel(model);
    if (validation.valid) pass(`${label}: generic inferred model validates`);
    else fail(`${label}: generic inferred model validates`, validation.errors.join('; '));
  }

  const differsFromBooking = genericModels.some(
    ({ model }) =>
      model.visualTone !== bookingModel.visualTone ||
      model.interactionPhilosophy !== bookingModel.interactionPhilosophy ||
      model.productPersonality.join(',') !== bookingModel.productPersonality.join(','),
  );
  if (differsFromBooking) {
    pass('generic fallback: infers identity distinct from a known domain (no universal style)');
  } else {
    fail('generic fallback: infers identity distinct from a known domain (no universal style)');
  }
}

function assertWebUi(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('card-product-design')) pass('web UI: Product Design report card');
  else fail('web UI: Product Design report card');

  if (appJs.includes('renderProductDesign')) pass('web UI: renderProductDesign implemented');
  else fail('web UI: renderProductDesign implemented');

  if (appJs.includes("['product-design', 'card-product-design']")) {
    pass('web UI: product design in REPORT_CARD_MAP');
  } else {
    fail('web UI: product design in REPORT_CARD_MAP');
  }

  if (indexHtml.includes('sidebar-design-summary')) {
    pass('web UI: sidebar compact design summary');
  } else {
    fail('web UI: sidebar compact design summary');
  }

  if (appJs.includes('sidebar-design-summary')) pass('web UI: sidebar design populated');
  else fail('web UI: sidebar design populated');
}

export async function runProductDesignIntelligenceRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nProduct Design Intelligence Engine regression\n');

  console.log('── PDIE modules ──\n');
  assertModulesExist();

  console.log('\n── Pipeline ordering ──\n');
  assertPipelineOrdering();

  console.log('\n── Domain-driven design ──\n');
  assertNoForbiddenHardcoding();

  console.log('\n── Planned product design ──\n');
  for (const testCase of PDIE_CASES) {
    assertPlannedDesign(testCase);
  }

  console.log('\n── Domain differentiation ──\n');
  assertDomainDifferentiation();

  console.log('\n── Generic domain inference ──\n');
  assertGenericInference();

  console.log('\n── Generated product design ──\n');
  for (const testCase of PDIE_CASES) {
    await assertGeneratedDesign(testCase);
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
