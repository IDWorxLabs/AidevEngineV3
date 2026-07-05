/**
 * Product Architecture Intelligence Engine regression — verifies PAIE runs after
 * product experience intelligence and shapes generated product structure.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { planCrudExperience } from '../src/generation/plan-crud-experience.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { createDraftBuildPlan } from '../src/planner/create-draft-build-plan.js';
import { createArchitecturePlan } from '../src/architecture/create-architecture-plan.js';
import { validateProductArchitectureModel } from '../src/product-architecture/product-architecture-validator.js';
import { PRODUCT_ARCHITECTURE_MARKER } from '../src/product-architecture/product-architecture-types.js';

const PASS_TOKEN = 'PRODUCT_ARCHITECTURE_INTELLIGENCE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/workflow/',
  'src/product-experience/',
  'src/product-architecture/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = ['LISA', 'WeatherDisplay', 'CountDisplay', 'TaskInput'];

const PAIE_CASES = [
  {
    prompt: 'Build a booking system with reservations and calendar',
    productType: 'Scheduling product',
    primaryModule: 'Schedule',
    role: 'Owner',
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    productType: 'Sales operations product',
    primaryModule: 'Pipeline',
    role: 'Sales rep',
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    productType: 'Operations management product',
    primaryModule: 'Products',
    role: 'Warehouse manager',
  },
  {
    prompt: 'Build an expense tracker with dashboard and categories',
    productType: 'Finance tracking product',
    primaryModule: 'Transactions',
    role: 'Owner',
  },
  {
    prompt: 'Build a notes app with search and tags',
    productType: 'Knowledge workspace product',
    primaryModule: 'Notes',
    role: 'Owner',
  },
  {
    prompt: 'Build a restaurant POS with menu and orders',
    productType: 'Transaction/order operations product',
    primaryModule: 'Orders',
    role: 'Cashier',
  },
  {
    prompt: 'Build a project manager with tasks and board',
    productType: 'Work management product',
    primaryModule: 'Tasks',
    role: 'Member',
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
    'src/product-architecture/product-architecture-types.ts',
    'src/product-architecture/product-architecture-engine.ts',
    'src/product-architecture/product-architecture-catalog.ts',
    'src/product-architecture/product-architecture-validator.ts',
    'src/product-architecture/product-architecture-report.ts',
    'src/product-architecture/product-architecture-renderer.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }
}

function assertPipelineOrdering(): void {
  const planSource = readFileSync(join(process.cwd(), 'src/generation/plan-crud-experience.ts'), 'utf8');
  const pxieIdx = planSource.indexOf('buildProductExperienceModel(');
  const paieIdx = planSource.indexOf('buildProductArchitectureModel(');
  if (pxieIdx >= 0 && paieIdx > pxieIdx) {
    pass('pipeline: product experience before product architecture');
  } else {
    fail('pipeline: product experience before product architecture');
  }

  const crudGen = readFileSync(
    join(process.cwd(), 'src/generation/generic/generic-crud-generator.ts'),
    'utf8',
  );
  const layoutIdx = crudGen.indexOf('buildUiLayoutHomePage(');
  const pxieApplyIdx = crudGen.indexOf('applyProductExperienceToLayout(');
  const paieApplyIdx = crudGen.indexOf('applyProductArchitectureToLayout(');

  if (layoutIdx >= 0 && pxieApplyIdx > layoutIdx && paieApplyIdx > pxieApplyIdx) {
    pass('pipeline: PAIE applied after PXIE during UI generation');
  } else {
    fail('pipeline: PAIE applied after PXIE during UI generation');
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
    join(process.cwd(), 'src/product-architecture/product-architecture-engine.ts'),
    'utf8',
  );
  if (!engineSource.includes('originalPrompt') && !engineSource.includes('appName')) {
    pass('PAIE engine: no prompt or app name branching');
  } else {
    fail('PAIE engine: no prompt or app name branching');
  }

  if (!failures.some((f) => f.startsWith('no application-specific'))) {
    pass('no application-specific hardcoding outside catalog modules');
  }
}

function assertPlannedArchitecture(testCase: (typeof PAIE_CASES)[number]): void {
  const label = testCase.productType;
  const understanding = analyzePrompt(testCase.prompt);
  const buildPlan = createDraftBuildPlan(understanding);
  const architecturePlan = createArchitecturePlan(understanding, buildPlan);
  const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
  const model = planned.plan.productArchitectureModel;
  const validation = validateProductArchitectureModel(model);

  if (validation.valid) pass(`${label}: product architecture model validates`);
  else fail(`${label}: product architecture model validates`, validation.errors.join('; '));

  if (model.productType === testCase.productType) pass(`${label}: product type`);
  else fail(`${label}: product type`, model.productType);

  if (model.primaryModules.some((m) => m.includes(testCase.primaryModule.split(' ')[0]!))) {
    pass(`${label}: primary modules`);
  } else {
    fail(`${label}: primary modules`, model.primaryModules.join(', '));
  }

  if (model.secondaryModules.length > 0) pass(`${label}: secondary modules`);
  else fail(`${label}: secondary modules`);

  if (model.userRoles.some((r) => r.includes(testCase.role.split(' ')[0]!))) {
    pass(`${label}: user roles`);
  } else {
    fail(`${label}: user roles`, model.userRoles.join(', '));
  }

  if (model.permissionModel.length > 0) pass(`${label}: permission model`);
  else fail(`${label}: permission model`);

  if (model.dataEntities.length > 0) pass(`${label}: data entities`);
  else fail(`${label}: data entities`);

  if (model.entityRelationships.length > 0) pass(`${label}: entity relationships`);
  else fail(`${label}: entity relationships`);

  if (model.productBoundaries.includedNow.length > 0) pass(`${label}: product boundaries`);
  else fail(`${label}: product boundaries`);

  if (model.navigationArchitecture.length > 0) pass(`${label}: navigation architecture`);
  else fail(`${label}: navigation architecture`);

  if (model.notificationModel.length > 0) pass(`${label}: notification model`);
  else fail(`${label}: notification model`);

  if (model.integrationReadiness.length > 0) pass(`${label}: integration readiness`);
  else fail(`${label}: integration readiness`);

  if (model.extensibilityPlan.length > 0) pass(`${label}: extensibility plan`);
  else fail(`${label}: extensibility plan`);

  if (model.riskAreas.length > 0) pass(`${label}: risk areas`);
  else fail(`${label}: risk areas`);

  if (model.futureCapabilities.length > 0) pass(`${label}: future capabilities`);
  else fail(`${label}: future capabilities`);
}

async function assertGeneratedArchitecture(
  testCase: (typeof PAIE_CASES)[number],
): Promise<void> {
  const label = testCase.productType;
  const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });

  if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
  else fail(`${label}: build succeeded`, report.error ?? 'failed');

  if (report.productArchitecture) pass(`${label}: productArchitecture on report`);
  else fail(`${label}: productArchitecture on report`);

  const reportText = formatBuildReport(report);
  if (reportText.includes('Product Architecture Intelligence')) {
    pass(`${label}: engineering report section`);
  } else {
    fail(`${label}: engineering report section`);
  }

  for (const field of [
    'Product Type',
    'Product Goal',
    'Primary Modules',
    'User Roles',
    'Permission Model',
    'Entity Relationships',
    'Navigation Architecture',
    'Architecture Confidence',
  ]) {
    if (reportText.includes(field)) pass(`${label}: report field ${field}`);
    else fail(`${label}: report field ${field}`);
  }

  if (!report.projectDir || !existsSync(join(report.projectDir, 'src/pages/Home.tsx'))) {
    fail(`${label}: Home.tsx exists`);
    return;
  }

  const homeContent = readFileSync(join(report.projectDir, 'src/pages/Home.tsx'), 'utf8');

  if (homeContent.includes(`${PRODUCT_ARCHITECTURE_MARKER}="architecture-driven"`)) {
    pass(`${label}: architecture-driven marker`);
  } else {
    fail(`${label}: architecture-driven marker`);
  }

  if (homeContent.includes(`${PRODUCT_ARCHITECTURE_MARKER}="product-navigation"`)) {
    pass(`${label}: product navigation marker`);
  } else {
    fail(`${label}: product navigation marker`);
  }

  if (homeContent.includes('paie-product-nav')) pass(`${label}: lightweight product navigation`);
  else fail(`${label}: lightweight product navigation`);

  if (homeContent.includes(`${PRODUCT_ARCHITECTURE_MARKER}="roles"`)) {
    pass(`${label}: role-readiness hint`);
  } else {
    fail(`${label}: role-readiness hint`);
  }

  if (homeContent.includes(`${PRODUCT_ARCHITECTURE_MARKER}="settings-ready"`)) {
    pass(`${label}: settings readiness hint`);
  } else {
    fail(`${label}: settings readiness hint`);
  }

  if (homeContent.includes(`${PRODUCT_ARCHITECTURE_MARKER}="notification-ready"`)) {
    pass(`${label}: notification readiness hint`);
  } else {
    fail(`${label}: notification readiness hint`);
  }
}

function assertWebUi(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('card-product-architecture')) pass('web UI: Product Architecture report card');
  else fail('web UI: Product Architecture report card');

  if (appJs.includes('renderProductArchitecture')) pass('web UI: renderProductArchitecture implemented');
  else fail('web UI: renderProductArchitecture implemented');

  if (appJs.includes("['product-architecture', 'card-product-architecture']")) {
    pass('web UI: product architecture in REPORT_CARD_MAP');
  } else {
    fail('web UI: product architecture in REPORT_CARD_MAP');
  }

  if (indexHtml.includes('sidebar-architecture-summary')) {
    pass('web UI: sidebar compact architecture summary');
  } else {
    fail('web UI: sidebar compact architecture summary');
  }

  if (appJs.includes('sidebar-architecture-summary')) pass('web UI: sidebar architecture populated');
  else fail('web UI: sidebar architecture populated');
}

export async function runProductArchitectureIntelligenceRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nProduct Architecture Intelligence Engine regression\n');

  console.log('── PAIE modules ──\n');
  assertModulesExist();

  console.log('\n── Pipeline ordering ──\n');
  assertPipelineOrdering();

  console.log('\n── Domain-driven design ──\n');
  assertNoForbiddenHardcoding();

  console.log('\n── Planned product architecture ──\n');
  for (const testCase of PAIE_CASES) {
    assertPlannedArchitecture(testCase);
  }

  console.log('\n── Generated product architecture ──\n');
  for (const testCase of PAIE_CASES) {
    await assertGeneratedArchitecture(testCase);
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
