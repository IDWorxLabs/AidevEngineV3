import type { ArchitecturePlan, BuildPlan, UnderstandingReport } from '../types.js';
import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { UiStrategy } from '../generation/ui-strategy/ui-strategy-types.js';
import {
  buildDomainTraits,
  buildSecondaryWorkflows,
  customizeBlueprintForDomain,
  getNavigationBlueprint,
  materializeScreens,
  materializeSteps,
  resolveNavigationModel,
} from './workflow-catalog.js';
import type { WorkflowDefinition, WorkflowModel } from './workflow-types.js';

export interface WorkflowEngineInput {
  understanding: UnderstandingReport;
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
  domainProfile: ApplicationDomainProfile;
  creationProfile: DomainCreationProfile;
  uiStrategy: UiStrategy;
}

function buildPrimaryWorkflow(
  blueprint: ReturnType<typeof getNavigationBlueprint>,
  traits: ReturnType<typeof buildDomainTraits>,
): WorkflowDefinition {
  const steps = materializeSteps(blueprint.stepTemplate);
  return {
    id: 'primary-workflow',
    name: `${traits.entityLabel} Journey`,
    kind: 'primary',
    entryScreen: blueprint.entryScreen,
    completionScreen: blueprint.completionScreen,
    successCriteria: blueprint.successCriteria,
    steps,
  };
}

function buildAdministrativeWorkflows(traits: ReturnType<typeof buildDomainTraits>): WorkflowDefinition[] {
  return [
    {
      id: 'admin-search',
      name: 'Search and filter records',
      kind: 'administrative',
      entryScreen: traits.entryScreenHint,
      completionScreen: traits.entryScreenHint,
      successCriteria: 'Filtered results displayed.',
      steps: materializeSteps([
        { title: 'Search', screen: traits.entryScreenHint, action: 'Search records', expectedResult: 'Results filtered', nextStep: null, dataAffected: [traits.recordNoun], validationRules: [] },
      ]),
    },
  ];
}

function buildReportingWorkflow(blueprint: ReturnType<typeof getNavigationBlueprint>): WorkflowDefinition {
  return {
    id: 'reporting-overview',
    name: 'Review analytics',
    kind: 'reporting',
    entryScreen: 'Dashboard',
    completionScreen: 'Dashboard',
    successCriteria: 'Analytics reviewed.',
    steps: materializeSteps([
      { title: 'Review analytics', screen: 'Dashboard', action: 'Review metrics', expectedResult: 'Metrics visible', nextStep: null, dataAffected: ['dashboard'], validationRules: [] },
    ]),
  };
}

export function buildWorkflowModel(input: WorkflowEngineInput): WorkflowModel {
  const navigationModel = resolveNavigationModel(input.uiStrategy.layoutPattern);
  const traits = buildDomainTraits(
    input.domainProfile.domainId,
    input.domainProfile.entityLabel,
    input.domainProfile.entityLabelPlural,
    input.creationProfile.createActionLabel,
  );

  let blueprint = getNavigationBlueprint(navigationModel, input.domainProfile.domainId);
  blueprint = customizeBlueprintForDomain(blueprint, traits);

  const primaryWorkflow = buildPrimaryWorkflow(blueprint, traits);
  const secondaryWorkflows = [
    ...buildSecondaryWorkflows(blueprint.secondaryWorkflowNames, traits),
    ...buildAdministrativeWorkflows(traits),
    buildReportingWorkflow(blueprint),
  ];

  const screens = materializeScreens(blueprint.screens);
  const optionalActions = [
    input.creationProfile.createActionLabel,
    input.creationProfile.editActionLabel,
    input.creationProfile.deleteActionLabel,
    'Search',
    'Filter',
  ];

  return {
    applicationGoal: input.understanding.detectedIntent,
    primaryActor: 'Primary user',
    primaryWorkflow,
    secondaryWorkflows,
    screens,
    workflowSteps: primaryWorkflow.steps,
    navigationModel: blueprint.navigationModel,
    entryScreen: blueprint.entryScreen,
    completionScreen: blueprint.completionScreen,
    criticalActions: [blueprint.criticalAction],
    optionalActions,
    dataTransitions: [
      {
        actionId: primaryWorkflow.steps.find((s) => s.action.toLowerCase().includes('save') || s.action.toLowerCase().includes('create'))?.id ?? 'primary-action',
        ...blueprint.dataTransitionTemplate,
      },
    ],
    interactionPatterns: [...blueprint.interactionPatterns],
    successCriteria: [blueprint.successCriteria, ...secondaryWorkflows.map((w) => w.successCriteria)],
  };
}

export function computeWorkflowConfidence(model: WorkflowModel): number {
  let score = 0.55;
  if (model.workflowSteps.length >= 4) score += 0.15;
  if (model.criticalActions.length > 0) score += 0.1;
  if (model.dataTransitions.length > 0) score += 0.1;
  if (model.interactionPatterns.length >= 3) score += 0.05;
  if (model.secondaryWorkflows.length > 0) score += 0.05;
  return Math.min(0.98, score);
}
