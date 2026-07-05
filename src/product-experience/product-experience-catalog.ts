import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { UiStrategy } from '../generation/ui-strategy/ui-strategy-types.js';
import type { WorkflowModel } from '../workflow/workflow-types.js';
import type { CtaHierarchy, FeedbackModel, ProductExperienceModel } from './product-experience-types.js';

export interface ExperienceBlueprint {
  experienceGoal: string;
  primaryUserEmotion: string;
  informationHierarchy: readonly string[];
  visualHierarchy: readonly string[];
  attentionFlow: readonly string[];
  ctaHierarchy: CtaHierarchy;
  feedbackModel: FeedbackModel;
  emptyStateStrategy: string;
  loadingStateStrategy: string;
  errorStateStrategy: string;
  successStateStrategy: string;
  microcopyGuidelines: readonly string[];
  dashboardEmphasis: readonly string[];
  trustSignals: readonly string[];
  frictionReduction: readonly string[];
  accessibilityGuidance: readonly string[];
}

const DOMAIN_BLUEPRINTS: Record<string, ExperienceBlueprint> = {
  'booking-system': {
    experienceGoal: 'Make scheduling feel effortless and reliable.',
    primaryUserEmotion: 'In control of time',
    informationHierarchy: [
      "Today's schedule and available slots",
      'Upcoming reservations',
      'Booking metrics',
    ],
    visualHierarchy: [
      'Available time slots highlighted as clickable',
      'Today schedule as primary focus',
      'Metrics as muted background',
    ],
    attentionFlow: ['Schedule', 'Available slot', 'Create booking', 'Confirmation'],
    ctaHierarchy: {
      primary: 'Create Booking',
      secondary: ['View Schedule'],
      destructive: 'Cancel Booking',
      passive: ['Filter', 'Search'],
      persistent: ['Create Booking'],
    },
    feedbackModel: {
      afterCreate: 'Booking confirmed and added to today\'s schedule.',
      afterEdit: 'Booking updated on your schedule.',
      afterDelete: 'Booking removed from the schedule.',
      afterPrimaryWorkflow: 'Booking confirmed and added to today\'s schedule.',
      confirmationMessage: 'Confirm this booking?',
      successMessage: 'Booking confirmed.',
      warningMessage: 'This time slot may no longer be available.',
    },
    emptyStateStrategy:
      'No bookings yet. Create your first booking to start filling your schedule.',
    loadingStateStrategy: 'Preparing your schedule...',
    errorStateStrategy: 'Booking could not be saved. Check the time slot and try again.',
    successStateStrategy: 'Booking confirmed.',
    microcopyGuidelines: ['Add booking', 'Select slot', 'Confirm reservation'],
    dashboardEmphasis: ["Today's bookings", 'Available slots', 'Upcoming reservations'],
    trustSignals: ['Schedule updated live'],
    frictionReduction: ['Keep Create Booking visible near available slots'],
    accessibilityGuidance: [
      'Label schedule rows with date and time',
      'Announce booking confirmations',
      'Ensure slot buttons have clear focus states',
    ],
  },
  crm: {
    experienceGoal: 'Help sales teams move deals forward with clarity.',
    primaryUserEmotion: 'Confident and proactive',
    informationHierarchy: ['Pipeline stages and hot leads', 'Follow-ups due', 'Analytics'],
    visualHierarchy: [
      'Hot leads and overdue follow-ups highlighted',
      'Pipeline columns as primary focus',
      'Analytics as secondary',
    ],
    attentionFlow: ['Pipeline column', 'Lead card', 'Move stage', 'Follow-up'],
    ctaHierarchy: {
      primary: 'Move Lead',
      secondary: ['Add Customer'],
      destructive: 'Archive Deal',
      passive: ['Search', 'Filter'],
      persistent: ['Move Lead'],
    },
    feedbackModel: {
      afterCreate: 'Customer added to the pipeline.',
      afterEdit: 'Customer details updated.',
      afterDelete: 'Deal archived from the pipeline.',
      afterPrimaryWorkflow: 'Lead moved to Active. Pipeline updated.',
      confirmationMessage: 'Move this lead to the next stage?',
      successMessage: 'Lead moved.',
      warningMessage: 'This deal has overdue follow-ups.',
    },
    emptyStateStrategy:
      'No leads in this stage. Add a lead or move one from another stage.',
    loadingStateStrategy: 'Loading pipeline...',
    errorStateStrategy: 'Customer update failed. Your pipeline is unchanged.',
    successStateStrategy: 'Lead moved.',
    microcopyGuidelines: ['Move lead', 'Add customer', 'Update stage'],
    dashboardEmphasis: ['Pipeline value', 'Hot leads', 'Follow-ups'],
    trustSignals: ['Pipeline metrics update from active deals'],
    frictionReduction: ['Allow stage movement directly from cards'],
    accessibilityGuidance: [
      'Label pipeline columns with stage names',
      'Announce stage changes',
      'Ensure card actions are keyboard reachable',
    ],
  },
  'inventory-system': {
    experienceGoal: 'Surface stock issues before they become problems.',
    primaryUserEmotion: 'Prepared and aware',
    informationHierarchy: ['Low stock and stock table', 'Inventory value', 'Category breakdown'],
    visualHierarchy: [
      'Low stock items highlighted in danger tone',
      'Stock table as primary focus',
      'Category breakdown muted',
    ],
    attentionFlow: ['Overview', 'Low stock alert', 'Select product', 'Adjust quantity'],
    ctaHierarchy: {
      primary: 'Adjust Stock',
      secondary: ['Add Product'],
      destructive: 'Delete Product',
      passive: ['Filter', 'Search'],
      persistent: ['Adjust Stock'],
    },
    feedbackModel: {
      afterCreate: 'Product added to inventory.',
      afterEdit: 'Stock adjusted. Low-stock status recalculated.',
      afterDelete: 'Product removed from inventory.',
      afterPrimaryWorkflow: 'Stock adjusted. Low-stock status recalculated.',
      confirmationMessage: 'Save this stock adjustment?',
      successMessage: 'Stock updated.',
      warningMessage: 'Quantity is below reorder threshold.',
    },
    emptyStateStrategy:
      'No products match this filter. Try another category or add stock.',
    loadingStateStrategy: 'Checking stock levels...',
    errorStateStrategy: 'Stock adjustment failed. Try again before closing this product.',
    successStateStrategy: 'Stock updated.',
    microcopyGuidelines: ['Adjust stock', 'Add product', 'Review alerts'],
    dashboardEmphasis: ['Low stock', 'Stock value', 'Total products'],
    trustSignals: ['Low-stock alerts update automatically'],
    frictionReduction: ['Put Adjust Stock near quantity'],
    accessibilityGuidance: [
      'Announce low-stock alerts',
      'Label quantity fields clearly',
      'Use sufficient contrast on alert badges',
    ],
  },
  'recipe-manager': {
    experienceGoal: 'Make recipe discovery and cooking feel inviting.',
    primaryUserEmotion: 'Inspired and organized',
    informationHierarchy: ['Recipe discovery', 'Favorites and cooking time', 'Category filters'],
    visualHierarchy: [
      'Recipe cards as primary visual focus',
      'Cooking time and favorites highlighted',
      'Filters as secondary toolbar',
    ],
    attentionFlow: ['Recipe card', 'Ingredients', 'Cooking time', 'Favorite'],
    ctaHierarchy: {
      primary: 'Open Recipe',
      secondary: ['Add Recipe', 'Favorite Recipe'],
      destructive: 'Delete Recipe',
      passive: ['Browse categories', 'Search'],
      persistent: ['Add Recipe'],
    },
    feedbackModel: {
      afterCreate: 'Recipe added to your collection.',
      afterEdit: 'Recipe updated.',
      afterDelete: 'Recipe removed from collection.',
      afterPrimaryWorkflow: 'Recipe added to favorites.',
      confirmationMessage: 'Save changes to this recipe?',
      successMessage: 'Recipe added.',
      warningMessage: 'Some ingredients may be missing.',
    },
    emptyStateStrategy: 'No recipes found. Add a recipe or adjust your filters.',
    loadingStateStrategy: 'Loading recipes...',
    errorStateStrategy: 'Recipe could not be saved. Check required fields and try again.',
    successStateStrategy: 'Recipe added.',
    microcopyGuidelines: ['Add recipe', 'Open recipe', 'Favorite recipe'],
    dashboardEmphasis: ['Popular recipes', 'Favorites', 'Cooking time'],
    trustSignals: ['Ingredients saved with each recipe'],
    frictionReduction: ['Keep favorite action on cards'],
    accessibilityGuidance: [
      'Label recipe cards with title and cooking time',
      'Ensure card grid is keyboard navigable',
      'Announce favorite actions',
    ],
  },
  'expense-tracker': {
    experienceGoal: 'Make financial tracking feel clear and trustworthy.',
    primaryUserEmotion: 'Financially aware',
    informationHierarchy: ['Balance and recent transactions', 'Monthly totals', 'Category breakdown'],
    visualHierarchy: [
      'Balance card as primary focus',
      'Negative spending trends highlighted',
      'Category breakdown as muted secondary',
    ],
    attentionFlow: ['Balance card', 'Add transaction', 'Ledger', 'Category summary'],
    ctaHierarchy: {
      primary: 'Add Transaction',
      secondary: ['Filter Ledger'],
      destructive: 'Delete Transaction',
      passive: ['Search', 'Export'],
      persistent: ['Add Transaction'],
    },
    feedbackModel: {
      afterCreate: 'Transaction added. Balance updated.',
      afterEdit: 'Transaction updated. Balance recalculated.',
      afterDelete: 'Transaction removed. Balance updated.',
      afterPrimaryWorkflow: 'Transaction added. Balance updated.',
      confirmationMessage: 'Record this transaction?',
      successMessage: 'Transaction recorded.',
      warningMessage: 'This expense exceeds your monthly budget.',
    },
    emptyStateStrategy:
      'No transactions found. Add your first transaction to see your balance.',
    loadingStateStrategy: 'Calculating totals...',
    errorStateStrategy: 'Transaction could not be saved. Check the amount and category.',
    successStateStrategy: 'Transaction recorded.',
    microcopyGuidelines: ['Add transaction', 'Choose category', 'Review balance'],
    dashboardEmphasis: ['Balance', 'Income', 'Expenses', 'Monthly change'],
    trustSignals: ['Totals calculated from transactions'],
    frictionReduction: ['Put Add Transaction near balance'],
    accessibilityGuidance: [
      'Announce balance updates',
      'Label amount fields with currency context',
      'Ensure ledger rows have semantic structure',
    ],
  },
  'notes-app': {
    experienceGoal: 'Make writing and organizing notes feel calm and immediate.',
    primaryUserEmotion: 'Focused and productive',
    informationHierarchy: ['Recent/pinned notes and editor', 'Tags/search', 'Metadata'],
    visualHierarchy: [
      'Editor dominates the screen',
      'Recent notes as secondary sidebar',
      'Metadata muted',
    ],
    attentionFlow: ['Sidebar note', 'Editor', 'Tags', 'Save status'],
    ctaHierarchy: {
      primary: 'Write Note',
      secondary: ['Pin Note'],
      destructive: 'Delete Note',
      passive: ['Search', 'Filter tags'],
      persistent: ['Write Note'],
    },
    feedbackModel: {
      afterCreate: 'Note created.',
      afterEdit: 'Changes saved.',
      afterDelete: 'Note deleted.',
      afterPrimaryWorkflow: 'Changes saved.',
      confirmationMessage: 'Delete this note?',
      successMessage: 'Saved.',
      warningMessage: 'You have unsaved changes.',
    },
    emptyStateStrategy: 'No note selected. Choose a note or start writing a new one.',
    loadingStateStrategy: 'Opening workspace...',
    errorStateStrategy: 'Note could not be saved. Your draft is still visible.',
    successStateStrategy: 'Saved.',
    microcopyGuidelines: ['Write note', 'Pin note', 'Search notes'],
    dashboardEmphasis: ['Pinned notes', 'Recent notes', 'Last edited'],
    trustSignals: ['Autosave enabled'],
    frictionReduction: ['Keep editor and note list visible together'],
    accessibilityGuidance: [
      'Label editor with note title',
      'Announce save status',
      'Maintain visible focus indicators',
    ],
  },
  'habit-tracker': {
    experienceGoal: 'Make daily progress feel achievable and motivating.',
    primaryUserEmotion: 'Accomplished',
    informationHierarchy: ["Today's checklist", 'Streaks and progress', 'Weekly overview'],
    visualHierarchy: [
      'Today checklist as primary focus',
      'Completed habits highlighted in success tone',
      'Weekly overview as secondary',
    ],
    attentionFlow: ['Today panel', 'Complete habit', 'Save progress', 'Dashboard'],
    ctaHierarchy: {
      primary: 'Complete Habit',
      secondary: ['Add Habit'],
      destructive: 'Remove Habit',
      passive: ['Review streaks'],
      persistent: ['Complete Habit'],
    },
    feedbackModel: {
      afterCreate: 'Habit added to today\'s checklist.',
      afterEdit: 'Habit updated.',
      afterDelete: 'Habit removed.',
      afterPrimaryWorkflow: 'Habit completed. Progress updated.',
      confirmationMessage: 'Mark this habit complete?',
      successMessage: 'Habit completed.',
      warningMessage: 'Streak at risk — complete today to maintain it.',
    },
    emptyStateStrategy: 'No habits for today. Add a habit to start building your streak.',
    loadingStateStrategy: 'Loading today\'s checklist...',
    errorStateStrategy: 'Progress could not be saved. Try again.',
    successStateStrategy: 'Habit completed.',
    microcopyGuidelines: ['Complete habit', 'Add habit', 'Track streak'],
    dashboardEmphasis: ['Today\'s habits', 'Streak count', 'Weekly completion'],
    trustSignals: ['Progress updates after each completion'],
    frictionReduction: ['Keep complete action on today panel'],
    accessibilityGuidance: [
      'Announce habit completion',
      'Label checklist items clearly',
      'Ensure check actions are keyboard accessible',
    ],
  },
  'fitness-tracker': {
    experienceGoal: 'Make workouts feel structured and rewarding.',
    primaryUserEmotion: 'Energized',
    informationHierarchy: ["Today's workout", 'Exercise progress', 'Weekly stats'],
    visualHierarchy: [
      'Today workout panel as primary focus',
      'Completed exercises in success tone',
      'Weekly stats as secondary',
    ],
    attentionFlow: ['Today workout', 'Complete exercise', 'Save progress', 'Dashboard'],
    ctaHierarchy: {
      primary: 'Complete Workout',
      secondary: ['Add Exercise'],
      destructive: 'Remove Exercise',
      passive: ['Review progress'],
      persistent: ['Complete Workout'],
    },
    feedbackModel: {
      afterCreate: 'Exercise added to today\'s workout.',
      afterEdit: 'Workout updated.',
      afterDelete: 'Exercise removed.',
      afterPrimaryWorkflow: 'Workout completed. Progress updated.',
      confirmationMessage: 'Mark workout complete?',
      successMessage: 'Workout completed.',
      warningMessage: 'Rest day recommended — listen to your body.',
    },
    emptyStateStrategy: 'No exercises scheduled today. Add a workout to get started.',
    loadingStateStrategy: 'Loading today\'s workout...',
    errorStateStrategy: 'Progress could not be saved. Try again.',
    successStateStrategy: 'Workout completed.',
    microcopyGuidelines: ['Complete workout', 'Add exercise', 'Track progress'],
    dashboardEmphasis: ["Today's workout", 'Calories burned', 'Weekly activity'],
    trustSignals: ['Progress dashboard updates after each session'],
    frictionReduction: ['Keep complete action on workout panel'],
    accessibilityGuidance: [
      'Announce workout completion',
      'Label exercise rows with name and reps',
      'Ensure progress bars have text alternatives',
    ],
  },
  'contact-manager': {
    experienceGoal: 'Make contact organization feel quick and reliable.',
    primaryUserEmotion: 'Organized and connected',
    informationHierarchy: ['Contact list and search', 'Recent contacts', 'Groups and metrics'],
    visualHierarchy: [
      'Contact list as primary focus',
      'Recent contacts highlighted',
      'Metrics as background',
    ],
    attentionFlow: ['Contact list', 'Search', 'Open contact', 'Save details'],
    ctaHierarchy: {
      primary: 'Add Contact',
      secondary: ['Search contacts'],
      destructive: 'Delete Contact',
      passive: ['Filter', 'Sort'],
      persistent: ['Add Contact'],
    },
    feedbackModel: {
      afterCreate: 'Contact added to your address book.',
      afterEdit: 'Contact details updated.',
      afterDelete: 'Contact removed.',
      afterPrimaryWorkflow: 'Contact saved.',
      confirmationMessage: 'Save this contact?',
      successMessage: 'Contact saved.',
      warningMessage: 'Required contact fields are missing.',
    },
    emptyStateStrategy: 'No contacts yet. Add your first contact to get started.',
    loadingStateStrategy: 'Loading contacts...',
    errorStateStrategy: 'Contact could not be saved. Check the details and try again.',
    successStateStrategy: 'Contact saved.',
    microcopyGuidelines: ['Add contact', 'Edit contact', 'Search contacts'],
    dashboardEmphasis: ['Total contacts', 'Recent updates', 'Companies'],
    trustSignals: ['Contact list updates after each save'],
    frictionReduction: ['Keep add contact near search and list'],
    accessibilityGuidance: [
      'Label contact fields clearly',
      'Announce save confirmations',
      'Ensure list rows are keyboard navigable',
    ],
  },
  'countdown-timer': {
    experienceGoal: 'Make countdown tracking feel precise and calm.',
    primaryUserEmotion: 'Prepared and on time',
    informationHierarchy: ['Active countdown', 'Timer list', 'Upcoming timers'],
    visualHierarchy: [
      'Active countdown as primary focus',
      'Remaining time highlighted',
      'Completed timers muted',
    ],
    attentionFlow: ['Timer list', 'Select timer', 'Start countdown', 'Review remaining time'],
    ctaHierarchy: {
      primary: 'Create Timer',
      secondary: ['Start timer'],
      destructive: 'Delete Timer',
      passive: ['Search timers'],
      persistent: ['Create Timer'],
    },
    feedbackModel: {
      afterCreate: 'Timer created and ready to start.',
      afterEdit: 'Timer updated.',
      afterDelete: 'Timer removed.',
      afterPrimaryWorkflow: 'Countdown started.',
      confirmationMessage: 'Start this countdown?',
      successMessage: 'Timer saved.',
      warningMessage: 'End time must be in the future.',
    },
    emptyStateStrategy: 'No timers yet. Create your first countdown to get started.',
    loadingStateStrategy: 'Loading timers...',
    errorStateStrategy: 'Timer could not be saved. Check the duration and try again.',
    successStateStrategy: 'Timer saved.',
    microcopyGuidelines: ['Create timer', 'Start countdown', 'Edit timer'],
    dashboardEmphasis: ['Active timers', 'Upcoming', 'Completed'],
    trustSignals: ['Remaining time updates live'],
    frictionReduction: ['Keep create timer near active countdown'],
    accessibilityGuidance: [
      'Announce countdown completion',
      'Label timer duration fields clearly',
      'Provide visible focus on active timer',
    ],
  },
};

const GENERIC_BLUEPRINT: ExperienceBlueprint = {
  experienceGoal: 'Help users accomplish their goal with clarity and confidence.',
  primaryUserEmotion: 'Capable and oriented',
  informationHierarchy: ['Primary records and actions', 'Summary metrics', 'Filters and settings'],
  visualHierarchy: [
    'Primary action area highlighted',
    'Record list as main focus',
    'Metrics as background context',
  ],
  attentionFlow: ['Overview', 'Select record', 'Perform action', 'Confirmation'],
  ctaHierarchy: {
    primary: 'Create',
    secondary: ['Edit', 'Filter'],
    destructive: 'Delete',
    passive: ['Search'],
    persistent: ['Create'],
  },
  feedbackModel: {
    afterCreate: 'Record created successfully.',
    afterEdit: 'Changes saved.',
    afterDelete: 'Record deleted.',
    afterPrimaryWorkflow: 'Action completed successfully.',
    confirmationMessage: 'Confirm this action?',
    successMessage: 'Saved.',
    warningMessage: 'Please review before continuing.',
  },
  emptyStateStrategy: 'Nothing here yet. Add your first entry to get started.',
  loadingStateStrategy: 'Loading workspace...',
  errorStateStrategy: 'Action could not be completed. Please try again.',
  successStateStrategy: 'Saved.',
  microcopyGuidelines: ['Use clear action verbs', 'Avoid generic entity labels'],
  dashboardEmphasis: ['Recent activity', 'Totals', 'Status overview'],
  trustSignals: ['Changes save automatically'],
  frictionReduction: ['Keep primary action visible on main screen'],
  accessibilityGuidance: [
    'Use semantic headings',
    'Provide visible focus states',
    'Announce status changes',
  ],
};

export function getExperienceBlueprint(domainId: string): ExperienceBlueprint {
  return DOMAIN_BLUEPRINTS[domainId] ?? GENERIC_BLUEPRINT;
}

const GENERIC_WORKFLOW_CTAS = new Set([
  'Create Item',
  'Save Changes',
  'Complete Action',
  'Continue',
  'Create',
]);

export function tailorBlueprint(
  blueprint: ExperienceBlueprint,
  domainProfile: ApplicationDomainProfile,
  creationProfile: DomainCreationProfile,
  workflowModel: WorkflowModel,
): ExperienceBlueprint {
  const workflowCta = workflowModel.criticalActions[0];
  const primaryCta =
    workflowCta && !GENERIC_WORKFLOW_CTAS.has(workflowCta)
      ? workflowCta
      : creationProfile.createActionLabel;

  return {
    ...blueprint,
    ctaHierarchy: {
      ...blueprint.ctaHierarchy,
      primary: primaryCta,
      persistent: [primaryCta, ...blueprint.ctaHierarchy.persistent.filter((a) => a !== primaryCta)],
    },
    microcopyGuidelines: [
      creationProfile.createActionLabel,
      creationProfile.editActionLabel,
      ...blueprint.microcopyGuidelines,
    ],
    experienceGoal: `${blueprint.experienceGoal} (${domainProfile.category})`,
  };
}

export function blueprintToModel(blueprint: ExperienceBlueprint): ProductExperienceModel {
  return {
    experienceGoal: blueprint.experienceGoal,
    primaryUserEmotion: blueprint.primaryUserEmotion,
    informationHierarchy: [...blueprint.informationHierarchy],
    visualHierarchy: [...blueprint.visualHierarchy],
    attentionFlow: [...blueprint.attentionFlow],
    ctaHierarchy: blueprint.ctaHierarchy,
    feedbackModel: blueprint.feedbackModel,
    emptyStateStrategy: blueprint.emptyStateStrategy,
    loadingStateStrategy: blueprint.loadingStateStrategy,
    errorStateStrategy: blueprint.errorStateStrategy,
    successStateStrategy: blueprint.successStateStrategy,
    microcopyGuidelines: [...blueprint.microcopyGuidelines],
    dashboardEmphasis: [...blueprint.dashboardEmphasis],
    trustSignals: [...blueprint.trustSignals],
    frictionReduction: [...blueprint.frictionReduction],
    accessibilityGuidance: [...blueprint.accessibilityGuidance],
  };
}
