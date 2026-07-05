import type { WorkflowModel, WorkflowStep } from './workflow-types.js';

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
}

function stepById(steps: readonly WorkflowStep[], id: string): WorkflowStep | undefined {
  return steps.find((step) => step.id === id);
}

export function validateWorkflowModel(model: WorkflowModel): WorkflowValidationResult {
  const errors: string[] = [];

  if (!model.primaryWorkflow) {
    errors.push('missing primary workflow');
  }

  if (!model.entryScreen?.trim()) {
    errors.push('missing entry screen');
  }

  if (!model.completionScreen?.trim()) {
    errors.push('missing completion screen');
  }

  if (!model.navigationModel) {
    errors.push('missing navigation model');
  }

  if (model.criticalActions.length === 0) {
    errors.push('missing critical actions');
  }

  if (model.workflowSteps.length === 0) {
    errors.push('missing workflow steps');
  }

  if (model.interactionPatterns.length === 0) {
    errors.push('missing interaction patterns');
  }

  if (model.successCriteria.length === 0) {
    errors.push('missing success criteria');
  }

  if (model.dataTransitions.length === 0) {
    errors.push('missing data transitions');
  }

  if (model.screens.length === 0) {
    errors.push('missing screen priorities');
  } else if (!model.screens.some((screen) => screen.priority === 'PRIMARY')) {
    errors.push('missing PRIMARY screen priority');
  }

  const steps = model.workflowSteps;
  const stepIds = new Set(steps.map((step) => step.id));

  for (const step of steps) {
    if (step.nextStep && !stepIds.has(step.nextStep)) {
      errors.push(`broken step link: ${step.id} -> ${step.nextStep}`);
    }
  }

  const reachable = new Set<string>();
  if (steps[0]) {
    let cursor: string | null = steps[0].id;
    while (cursor && !reachable.has(cursor)) {
      reachable.add(cursor);
      cursor = stepById(steps, cursor)?.nextStep ?? null;
    }
  }

  const terminalSteps = steps.filter((step) => step.nextStep === null);
  if (terminalSteps.length === 0) {
    errors.push('workflow has no completion step');
  }

  for (const step of steps) {
    if (step.nextStep === null) continue;
    if (!reachable.has(step.id)) {
      errors.push(`dead-end or unreachable step: ${step.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
