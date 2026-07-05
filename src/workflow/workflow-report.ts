import { computeWorkflowConfidence } from './workflow-engine.js';
import type { WorkflowModel, WorkflowReport } from './workflow-types.js';

export function buildWorkflowReport(model: WorkflowModel): WorkflowReport {
  return {
    applicationGoal: model.applicationGoal,
    primaryActor: model.primaryActor,
    primaryWorkflow: model.primaryWorkflow.name,
    secondaryWorkflows: model.secondaryWorkflows.map((workflow) => workflow.name),
    navigationModel: model.navigationModel,
    entryScreen: model.entryScreen,
    completionScreen: model.completionScreen,
    workflowSteps: model.workflowSteps.map(
      (step) => `${step.title} → ${step.screen} (${step.action})`,
    ),
    criticalActions: [...model.criticalActions],
    optionalActions: [...model.optionalActions],
    interactionPatterns: [...model.interactionPatterns],
    screenPriorities: model.screens.map(
      (screen) => `${screen.name}: ${screen.priority}`,
    ),
    dataFlow: model.dataTransitions.map((transition) => {
      const parts = [
        transition.writes.length ? `writes ${transition.writes.join(', ')}` : null,
        transition.updates.length ? `updates ${transition.updates.join(', ')}` : null,
        transition.derivedMetrics.length ? `derives ${transition.derivedMetrics.join(', ')}` : null,
        transition.refreshTargets.length ? `refreshes ${transition.refreshTargets.join(', ')}` : null,
      ].filter(Boolean);
      return `${transition.actionId}: ${parts.join('; ')}`;
    }),
    successCriteria: [...model.successCriteria],
    workflowConfidence: computeWorkflowConfidence(model),
  };
}
