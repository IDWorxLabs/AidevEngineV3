import type {
  WorkflowDataTransition,
  WorkflowDefinition,
  WorkflowNavigationModel,
  WorkflowScreen,
  WorkflowStep,
} from './workflow-types.js';

export interface WorkflowDomainTraits {
  domainId: string;
  entityLabel: string;
  entityLabelPlural: string;
  primaryActionLabel: string;
  entryScreenHint: string;
  completionHint: string;
  recordNoun: string;
  dashboardNoun: string;
}

export interface NavigationWorkflowBlueprint {
  navigationModel: WorkflowNavigationModel;
  entryScreen: string;
  completionScreen: string;
  criticalAction: string;
  interactionPatterns: readonly string[];
  stepTemplate: readonly Omit<WorkflowStep, 'id'>[];
  screens: readonly Omit<WorkflowScreen, 'id'>[];
  dataTransitionTemplate: Omit<WorkflowDataTransition, 'actionId'>;
  successCriteria: string;
  secondaryWorkflowNames: readonly string[];
}

const NAVIGATION_BLUEPRINTS: Record<WorkflowNavigationModel, NavigationWorkflowBlueprint> = {
  Calendar: {
    navigationModel: 'Calendar',
    entryScreen: "Today's Schedule",
    completionScreen: 'Calendar Updated',
    criticalAction: 'Create Booking',
    interactionPatterns: ['Browse', 'Schedule', 'Create', 'Review'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Application ready', nextStep: 'today', dataAffected: [], validationRules: [] },
      { title: "Today's Schedule", screen: "Today's Schedule", action: 'Review schedule', expectedResult: 'Schedule visible', nextStep: 'slots', dataAffected: ['bookings'], validationRules: ['schedule-loaded'] },
      { title: 'Available Time Slots', screen: 'Time Slots', action: 'Browse availability', expectedResult: 'Open slots shown', nextStep: 'select', dataAffected: ['availability'], validationRules: [] },
      { title: 'Select Slot', screen: 'Time Slots', action: 'Choose slot', expectedResult: 'Slot selected', nextStep: 'create', dataAffected: ['availability'], validationRules: ['slot-selected'] },
      { title: 'Create Booking', screen: 'Booking Form', action: 'Create booking', expectedResult: 'Booking draft ready', nextStep: 'confirm', dataAffected: ['bookings'], validationRules: ['required-fields'] },
      { title: 'Customer Confirmation', screen: 'Confirmation', action: 'Confirm booking', expectedResult: 'Booking confirmed', nextStep: 'saved', dataAffected: ['bookings'], validationRules: [] },
      { title: 'Booking Saved', screen: 'Confirmation', action: 'Save booking', expectedResult: 'Booking persisted', nextStep: 'calendar', dataAffected: ['bookings'], validationRules: [] },
      { title: 'Calendar Updated', screen: 'Calendar', action: 'Refresh calendar', expectedResult: 'Calendar reflects booking', nextStep: 'dashboard', dataAffected: ['calendar'], validationRules: [] },
      { title: 'Dashboard Updated', screen: 'Dashboard', action: 'Review metrics', expectedResult: 'Metrics refreshed', nextStep: null, dataAffected: ['dashboard'], validationRules: [] },
    ],
    screens: [
      { name: "Today's Schedule", priority: 'PRIMARY', purpose: 'Immediate schedule context' },
      { name: 'Time Slots', priority: 'PRIMARY', purpose: 'Availability selection' },
      { name: 'Booking Form', priority: 'SECONDARY', purpose: 'Create reservation' },
      { name: 'Dashboard', priority: 'SECONDARY', purpose: 'Summary metrics' },
    ],
    dataTransitionTemplate: {
      reads: ['availability', 'bookings'],
      writes: ['bookings'],
      updates: ['calendar', 'dashboard', 'availability'],
      deletes: [],
      derivedMetrics: ['today-count', 'upcoming-count'],
      refreshTargets: ['calendar', 'dashboard'],
    },
    successCriteria: 'Booking successfully scheduled.',
    secondaryWorkflowNames: ['Manage customers', 'Review upcoming reservations'],
  },
  Kanban: {
    navigationModel: 'Kanban',
    entryScreen: 'Sales Pipeline',
    completionScreen: 'Pipeline Updated',
    criticalAction: 'Move Lead',
    interactionPatterns: ['Browse', 'Review', 'Edit', 'Assign'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Pipeline ready', nextStep: 'pipeline', dataAffected: [], validationRules: [] },
      { title: 'Sales Pipeline', screen: 'Pipeline Board', action: 'Review stages', expectedResult: 'Pipeline visible', nextStep: 'choose', dataAffected: ['deals'], validationRules: [] },
      { title: 'Choose Lead', screen: 'Pipeline Board', action: 'Select deal', expectedResult: 'Deal selected', nextStep: 'open', dataAffected: ['deals'], validationRules: ['record-selected'] },
      { title: 'Open Customer', screen: 'Customer Detail', action: 'Open details', expectedResult: 'Customer context shown', nextStep: 'move', dataAffected: ['customers'], validationRules: [] },
      { title: 'Move Pipeline Stage', screen: 'Pipeline Board', action: 'Update stage', expectedResult: 'Stage changed', nextStep: 'save', dataAffected: ['deals'], validationRules: ['stage-valid'] },
      { title: 'Save', screen: 'Customer Detail', action: 'Save changes', expectedResult: 'Changes persisted', nextStep: 'pipeline-updated', dataAffected: ['deals'], validationRules: [] },
      { title: 'Pipeline Updated', screen: 'Pipeline Board', action: 'Review pipeline', expectedResult: 'Pipeline metrics refreshed', nextStep: 'analytics', dataAffected: ['pipeline'], validationRules: [] },
      { title: 'Analytics Updated', screen: 'Dashboard', action: 'Review analytics', expectedResult: 'Analytics refreshed', nextStep: null, dataAffected: ['dashboard'], validationRules: [] },
    ],
    screens: [
      { name: 'Pipeline Board', priority: 'PRIMARY', purpose: 'Stage-based deal flow' },
      { name: 'Customer Detail', priority: 'SECONDARY', purpose: 'Deal context' },
      { name: 'Dashboard', priority: 'SECONDARY', purpose: 'Pipeline analytics' },
    ],
    dataTransitionTemplate: {
      reads: ['deals', 'customers'],
      writes: ['deals'],
      updates: ['pipeline', 'dashboard', 'analytics'],
      deletes: [],
      derivedMetrics: ['pipeline-value', 'active-deals'],
      refreshTargets: ['pipeline', 'dashboard'],
    },
    successCriteria: 'Lead successfully moved.',
    secondaryWorkflowNames: ['Follow-up queue', 'Add customer'],
  },
  'Master Detail': {
    navigationModel: 'Master Detail',
    entryScreen: 'Inventory Overview',
    completionScreen: 'Inventory Updated',
    criticalAction: 'Adjust Stock',
    interactionPatterns: ['Browse', 'Search', 'Edit', 'Review'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Overview ready', nextStep: 'overview', dataAffected: [], validationRules: [] },
      { title: 'Inventory Overview', screen: 'Overview', action: 'Review stock', expectedResult: 'Stock summary visible', nextStep: 'alerts', dataAffected: ['products'], validationRules: [] },
      { title: 'Low Stock Alerts', screen: 'Alerts', action: 'Review alerts', expectedResult: 'Alerts visible', nextStep: 'select', dataAffected: ['products'], validationRules: [] },
      { title: 'Select Product', screen: 'Product Table', action: 'Select product', expectedResult: 'Product selected', nextStep: 'adjust', dataAffected: ['products'], validationRules: ['record-selected'] },
      { title: 'Adjust Quantity', screen: 'Product Detail', action: 'Edit quantity', expectedResult: 'Quantity updated', nextStep: 'save', dataAffected: ['products'], validationRules: ['quantity-valid'] },
      { title: 'Save', screen: 'Product Detail', action: 'Save product', expectedResult: 'Stock saved', nextStep: 'updated', dataAffected: ['products'], validationRules: [] },
      { title: 'Inventory Updated', screen: 'Overview', action: 'Refresh inventory', expectedResult: 'Stock levels refreshed', nextStep: 'dashboard', dataAffected: ['inventory'], validationRules: [] },
      { title: 'Dashboard Updated', screen: 'Dashboard', action: 'Review metrics', expectedResult: 'Metrics refreshed', nextStep: null, dataAffected: ['dashboard'], validationRules: [] },
    ],
    screens: [
      { name: 'Overview', priority: 'PRIMARY', purpose: 'Stock summary' },
      { name: 'Product Table', priority: 'PRIMARY', purpose: 'Detailed stock list' },
      { name: 'Product Detail', priority: 'SECONDARY', purpose: 'Adjust product' },
    ],
    dataTransitionTemplate: {
      reads: ['products', 'inventory'],
      writes: ['products'],
      updates: ['inventory', 'dashboard', 'alerts'],
      deletes: [],
      derivedMetrics: ['low-stock-count', 'stock-value'],
      refreshTargets: ['inventory', 'dashboard'],
    },
    successCriteria: 'Stock updated.',
    secondaryWorkflowNames: ['Add product', 'Filter by category'],
  },
  Dashboard: {
    navigationModel: 'Dashboard',
    entryScreen: 'Financial Dashboard',
    completionScreen: 'Balance Updated',
    criticalAction: 'Add Transaction',
    interactionPatterns: ['Browse', 'Create', 'Review', 'Track Progress'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Dashboard ready', nextStep: 'dashboard', dataAffected: [], validationRules: [] },
      { title: 'Financial Dashboard', screen: 'Dashboard', action: 'Review finances', expectedResult: 'Balances visible', nextStep: 'add', dataAffected: ['transactions'], validationRules: [] },
      { title: 'Add Transaction', screen: 'Transaction Form', action: 'Create transaction', expectedResult: 'Transaction draft ready', nextStep: 'category', dataAffected: ['transactions'], validationRules: ['required-fields'] },
      { title: 'Choose Category', screen: 'Transaction Form', action: 'Select category', expectedResult: 'Category selected', nextStep: 'save', dataAffected: ['categories'], validationRules: ['category-selected'] },
      { title: 'Save', screen: 'Transaction Form', action: 'Save transaction', expectedResult: 'Transaction saved', nextStep: 'ledger', dataAffected: ['transactions'], validationRules: [] },
      { title: 'Ledger Updated', screen: 'Ledger', action: 'Review ledger', expectedResult: 'Ledger refreshed', nextStep: 'balance', dataAffected: ['ledger'], validationRules: [] },
      { title: 'Balance Updated', screen: 'Dashboard', action: 'Review balance', expectedResult: 'Balance recalculated', nextStep: null, dataAffected: ['dashboard'], validationRules: [] },
    ],
    screens: [
      { name: 'Dashboard', priority: 'PRIMARY', purpose: 'Financial overview' },
      { name: 'Ledger', priority: 'PRIMARY', purpose: 'Transaction history' },
      { name: 'Transaction Form', priority: 'SECONDARY', purpose: 'Record transaction' },
    ],
    dataTransitionTemplate: {
      reads: ['transactions', 'categories'],
      writes: ['transactions'],
      updates: ['ledger', 'dashboard', 'monthly-total'],
      deletes: [],
      derivedMetrics: ['balance', 'income', 'expenses'],
      refreshTargets: ['ledger', 'dashboard'],
    },
    successCriteria: 'Transaction recorded.',
    secondaryWorkflowNames: ['Filter transactions', 'Review category breakdown'],
  },
  Editor: {
    navigationModel: 'Editor',
    entryScreen: 'Recent Notes',
    completionScreen: 'Changes Saved',
    criticalAction: 'Edit Note',
    interactionPatterns: ['Browse', 'Search', 'Create', 'Edit'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Notes ready', nextStep: 'recent', dataAffected: [], validationRules: [] },
      { title: 'Recent Notes', screen: 'Notes Sidebar', action: 'Browse notes', expectedResult: 'Notes listed', nextStep: 'open', dataAffected: ['notes'], validationRules: [] },
      { title: 'Open Note', screen: 'Editor Pane', action: 'Open note', expectedResult: 'Note loaded', nextStep: 'edit', dataAffected: ['notes'], validationRules: ['record-selected'] },
      { title: 'Edit', screen: 'Editor Pane', action: 'Edit content', expectedResult: 'Content changed', nextStep: 'autosave', dataAffected: ['notes'], validationRules: [] },
      { title: 'Auto Save', screen: 'Editor Pane', action: 'Save changes', expectedResult: 'Changes persisted', nextStep: 'return', dataAffected: ['notes'], validationRules: [] },
      { title: 'Return to Notes', screen: 'Notes Sidebar', action: 'Return to list', expectedResult: 'List refreshed', nextStep: null, dataAffected: ['notes'], validationRules: [] },
    ],
    screens: [
      { name: 'Notes Sidebar', priority: 'PRIMARY', purpose: 'Note navigation' },
      { name: 'Editor Pane', priority: 'PRIMARY', purpose: 'Writing workspace' },
    ],
    dataTransitionTemplate: {
      reads: ['notes', 'tags'],
      writes: ['notes'],
      updates: ['notes-list', 'recent-notes'],
      deletes: ['notes'],
      derivedMetrics: ['note-count', 'pinned-count'],
      refreshTargets: ['notes-list'],
    },
    successCriteria: 'Changes saved.',
    secondaryWorkflowNames: ['Add note', 'Search notes'],
  },
  POS: {
    navigationModel: 'POS',
    entryScreen: 'Orders Queue',
    completionScreen: 'Order Completed',
    criticalAction: 'Add to Order',
    interactionPatterns: ['Browse', 'Create', 'Complete'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open POS', expectedResult: 'Menu ready', nextStep: 'queue', dataAffected: [], validationRules: [] },
      { title: 'Orders Queue', screen: 'Order Queue', action: 'Review orders', expectedResult: 'Queue visible', nextStep: 'menu', dataAffected: ['orders'], validationRules: [] },
      { title: 'Menu Categories', screen: 'Menu Grid', action: 'Browse menu', expectedResult: 'Items visible', nextStep: 'add', dataAffected: ['menu'], validationRules: [] },
      { title: 'Add to Order', screen: 'Order Cart', action: 'Add item', expectedResult: 'Cart updated', nextStep: 'checkout', dataAffected: ['orders'], validationRules: [] },
      { title: 'Checkout', screen: 'Checkout Panel', action: 'Complete order', expectedResult: 'Order completed', nextStep: null, dataAffected: ['orders'], validationRules: ['cart-not-empty'] },
    ],
    screens: [
      { name: 'Menu Grid', priority: 'PRIMARY', purpose: 'Order taking' },
      { name: 'Order Cart', priority: 'PRIMARY', purpose: 'Active order' },
      { name: 'Order Queue', priority: 'SECONDARY', purpose: 'Order queue' },
    ],
    dataTransitionTemplate: {
      reads: ['menu', 'orders'],
      writes: ['orders'],
      updates: ['cart', 'totals', 'queue'],
      deletes: [],
      derivedMetrics: ['order-total', 'item-count'],
      refreshTargets: ['queue', 'cart'],
    },
    successCriteria: 'Order successfully completed.',
    secondaryWorkflowNames: ['Manage menu items'],
  },
  Conversation: {
    navigationModel: 'Conversation',
    entryScreen: 'Conversation List',
    completionScreen: 'Conversation Updated',
    criticalAction: 'Send Message',
    interactionPatterns: ['Browse', 'Communicate', 'Search'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Inbox ready', nextStep: 'list', dataAffected: [], validationRules: [] },
      { title: 'Conversation List', screen: 'Conversation List', action: 'Browse conversations', expectedResult: 'Threads listed', nextStep: 'open', dataAffected: ['conversations'], validationRules: [] },
      { title: 'Open Conversation', screen: 'Message Thread', action: 'Open thread', expectedResult: 'Messages visible', nextStep: 'compose', dataAffected: ['messages'], validationRules: ['record-selected'] },
      { title: 'Send Message', screen: 'Message Composer', action: 'Send message', expectedResult: 'Message sent', nextStep: 'updated', dataAffected: ['messages'], validationRules: ['message-not-empty'] },
      { title: 'Conversation Updated', screen: 'Message Thread', action: 'Review thread', expectedResult: 'Thread refreshed', nextStep: null, dataAffected: ['conversations'], validationRules: [] },
    ],
    screens: [
      { name: 'Conversation List', priority: 'PRIMARY', purpose: 'Inbox navigation' },
      { name: 'Message Thread', priority: 'PRIMARY', purpose: 'Message history' },
    ],
    dataTransitionTemplate: {
      reads: ['conversations', 'messages'],
      writes: ['messages'],
      updates: ['conversations', 'unread-count'],
      deletes: [],
      derivedMetrics: ['unread-count'],
      refreshTargets: ['conversation-list', 'message-thread'],
    },
    successCriteria: 'Message sent successfully.',
    secondaryWorkflowNames: ['Search conversations'],
  },
  Timeline: {
    navigationModel: 'Timeline',
    entryScreen: "Today's Timetable",
    completionScreen: 'Schedule Reviewed',
    criticalAction: 'Open Class',
    interactionPatterns: ['Browse', 'Schedule', 'Review'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open portal', expectedResult: 'Timetable ready', nextStep: 'timetable', dataAffected: [], validationRules: [] },
      { title: "Today's Timetable", screen: 'Timetable Grid', action: 'Review schedule', expectedResult: 'Classes visible', nextStep: 'class', dataAffected: ['classes'], validationRules: [] },
      { title: 'Open Class', screen: 'Class Detail', action: 'Open class', expectedResult: 'Class details shown', nextStep: 'attendance', dataAffected: ['classes'], validationRules: [] },
      { title: 'Review Attendance', screen: 'Attendance Cards', action: 'Review attendance', expectedResult: 'Attendance visible', nextStep: 'complete', dataAffected: ['attendance'], validationRules: [] },
      { title: 'Schedule Reviewed', screen: 'Timetable Grid', action: 'Return to timetable', expectedResult: 'Schedule reviewed', nextStep: null, dataAffected: ['classes'], validationRules: [] },
    ],
    screens: [
      { name: 'Timetable Grid', priority: 'PRIMARY', purpose: 'Daily schedule' },
      { name: 'Class Detail', priority: 'SECONDARY', purpose: 'Class information' },
    ],
    dataTransitionTemplate: {
      reads: ['classes', 'attendance'],
      writes: [],
      updates: ['attendance', 'timetable'],
      deletes: [],
      derivedMetrics: ['class-count'],
      refreshTargets: ['timetable'],
    },
    successCriteria: 'Schedule successfully reviewed.',
    secondaryWorkflowNames: ['Upcoming lessons'],
  },
  'Split View': {
    navigationModel: 'Split View',
    entryScreen: 'Collection Overview',
    completionScreen: 'Record Updated',
    criticalAction: 'Create Item',
    interactionPatterns: ['Browse', 'Search', 'Create', 'Edit', 'Delete'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Collection ready', nextStep: 'overview', dataAffected: [], validationRules: [] },
      { title: 'Collection Overview', screen: 'Overview', action: 'Browse records', expectedResult: 'Records visible', nextStep: 'select', dataAffected: ['records'], validationRules: [] },
      { title: 'Select Record', screen: 'List Panel', action: 'Select item', expectedResult: 'Item selected', nextStep: 'detail', dataAffected: ['records'], validationRules: ['record-selected'] },
      { title: 'Review Detail', screen: 'Detail Panel', action: 'Review details', expectedResult: 'Details visible', nextStep: 'action', dataAffected: ['records'], validationRules: [] },
      { title: 'Perform Action', screen: 'Detail Panel', action: 'Edit or create', expectedResult: 'Action completed', nextStep: 'updated', dataAffected: ['records'], validationRules: [] },
      { title: 'Record Updated', screen: 'Overview', action: 'Refresh list', expectedResult: 'Collection refreshed', nextStep: null, dataAffected: ['records'], validationRules: [] },
    ],
    screens: [
      { name: 'Overview', priority: 'PRIMARY', purpose: 'Summary context' },
      { name: 'List Panel', priority: 'PRIMARY', purpose: 'Record browsing' },
      { name: 'Detail Panel', priority: 'SECONDARY', purpose: 'Record detail' },
    ],
    dataTransitionTemplate: {
      reads: ['records'],
      writes: ['records'],
      updates: ['overview', 'metrics'],
      deletes: ['records'],
      derivedMetrics: ['record-count'],
      refreshTargets: ['overview', 'list'],
    },
    successCriteria: 'Record successfully updated.',
    secondaryWorkflowNames: ['Search and filter'],
  },
  Wizard: {
    navigationModel: 'Wizard',
    entryScreen: 'Setup Start',
    completionScreen: 'Setup Complete',
    criticalAction: 'Continue',
    interactionPatterns: ['Create', 'Review', 'Complete'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Start wizard', expectedResult: 'Wizard ready', nextStep: 'step1', dataAffected: [], validationRules: [] },
      { title: 'Step 1', screen: 'Wizard Step', action: 'Provide details', expectedResult: 'Step complete', nextStep: 'step2', dataAffected: ['records'], validationRules: [] },
      { title: 'Step 2', screen: 'Wizard Step', action: 'Confirm details', expectedResult: 'Confirmed', nextStep: 'complete', dataAffected: ['records'], validationRules: [] },
      { title: 'Setup Complete', screen: 'Completion', action: 'Finish', expectedResult: 'Workflow complete', nextStep: null, dataAffected: ['records'], validationRules: [] },
    ],
    screens: [{ name: 'Wizard Step', priority: 'PRIMARY', purpose: 'Guided setup' }],
    dataTransitionTemplate: {
      reads: ['records'],
      writes: ['records'],
      updates: ['dashboard'],
      deletes: [],
      derivedMetrics: [],
      refreshTargets: ['dashboard'],
    },
    successCriteria: 'Setup successfully completed.',
    secondaryWorkflowNames: [],
  },
  Tabbed: {
    navigationModel: 'Tabbed',
    entryScreen: 'Main Workspace',
    completionScreen: 'Task Complete',
    criticalAction: 'Save Changes',
    interactionPatterns: ['Browse', 'Edit', 'Review'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open workspace', expectedResult: 'Tabs ready', nextStep: 'workspace', dataAffected: [], validationRules: [] },
      { title: 'Main Workspace', screen: 'Workspace', action: 'Select tab', expectedResult: 'Tab active', nextStep: 'work', dataAffected: ['records'], validationRules: [] },
      { title: 'Save Changes', screen: 'Workspace', action: 'Save', expectedResult: 'Changes saved', nextStep: 'complete', dataAffected: ['records'], validationRules: [] },
      { title: 'Task Complete', screen: 'Workspace', action: 'Finish', expectedResult: 'Task done', nextStep: null, dataAffected: ['records'], validationRules: [] },
    ],
    screens: [{ name: 'Workspace', priority: 'PRIMARY', purpose: 'Tabbed workspace' }],
    dataTransitionTemplate: {
      reads: ['records'],
      writes: ['records'],
      updates: ['workspace'],
      deletes: [],
      derivedMetrics: [],
      refreshTargets: ['workspace'],
    },
    successCriteria: 'Task successfully completed.',
    secondaryWorkflowNames: [],
  },
  'Single Focus': {
    navigationModel: 'Single Focus',
    entryScreen: 'Focus Screen',
    completionScreen: 'Goal Complete',
    criticalAction: 'Complete Action',
    interactionPatterns: ['Complete', 'Track Progress'],
    stepTemplate: [
      { title: 'Launch', screen: 'Entry', action: 'Open focus view', expectedResult: 'Focus ready', nextStep: 'focus', dataAffected: [], validationRules: [] },
      { title: 'Focus Screen', screen: 'Focus', action: 'Perform primary action', expectedResult: 'Action in progress', nextStep: 'complete', dataAffected: ['records'], validationRules: [] },
      { title: 'Goal Complete', screen: 'Focus', action: 'Complete goal', expectedResult: 'Goal achieved', nextStep: null, dataAffected: ['records'], validationRules: [] },
    ],
    screens: [{ name: 'Focus', priority: 'PRIMARY', purpose: 'Single-task focus' }],
    dataTransitionTemplate: {
      reads: ['records'],
      writes: ['records'],
      updates: ['progress'],
      deletes: [],
      derivedMetrics: ['completion-rate'],
      refreshTargets: ['progress'],
    },
    successCriteria: 'Primary goal achieved.',
    secondaryWorkflowNames: [],
  },
};

const DOMAIN_ENTRY_OVERRIDES: Record<string, Partial<Pick<NavigationWorkflowBlueprint, 'entryScreen' | 'completionScreen' | 'criticalAction'>>> = {
  'booking-system': { entryScreen: "Today's Schedule", criticalAction: 'Create Booking' },
  crm: { entryScreen: 'Sales Pipeline', criticalAction: 'Move Lead' },
  'inventory-system': { entryScreen: 'Inventory Overview', criticalAction: 'Adjust Stock' },
  'recipe-manager': { entryScreen: 'Recipe Browser', criticalAction: 'Open Recipe', completionScreen: 'Collection Updated' },
  'expense-tracker': { entryScreen: 'Financial Dashboard', criticalAction: 'Add Transaction' },
  'notes-app': { entryScreen: 'Recent Notes', criticalAction: 'Edit Note' },
  'restaurant-pos': { entryScreen: 'Orders Queue', criticalAction: 'Add to Order' },
  'school-portal': { entryScreen: "Today's Timetable", criticalAction: 'Open Class' },
  'habit-tracker': { entryScreen: "Today's Checklist", criticalAction: 'Complete Habit', completionScreen: 'Progress Updated' },
  'fitness-tracker': { entryScreen: "Today's Workout", criticalAction: 'Complete Workout', completionScreen: 'Progress Updated' },
  'project-manager': { entryScreen: 'Task Board', criticalAction: 'Add Task' },
};

const LAYOUT_TO_NAVIGATION: Record<string, WorkflowNavigationModel> = {
  calendar: 'Calendar',
  kanban: 'Kanban',
  'data-table': 'Master Detail',
  'card-grid': 'Master Detail',
  editor: 'Editor',
  ledger: 'Dashboard',
  pos: 'POS',
  chat: 'Conversation',
  'media-library': 'Master Detail',
  timetable: 'Timeline',
  'progress-dashboard': 'Dashboard',
  board: 'Kanban',
  dashboard: 'Dashboard',
  'split-view': 'Split View',
};

export function resolveNavigationModel(layoutPattern: string): WorkflowNavigationModel {
  return LAYOUT_TO_NAVIGATION[layoutPattern] ?? 'Split View';
}

export function getNavigationBlueprint(
  navigationModel: WorkflowNavigationModel,
  domainId: string,
): NavigationWorkflowBlueprint {
  const base = NAVIGATION_BLUEPRINTS[navigationModel];
  const overrides = DOMAIN_ENTRY_OVERRIDES[domainId] ?? {};
  return {
    ...base,
    ...overrides,
    entryScreen: overrides.entryScreen ?? base.entryScreen,
    completionScreen: overrides.completionScreen ?? base.completionScreen,
    criticalAction: overrides.criticalAction ?? base.criticalAction,
  };
}

export function materializeSteps(
  template: readonly Omit<WorkflowStep, 'id'>[],
): WorkflowStep[] {
  return template.map((step, index) => {
    const id = `step-${index + 1}`;
    const next = template[index + 1];
    return {
      id,
      ...step,
      nextStep: next ? `step-${index + 2}` : null,
    };
  });
}

export function materializeScreens(
  template: readonly Omit<WorkflowScreen, 'id'>[],
): WorkflowScreen[] {
  return template.map((screen, index) => ({
    id: `screen-${index + 1}`,
    ...screen,
  }));
}

export function buildSecondaryWorkflows(
  names: readonly string[],
  traits: WorkflowDomainTraits,
): WorkflowDefinition[] {
  return names.map((name, index) => ({
    id: `secondary-${index + 1}`,
    name,
    kind: index === 0 ? 'secondary' : 'administrative',
    entryScreen: traits.entryScreenHint,
    completionScreen: traits.completionHint,
    successCriteria: `${name} completed.`,
    steps: materializeSteps([
      { title: name, screen: traits.entryScreenHint, action: name, expectedResult: 'Completed', nextStep: null, dataAffected: [traits.recordNoun], validationRules: [] },
    ]),
  }));
}

export function buildDomainTraits(
  domainId: string,
  entityLabel: string,
  entityLabelPlural: string,
  createActionLabel: string,
): WorkflowDomainTraits {
  return {
    domainId,
    entityLabel,
    entityLabelPlural,
    primaryActionLabel: createActionLabel,
    entryScreenHint: `${entityLabelPlural} Overview`,
    completionHint: `${entityLabel} Updated`,
    recordNoun: entityLabel.toLowerCase(),
    dashboardNoun: 'dashboard',
  };
}

export function customizeBlueprintForDomain(
  blueprint: NavigationWorkflowBlueprint,
  traits: WorkflowDomainTraits,
): NavigationWorkflowBlueprint {
  if (blueprint.navigationModel === 'Master Detail' && traits.domainId === 'recipe-manager') {
    return {
      ...blueprint,
      entryScreen: 'Recipe Browser',
      completionScreen: 'Collection Updated',
      criticalAction: 'Open Recipe',
      successCriteria: 'Recipe viewed or saved.',
      stepTemplate: [
        { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Browser ready', nextStep: 'browse', dataAffected: [], validationRules: [] },
        { title: 'Browse Recipes', screen: 'Recipe Browser', action: 'Browse cards', expectedResult: 'Recipes visible', nextStep: 'open', dataAffected: ['recipes'], validationRules: [] },
        { title: 'Open Recipe', screen: 'Recipe Detail', action: 'Open recipe', expectedResult: 'Recipe loaded', nextStep: 'instructions', dataAffected: ['recipes'], validationRules: ['record-selected'] },
        { title: 'View Instructions', screen: 'Recipe Detail', action: 'Read instructions', expectedResult: 'Instructions visible', nextStep: 'cook', dataAffected: ['recipes'], validationRules: [] },
        { title: 'Cook', screen: 'Recipe Detail', action: 'Track cooking', expectedResult: 'Cooking tracked', nextStep: 'favorite', dataAffected: ['recipes'], validationRules: [] },
        { title: 'Favorite Recipe', screen: 'Recipe Browser', action: 'Favorite recipe', expectedResult: 'Favorite saved', nextStep: 'updated', dataAffected: ['recipes'], validationRules: [] },
        { title: 'Collection Updated', screen: 'Recipe Browser', action: 'Review collection', expectedResult: 'Collection refreshed', nextStep: null, dataAffected: ['collection'], validationRules: [] },
      ],
    };
  }

  if (blueprint.navigationModel === 'Dashboard' && (traits.domainId === 'habit-tracker' || traits.domainId === 'fitness-tracker')) {
    return {
      ...blueprint,
      entryScreen: traits.domainId === 'fitness-tracker' ? "Today's Workout" : "Today's Checklist",
      completionScreen: 'Progress Updated',
      criticalAction: traits.domainId === 'fitness-tracker' ? 'Complete Workout' : 'Complete Habit',
      successCriteria: traits.domainId === 'fitness-tracker' ? 'Workout completed.' : 'Habit completed.',
      stepTemplate: [
        { title: 'Launch', screen: 'Entry', action: 'Open application', expectedResult: 'Progress ready', nextStep: 'today', dataAffected: [], validationRules: [] },
        { title: traits.domainId === 'fitness-tracker' ? "Today's Workout" : "Today's Checklist", screen: 'Today Panel', action: 'Review today', expectedResult: 'Tasks visible', nextStep: 'complete', dataAffected: [traits.recordNoun], validationRules: [] },
        { title: traits.domainId === 'fitness-tracker' ? 'Complete Exercise' : 'Complete Habit', screen: 'Today Panel', action: 'Mark complete', expectedResult: 'Item completed', nextStep: 'save', dataAffected: [traits.recordNoun], validationRules: [] },
        { title: 'Save Progress', screen: 'Progress Dashboard', action: 'Save progress', expectedResult: 'Progress saved', nextStep: 'updated', dataAffected: ['progress'], validationRules: [] },
        { title: 'Progress Updated', screen: 'Progress Dashboard', action: 'Review progress', expectedResult: 'Dashboard refreshed', nextStep: null, dataAffected: ['dashboard'], validationRules: [] },
      ],
    };
  }

  return blueprint;
}
