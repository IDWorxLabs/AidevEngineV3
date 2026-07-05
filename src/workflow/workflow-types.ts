export type WorkflowNavigationModel =
  | 'Dashboard'
  | 'Wizard'
  | 'Kanban'
  | 'Master Detail'
  | 'Editor'
  | 'Calendar'
  | 'Conversation'
  | 'POS'
  | 'Split View'
  | 'Tabbed'
  | 'Timeline'
  | 'Single Focus';

export type ScreenPriority = 'PRIMARY' | 'SECONDARY' | 'TERTIARY';

export type WorkflowDataOperation = 'read' | 'write' | 'update' | 'delete' | 'derive';

export interface WorkflowScreen {
  id: string;
  name: string;
  priority: ScreenPriority;
  purpose: string;
}

export interface WorkflowDataTransition {
  actionId: string;
  reads: readonly string[];
  writes: readonly string[];
  updates: readonly string[];
  deletes: readonly string[];
  derivedMetrics: readonly string[];
  refreshTargets: readonly string[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  screen: string;
  action: string;
  expectedResult: string;
  nextStep: string | null;
  dataAffected: readonly string[];
  validationRules: readonly string[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  kind: 'primary' | 'secondary' | 'administrative' | 'reporting' | 'maintenance';
  entryScreen: string;
  completionScreen: string;
  steps: readonly WorkflowStep[];
  successCriteria: string;
}

export interface WorkflowModel {
  applicationGoal: string;
  primaryActor: string;
  primaryWorkflow: WorkflowDefinition;
  secondaryWorkflows: readonly WorkflowDefinition[];
  screens: readonly WorkflowScreen[];
  workflowSteps: readonly WorkflowStep[];
  navigationModel: WorkflowNavigationModel;
  entryScreen: string;
  completionScreen: string;
  criticalActions: readonly string[];
  optionalActions: readonly string[];
  dataTransitions: readonly WorkflowDataTransition[];
  interactionPatterns: readonly string[];
  successCriteria: readonly string[];
}

export interface WorkflowReport {
  applicationGoal: string;
  primaryActor: string;
  primaryWorkflow: string;
  secondaryWorkflows: readonly string[];
  navigationModel: WorkflowNavigationModel;
  entryScreen: string;
  completionScreen: string;
  workflowSteps: readonly string[];
  criticalActions: readonly string[];
  optionalActions: readonly string[];
  interactionPatterns: readonly string[];
  screenPriorities: readonly string[];
  dataFlow: readonly string[];
  successCriteria: readonly string[];
  workflowConfidence: number;
}

export const WORKFLOW_MARKER = 'data-workflow-intelligence';
