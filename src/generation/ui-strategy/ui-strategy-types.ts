export type LayoutPattern =
  | 'dashboard'
  | 'calendar'
  | 'kanban'
  | 'data-table'
  | 'card-grid'
  | 'editor'
  | 'ledger'
  | 'pos'
  | 'chat'
  | 'media-library'
  | 'timetable'
  | 'progress-dashboard'
  | 'board'
  | 'split-view';

export interface UiStrategy {
  id: string;
  name: string;
  description: string;
  bestForDomains: readonly string[];
  layoutPattern: LayoutPattern;
  primarySurface: string;
  secondarySurfaces: readonly string[];
  navigationModel: string;
  interactionModel: string;
  requiredComponents: readonly string[];
  optionalComponents: readonly string[];
  dataDisplayPattern: string;
  primaryUserGoal: string;
  supportedActions: readonly string[];
}

export interface UiStrategyReport {
  strategyId: string;
  strategyName: string;
  selectionReason: string;
  layoutPattern: LayoutPattern;
  primarySurface: string;
  primaryUserGoal: string;
  interactionModel: string;
  generatedLayoutComponents: string[];
}

export const UI_STRATEGY_MARKER = 'data-ui-strategy-layout';
