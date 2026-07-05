/**
 * Workflow Intelligence Engine regression — verifies journey-first planning
 * executes before UI generation and drives generated application structure.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { planCrudExperience } from '../src/generation/plan-crud-experience.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { createDraftBuildPlan } from '../src/planner/create-draft-build-plan.js';
import { createArchitecturePlan } from '../src/architecture/create-architecture-plan.js';
import { validateWorkflowModel } from '../src/workflow/workflow-validator.js';
import { WORKFLOW_MARKER } from '../src/workflow/workflow-types.js';
import type { WorkflowNavigationModel } from '../src/workflow/workflow-types.js';

const PASS_TOKEN = 'WORKFLOW_INTELLIGENCE_ENGINE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/workflow/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = ['LISA', 'WeatherDisplay', 'CountDisplay', 'TaskInput'];

const WORKFLOW_CASES = [
  {
    prompt: 'Build a booking system with reservations and calendar',
    expectedEntry: "Today's Schedule",
    expectedNav: 'Calendar' as WorkflowNavigationModel,
    criticalAction: 'Create Booking',
  },
  {
    prompt: 'Build a CRM with customer list and pipeline',
    expectedEntry: 'Sales Pipeline',
    expectedNav: 'Kanban' as WorkflowNavigationModel,
    criticalAction: 'Move Lead',
  },
  {
    prompt: 'Build an inventory system with low stock alerts',
    expectedEntry: 'Inventory Overview',
    expectedNav: 'Master Detail' as WorkflowNavigationModel,
    criticalAction: 'Adjust Stock',
  },
  {
    prompt: 'Build a recipe manager with categories and favorites',
    expectedEntry: 'Recipe Browser',
    expectedNav: 'Master Detail' as WorkflowNavigationModel,
    criticalAction: 'Open Recipe',
  },
  {
    prompt: 'Build an expense tracker with dashboard and categories',
    expectedEntry: 'Financial Dashboard',
    expectedNav: 'Dashboard' as WorkflowNavigationModel,
    criticalAction: 'Add Transaction',
  },
  {
    prompt: 'Build a notes app with search and tags',
    expectedEntry: 'Recent Notes',
    expectedNav: 'Editor' as WorkflowNavigationModel,
    criticalAction: 'Edit Note',
  },
  {
    prompt: 'Build a habit tracker with streaks and weekly overview',
    expectedEntry: "Today's Checklist",
    expectedNav: 'Dashboard' as WorkflowNavigationModel,
    criticalAction: 'Complete Habit',
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
    'src/workflow/workflow-types.ts',
    'src/workflow/workflow-engine.ts',
    'src/workflow/workflow-catalog.ts',
    'src/workflow/workflow-report.ts',
    'src/workflow/workflow-validator.ts',
    'src/workflow/workflow-renderer.ts',
    'src/generation/plan-crud-experience.ts',
  ]) {
    if (existsSync(join(process.cwd(), file))) pass(`module exists: ${file}`);
    else fail(`module exists: ${file}`);
  }
}

function assertPipelineOrdering(): void {
  const orchestrator = readFileSync(join(process.cwd(), 'src/build/orchestrator.ts'), 'utf8');
  const planIdx = orchestrator.indexOf('planCrudExperience(');
  const guidedIdx = orchestrator.indexOf('buildArchitectureGuidedWorkspace(');
  if (planIdx >= 0 && guidedIdx >= 0 && planIdx < guidedIdx) {
    pass('pipeline: planCrudExperience before architecture-guided generation');
  } else {
    fail('pipeline: planCrudExperience before architecture-guided generation');
  }

  const planSource = readFileSync(join(process.cwd(), 'src/generation/plan-crud-experience.ts'), 'utf8');
  const uiIdx = planSource.indexOf('selectUiStrategy(');
  const workflowIdx = planSource.indexOf('buildWorkflowModel(');
  if (uiIdx >= 0 && workflowIdx >= 0 && uiIdx < workflowIdx) {
    pass('pipeline: UI strategy before workflow intelligence');
  } else {
    fail('pipeline: UI strategy before workflow intelligence');
  }

  const crudGen = readFileSync(
    join(process.cwd(), 'src/generation/generic/generic-crud-generator.ts'),
    'utf8',
  );
  if (crudGen.includes('experiencePlan') && !crudGen.includes('selectUiStrategy(')) {
    pass('pipeline: generic CRUD consumes experiencePlan (no inline UI strategy)');
  } else {
    fail('pipeline: generic CRUD consumes experiencePlan (no inline UI strategy)');
  }

  const layoutIdx = crudGen.indexOf('buildUiLayoutHomePage(');
  const applyIdx = crudGen.indexOf('applyWorkflowToLayout(');
  if (layoutIdx >= 0 && applyIdx >= 0 && layoutIdx < applyIdx) {
    pass('pipeline: workflow applied during UI generation phase');
  } else {
    fail('pipeline: workflow applied during UI generation phase');
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

  const engineSource = readFileSync(join(process.cwd(), 'src/workflow/workflow-engine.ts'), 'utf8');
  if (!engineSource.includes('prompt') && !engineSource.includes('appName')) {
    pass('workflow engine: no prompt or app name branching');
  } else {
    fail('workflow engine: no prompt or app name branching');
  }

  if (!failures.some((f) => f.startsWith('no application-specific'))) {
    pass('no application-specific hardcoding');
  }
}

function assertPlannedWorkflow(testCase: (typeof WORKFLOW_CASES)[number]): void {
  const label = testCase.expectedNav;
  const understanding = analyzePrompt(testCase.prompt);
  const buildPlan = createDraftBuildPlan(understanding);
  const architecturePlan = createArchitecturePlan(understanding, buildPlan);
  const planned = planCrudExperience({ understanding, buildPlan, architecturePlan });
  const model = planned.plan.workflowModel;
  const validation = validateWorkflowModel(model);

  if (validation.valid) pass(`${label}: workflow model validates`);
  else fail(`${label}: workflow model validates`, validation.errors.join('; '));

  if (model.primaryWorkflow.kind === 'primary') pass(`${label}: primary workflow exists`);
  else fail(`${label}: primary workflow exists`);

  if (model.entryScreen === testCase.expectedEntry) pass(`${label}: entry screen ${testCase.expectedEntry}`);
  else fail(`${label}: entry screen ${testCase.expectedEntry}`, model.entryScreen);

  if (model.completionScreen?.trim()) pass(`${label}: completion screen defined`);
  else fail(`${label}: completion screen defined`);

  if (model.navigationModel === testCase.expectedNav) pass(`${label}: navigation ${testCase.expectedNav}`);
  else fail(`${label}: navigation ${testCase.expectedNav}`, model.navigationModel);

  if (model.criticalActions.includes(testCase.criticalAction)) {
    pass(`${label}: critical action ${testCase.criticalAction}`);
  } else {
    fail(`${label}: critical action ${testCase.criticalAction}`, model.criticalActions.join(', '));
  }

  if (model.workflowSteps.length >= 4) pass(`${label}: connected workflow steps`);
  else fail(`${label}: connected workflow steps`, String(model.workflowSteps.length));

  if (model.dataTransitions.length > 0) pass(`${label}: data transitions`);
  else fail(`${label}: data transitions`);

  if (model.interactionPatterns.length > 0) pass(`${label}: interaction patterns`);
  else fail(`${label}: interaction patterns`);

  if (model.successCriteria.length > 0) pass(`${label}: success criteria`);
  else fail(`${label}: success criteria`);

  if (model.screens.some((screen) => screen.priority === 'PRIMARY')) {
    pass(`${label}: PRIMARY screen priority`);
  } else {
    fail(`${label}: PRIMARY screen priority`);
  }
}

async function assertGeneratedWorkflow(testCase: (typeof WORKFLOW_CASES)[number]): Promise<void> {
  const label = testCase.expectedNav;
  const report = await buildFromPrompt({ prompt: testCase.prompt, skipPreview: true });

  if (report.ok && report.buildOk) pass(`${label}: build succeeded`);
  else fail(`${label}: build succeeded`, report.error ?? 'failed');

  if (report.workflowIntelligence) pass(`${label}: report workflowIntelligence`);
  else fail(`${label}: report workflowIntelligence`);

  if (report.workflowIntelligence?.entryScreen === testCase.expectedEntry) {
    pass(`${label}: report entry screen`);
  } else {
    fail(`${label}: report entry screen`, report.workflowIntelligence?.entryScreen ?? 'null');
  }

  if (report.workflowIntelligence?.navigationModel === testCase.expectedNav) {
    pass(`${label}: report navigation model`);
  } else {
    fail(`${label}: report navigation model`, report.workflowIntelligence?.navigationModel ?? 'null');
  }

  const reportText = formatBuildReport(report);
  if (reportText.includes('Workflow Intelligence') && reportText.includes('Application Goal:')) {
    pass(`${label}: engineering report section`);
  } else {
    fail(`${label}: engineering report section`);
  }

  if (!report.projectDir || !existsSync(join(report.projectDir, 'src/pages/Home.tsx'))) {
    fail(`${label}: Home.tsx exists`);
    return;
  }

  const homeContent = readFileSync(join(report.projectDir, 'src/pages/Home.tsx'), 'utf8');
  if (homeContent.includes(`${WORKFLOW_MARKER}="primary-workflow"`)) {
    pass(`${label}: workflow marker in Home.tsx`);
  } else {
    fail(`${label}: workflow marker in Home.tsx`);
  }

  if (homeContent.includes(`${WORKFLOW_MARKER}="critical-action"`)) {
    pass(`${label}: critical action marker in Home.tsx`);
  } else {
    fail(`${label}: critical action marker in Home.tsx`);
  }

  if (homeContent.includes(`${WORKFLOW_MARKER}-entry="${testCase.expectedEntry}"`)) {
    pass(`${label}: entry screen marker in Home.tsx`);
  } else {
    fail(`${label}: entry screen marker in Home.tsx`);
  }
}

function assertWebUi(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('card-workflow-intelligence')) pass('web UI: Workflow Intelligence report card');
  else fail('web UI: Workflow Intelligence report card');

  if (appJs.includes('renderWorkflowIntelligence')) pass('web UI: renderWorkflowIntelligence implemented');
  else fail('web UI: renderWorkflowIntelligence implemented');

  if (appJs.includes("'workflow-intelligence'")) pass('web UI: workflow intelligence in REPORT_CARD_MAP');
  else fail('web UI: workflow intelligence in REPORT_CARD_MAP');
}

export async function runWorkflowIntelligenceRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nWorkflow Intelligence Engine regression\n');

  console.log('── Workflow modules ──\n');
  assertModulesExist();

  console.log('\n── Pipeline ordering ──\n');
  assertPipelineOrdering();

  console.log('\n── Planned workflows ──\n');
  for (const testCase of WORKFLOW_CASES) {
    assertPlannedWorkflow(testCase);
  }

  console.log('\n── Generated workflows ──\n');
  for (const testCase of WORKFLOW_CASES) {
    await assertGeneratedWorkflow(testCase);
  }

  console.log('\n── Static checks ──\n');
  assertNoForbiddenHardcoding();
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
