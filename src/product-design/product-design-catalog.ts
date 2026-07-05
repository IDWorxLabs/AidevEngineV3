import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { InformationHierarchyModel, ProductDesignModel } from './product-design-types.js';

export const PRODUCT_PERSONALITY_TRAITS = [
  'Professional',
  'Friendly',
  'Premium',
  'Playful',
  'Elegant',
  'Technical',
  'Minimal',
  'Bold',
  'Calm',
  'Energetic',
] as const;

export const VISUAL_TONES = [
  'Corporate',
  'Consumer',
  'Medical',
  'Educational',
  'Financial',
  'Creative',
  'Government',
  'Luxury',
  'Industrial',
] as const;

export const COMMUNICATION_STYLES = [
  'Formal',
  'Conversational',
  'Encouraging',
  'Confident',
  'Helpful',
  'Reassuring',
  'Minimal',
  'Playful',
] as const;

export const INTERACTION_PHILOSOPHIES = [
  'Dashboard-first',
  'Content-first',
  'Action-first',
  'Wizard',
  'Workflow',
  'Explorer',
  'Kanban',
  'Timeline',
  'Calendar',
  'Card',
  'Table',
] as const;

export const VISUAL_DENSITIES = ['Minimal', 'Comfortable', 'Information rich', 'High density'] as const;

export const SPACING_PHILOSOPHIES = ['Compact', 'Balanced', 'Open'] as const;

export const CORNER_RADII = ['Sharp', 'Medium', 'Rounded', 'Soft'] as const;

export const COMPONENT_STYLES = ['Cards', 'Panels', 'Floating', 'Outlined', 'Filled', 'Minimal'] as const;

export const SHADOW_STRATEGIES = ['Flat', 'Subtle', 'Medium', 'Elevated'] as const;

export const TYPOGRAPHY_PERSONALITIES = [
  'Modern',
  'Corporate',
  'Elegant',
  'Friendly',
  'Technical',
  'Premium',
] as const;

export const MOTION_PERSONALITIES = ['Static', 'Gentle', 'Responsive', 'Dynamic', 'Energetic'] as const;

export const ACCESSIBILITY_GOAL_VOCABULARY = [
  'Readability',
  'Contrast',
  'Large touch targets',
  'Keyboard friendly',
  'Screen reader ready',
] as const;

export const RESPONSIVENESS_TARGETS = ['Desktop', 'Tablet', 'Mobile', 'Large display'] as const;

export interface DesignBlueprint {
  productPersonality: readonly string[];
  visualTone: string;
  communicationStyle: readonly string[];
  interactionPhilosophy: string;
  primaryEmotionalGoals: readonly string[];
  visualDensity: string;
  spacingPhilosophy: string;
  cornerRadius: string;
  componentStyle: readonly string[];
  shadowStrategy: string;
  typographyPersonality: string;
  motionPersonality: string;
  informationHierarchy: InformationHierarchyModel;
  accessibilityGoals: readonly string[];
  futureResponsiveness: readonly string[];
}

const DOMAIN_BLUEPRINTS: Record<string, DesignBlueprint> = {
  'booking-system': {
    productPersonality: ['Calm', 'Professional', 'Minimal'],
    visualTone: 'Consumer',
    communicationStyle: ['Reassuring', 'Confident', 'Helpful'],
    interactionPhilosophy: 'Calendar',
    primaryEmotionalGoals: ['Trust', 'Confidence', 'Organization'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Rounded',
    componentStyle: ['Cards', 'Outlined'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Modern',
    motionPersonality: 'Gentle',
    informationHierarchy: {
      primaryFocus: "Today's schedule and available time slots",
      secondaryFocus: 'Upcoming reservations',
      supportingContent: 'Booking metrics and history',
      ctaEmphasis: 'Create Booking stays visible near open slots',
      scanningOrder: ['Schedule', 'Available slot', 'Create booking', 'Confirmation'],
    },
    accessibilityGoals: ['Readability', 'Contrast', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  crm: {
    productPersonality: ['Professional', 'Bold'],
    visualTone: 'Corporate',
    communicationStyle: ['Confident', 'Formal', 'Helpful'],
    interactionPhilosophy: 'Dashboard-first',
    primaryEmotionalGoals: ['Confidence', 'Productivity', 'Control'],
    visualDensity: 'Information rich',
    spacingPhilosophy: 'Compact',
    cornerRadius: 'Medium',
    componentStyle: ['Panels', 'Cards'],
    shadowStrategy: 'Flat',
    typographyPersonality: 'Corporate',
    motionPersonality: 'Responsive',
    informationHierarchy: {
      primaryFocus: 'Pipeline stages and hot leads',
      secondaryFocus: 'Follow-ups due',
      supportingContent: 'Pipeline analytics',
      ctaEmphasis: 'Move Lead is the persistent primary action',
      scanningOrder: ['Pipeline column', 'Lead card', 'Move stage', 'Follow-up'],
    },
    accessibilityGoals: ['Contrast', 'Keyboard friendly', 'Screen reader ready'],
    futureResponsiveness: ['Desktop', 'Tablet'],
  },
  'inventory-system': {
    productPersonality: ['Technical', 'Minimal'],
    visualTone: 'Industrial',
    communicationStyle: ['Confident', 'Minimal'],
    interactionPhilosophy: 'Table',
    primaryEmotionalGoals: ['Speed', 'Control', 'Organization'],
    visualDensity: 'High density',
    spacingPhilosophy: 'Compact',
    cornerRadius: 'Sharp',
    componentStyle: ['Outlined', 'Filled'],
    shadowStrategy: 'Flat',
    typographyPersonality: 'Technical',
    motionPersonality: 'Static',
    informationHierarchy: {
      primaryFocus: 'Stock levels and low-stock alerts',
      secondaryFocus: 'Category breakdown',
      supportingContent: 'Supplier and reorder data',
      ctaEmphasis: 'Adjust Stock sits next to quantity fields',
      scanningOrder: ['Overview', 'Low stock alert', 'Select product', 'Adjust quantity'],
    },
    accessibilityGoals: ['Contrast', 'Large touch targets'],
    futureResponsiveness: ['Desktop', 'Tablet'],
  },
  'expense-tracker': {
    productPersonality: ['Professional', 'Minimal'],
    visualTone: 'Financial',
    communicationStyle: ['Formal', 'Confident'],
    interactionPhilosophy: 'Dashboard-first',
    primaryEmotionalGoals: ['Trust', 'Control', 'Focus'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Medium',
    componentStyle: ['Cards', 'Outlined'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Corporate',
    motionPersonality: 'Static',
    informationHierarchy: {
      primaryFocus: 'Balance and recent transactions',
      secondaryFocus: 'Monthly totals',
      supportingContent: 'Category breakdown',
      ctaEmphasis: 'Add Transaction stays near the balance card',
      scanningOrder: ['Balance card', 'Add transaction', 'Ledger', 'Category summary'],
    },
    accessibilityGoals: ['Readability', 'Contrast'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'invoice-system': {
    productPersonality: ['Professional', 'Minimal'],
    visualTone: 'Financial',
    communicationStyle: ['Formal', 'Confident'],
    interactionPhilosophy: 'Table',
    primaryEmotionalGoals: ['Trust', 'Control', 'Focus'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Sharp',
    componentStyle: ['Outlined', 'Panels'],
    shadowStrategy: 'Flat',
    typographyPersonality: 'Corporate',
    motionPersonality: 'Static',
    informationHierarchy: {
      primaryFocus: 'Outstanding invoices and payments due',
      secondaryFocus: 'Billing summary',
      supportingContent: 'Client and payment details',
      ctaEmphasis: 'Create Invoice anchors the toolbar',
      scanningOrder: ['Invoice list', 'Payment status', 'Create invoice', 'Confirmation'],
    },
    accessibilityGoals: ['Readability', 'Contrast'],
    futureResponsiveness: ['Desktop', 'Tablet'],
  },
  'budget-planner': {
    productPersonality: ['Professional', 'Minimal'],
    visualTone: 'Financial',
    communicationStyle: ['Reassuring', 'Confident'],
    interactionPhilosophy: 'Dashboard-first',
    primaryEmotionalGoals: ['Control', 'Organization', 'Trust'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Medium',
    componentStyle: ['Cards', 'Outlined'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Corporate',
    motionPersonality: 'Static',
    informationHierarchy: {
      primaryFocus: 'Budget overview and remaining balance',
      secondaryFocus: 'Category breakdown',
      supportingContent: 'Monthly totals',
      ctaEmphasis: 'Add Budget Item stays near category totals',
      scanningOrder: ['Overview', 'Category breakdown', 'Add entry', 'Monthly totals'],
    },
    accessibilityGoals: ['Readability', 'Contrast'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'recipe-manager': {
    productPersonality: ['Friendly', 'Playful'],
    visualTone: 'Consumer',
    communicationStyle: ['Encouraging', 'Conversational'],
    interactionPhilosophy: 'Card',
    primaryEmotionalGoals: ['Delight', 'Creativity'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Open',
    cornerRadius: 'Rounded',
    componentStyle: ['Cards', 'Floating'],
    shadowStrategy: 'Medium',
    typographyPersonality: 'Friendly',
    motionPersonality: 'Gentle',
    informationHierarchy: {
      primaryFocus: 'Recipe cards and discovery',
      secondaryFocus: 'Favorites and cooking time',
      supportingContent: 'Category filters',
      ctaEmphasis: 'Add Recipe stays visible above the grid',
      scanningOrder: ['Recipe card', 'Ingredients', 'Cooking time', 'Favorite'],
    },
    accessibilityGoals: ['Readability', 'Large touch targets'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'habit-tracker': {
    productPersonality: ['Energetic', 'Playful'],
    visualTone: 'Consumer',
    communicationStyle: ['Encouraging', 'Confident'],
    interactionPhilosophy: 'Dashboard-first',
    primaryEmotionalGoals: ['Delight', 'Productivity', 'Confidence'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Rounded',
    componentStyle: ['Cards'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Friendly',
    motionPersonality: 'Dynamic',
    informationHierarchy: {
      primaryFocus: "Today's checklist",
      secondaryFocus: 'Streaks and progress',
      supportingContent: 'Weekly overview',
      ctaEmphasis: 'Complete Habit stays on the today panel',
      scanningOrder: ['Today panel', 'Complete habit', 'Streak', 'Weekly overview'],
    },
    accessibilityGoals: ['Readability', 'Large touch targets'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'fitness-tracker': {
    productPersonality: ['Energetic', 'Bold'],
    visualTone: 'Consumer',
    communicationStyle: ['Encouraging', 'Confident'],
    interactionPhilosophy: 'Dashboard-first',
    primaryEmotionalGoals: ['Delight', 'Confidence', 'Productivity'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Rounded',
    componentStyle: ['Cards', 'Floating'],
    shadowStrategy: 'Medium',
    typographyPersonality: 'Modern',
    motionPersonality: 'Energetic',
    informationHierarchy: {
      primaryFocus: "Today's workout",
      secondaryFocus: 'Exercise progress',
      supportingContent: 'Weekly stats',
      ctaEmphasis: 'Complete Workout anchors the today panel',
      scanningOrder: ['Today workout', 'Complete exercise', 'Progress', 'Weekly stats'],
    },
    accessibilityGoals: ['Contrast', 'Large touch targets'],
    futureResponsiveness: ['Mobile', 'Tablet', 'Desktop'],
  },
  'notes-app': {
    productPersonality: ['Calm', 'Minimal'],
    visualTone: 'Creative',
    communicationStyle: ['Minimal', 'Helpful'],
    interactionPhilosophy: 'Content-first',
    primaryEmotionalGoals: ['Focus', 'Organization'],
    visualDensity: 'Minimal',
    spacingPhilosophy: 'Open',
    cornerRadius: 'Medium',
    componentStyle: ['Minimal', 'Panels'],
    shadowStrategy: 'Flat',
    typographyPersonality: 'Modern',
    motionPersonality: 'Gentle',
    informationHierarchy: {
      primaryFocus: 'Editor and the active note',
      secondaryFocus: 'Recent and pinned notes',
      supportingContent: 'Tags and metadata',
      ctaEmphasis: 'Write Note stays reachable from the sidebar',
      scanningOrder: ['Sidebar note', 'Editor', 'Tags', 'Save status'],
    },
    accessibilityGoals: ['Readability', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'contact-manager': {
    productPersonality: ['Professional', 'Friendly'],
    visualTone: 'Corporate',
    communicationStyle: ['Helpful', 'Confident'],
    interactionPhilosophy: 'Table',
    primaryEmotionalGoals: ['Organization', 'Speed'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Medium',
    componentStyle: ['Cards', 'Outlined'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Modern',
    motionPersonality: 'Responsive',
    informationHierarchy: {
      primaryFocus: 'Contact list and search',
      secondaryFocus: 'Recent contacts',
      supportingContent: 'Groups and metrics',
      ctaEmphasis: 'Add Contact stays near search and list',
      scanningOrder: ['Contact list', 'Search', 'Open contact', 'Save details'],
    },
    accessibilityGoals: ['Readability', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'school-portal': {
    productPersonality: ['Friendly', 'Calm'],
    visualTone: 'Educational',
    communicationStyle: ['Encouraging', 'Helpful'],
    interactionPhilosophy: 'Dashboard-first',
    primaryEmotionalGoals: ['Trust', 'Organization', 'Delight'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Rounded',
    componentStyle: ['Cards'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Friendly',
    motionPersonality: 'Gentle',
    informationHierarchy: {
      primaryFocus: 'Class overview and announcements',
      secondaryFocus: 'Student list and attendance',
      supportingContent: 'Reports and schedules',
      ctaEmphasis: 'Announcements stay visible near the top',
      scanningOrder: ['Timetable', 'Classes', 'Students', 'Announcements'],
    },
    accessibilityGoals: ['Readability', 'Large touch targets', 'Screen reader ready'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'restaurant-pos': {
    productPersonality: ['Friendly', 'Bold'],
    visualTone: 'Consumer',
    communicationStyle: ['Conversational', 'Encouraging'],
    interactionPhilosophy: 'Kanban',
    primaryEmotionalGoals: ['Speed', 'Delight', 'Organization'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Rounded',
    componentStyle: ['Cards', 'Filled'],
    shadowStrategy: 'Medium',
    typographyPersonality: 'Friendly',
    motionPersonality: 'Responsive',
    informationHierarchy: {
      primaryFocus: 'Order queue and table overview',
      secondaryFocus: 'Kitchen status',
      supportingContent: 'Sales summary',
      ctaEmphasis: 'New Order stays reachable from every screen',
      scanningOrder: ['Order queue', 'Table', 'Kitchen ticket', 'Payment'],
    },
    accessibilityGoals: ['Contrast', 'Large touch targets'],
    futureResponsiveness: ['Tablet', 'Desktop', 'Mobile'],
  },
  calendar: {
    productPersonality: ['Calm', 'Professional'],
    visualTone: 'Corporate',
    communicationStyle: ['Reassuring', 'Confident'],
    interactionPhilosophy: 'Calendar',
    primaryEmotionalGoals: ['Organization', 'Control', 'Trust'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Medium',
    componentStyle: ['Cards', 'Outlined'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Modern',
    motionPersonality: 'Gentle',
    informationHierarchy: {
      primaryFocus: 'Calendar view and today',
      secondaryFocus: 'Upcoming events',
      supportingContent: 'Search and filters',
      ctaEmphasis: 'Create Event stays visible on the calendar',
      scanningOrder: ['Calendar view', 'Selected day', 'Create event', 'Reminder'],
    },
    accessibilityGoals: ['Readability', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'task-manager': {
    productPersonality: ['Professional', 'Minimal'],
    visualTone: 'Corporate',
    communicationStyle: ['Confident', 'Minimal'],
    interactionPhilosophy: 'Kanban',
    primaryEmotionalGoals: ['Focus', 'Organization', 'Productivity'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Medium',
    componentStyle: ['Cards', 'Panels'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Modern',
    motionPersonality: 'Responsive',
    informationHierarchy: {
      primaryFocus: 'Task list and priorities',
      secondaryFocus: 'Due dates',
      supportingContent: 'Completed tasks',
      ctaEmphasis: 'Create Task anchors the toolbar',
      scanningOrder: ['Task list', 'Priority', 'Due date', 'Completion'],
    },
    accessibilityGoals: ['Readability', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'project-manager': {
    productPersonality: ['Professional', 'Bold'],
    visualTone: 'Corporate',
    communicationStyle: ['Confident', 'Helpful'],
    interactionPhilosophy: 'Kanban',
    primaryEmotionalGoals: ['Organization', 'Productivity', 'Control'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Medium',
    componentStyle: ['Cards', 'Panels'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Modern',
    motionPersonality: 'Responsive',
    informationHierarchy: {
      primaryFocus: 'Project board and milestones',
      secondaryFocus: 'Team progress',
      supportingContent: 'Recent activity',
      ctaEmphasis: 'Create Project stays near the board header',
      scanningOrder: ['Board', 'Task card', 'Assignment', 'Milestone'],
    },
    accessibilityGoals: ['Readability', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  'countdown-timer': {
    productPersonality: ['Minimal', 'Calm'],
    visualTone: 'Consumer',
    communicationStyle: ['Minimal', 'Reassuring'],
    interactionPhilosophy: 'Action-first',
    primaryEmotionalGoals: ['Focus', 'Speed'],
    visualDensity: 'Minimal',
    spacingPhilosophy: 'Open',
    cornerRadius: 'Rounded',
    componentStyle: ['Floating', 'Minimal'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Modern',
    motionPersonality: 'Dynamic',
    informationHierarchy: {
      primaryFocus: 'Active countdown',
      secondaryFocus: 'Timer list',
      supportingContent: 'Upcoming timers',
      ctaEmphasis: 'Create Timer stays near the active countdown',
      scanningOrder: ['Timer list', 'Select timer', 'Start countdown', 'Remaining time'],
    },
    accessibilityGoals: ['Readability', 'Large touch targets'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
};

export const GENERIC_DESIGN_DOMAIN_ID = 'generic-application';

interface GenericIdentityRule {
  keywords: readonly string[];
  blueprint: DesignBlueprint;
}

function genericHierarchy(
  primaryFocus: string,
  secondaryFocus: string,
  supportingContent: string,
  ctaEmphasis: string,
  scanningOrder: readonly string[],
): InformationHierarchyModel {
  return { primaryFocus, secondaryFocus, supportingContent, ctaEmphasis, scanningOrder };
}

const GENERIC_IDENTITY_RULES: readonly GenericIdentityRule[] = [
  {
    keywords: ['medical', 'health', 'clinic', 'patient', 'hospital', 'care'],
    blueprint: {
      productPersonality: ['Calm', 'Professional'],
      visualTone: 'Medical',
      communicationStyle: ['Reassuring', 'Helpful'],
      interactionPhilosophy: 'Dashboard-first',
      primaryEmotionalGoals: ['Safety', 'Trust', 'Focus'],
      visualDensity: 'Comfortable',
      spacingPhilosophy: 'Balanced',
      cornerRadius: 'Rounded',
      componentStyle: ['Cards', 'Outlined'],
      shadowStrategy: 'Subtle',
      typographyPersonality: 'Modern',
      motionPersonality: 'Gentle',
      informationHierarchy: genericHierarchy(
        'Primary records and current status',
        'History and recent updates',
        'Reference details',
        'Primary action stays visible near the record',
        ['Overview', 'Select record', 'Review details', 'Confirm action'],
      ),
      accessibilityGoals: ['Readability', 'Contrast', 'Screen reader ready'],
      futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
    },
  },
  {
    keywords: ['portfolio', 'gallery', 'design', 'creative', 'art', 'photography'],
    blueprint: {
      productPersonality: ['Elegant', 'Minimal'],
      visualTone: 'Luxury',
      communicationStyle: ['Minimal', 'Confident'],
      interactionPhilosophy: 'Content-first',
      primaryEmotionalGoals: ['Creativity', 'Delight'],
      visualDensity: 'Minimal',
      spacingPhilosophy: 'Open',
      cornerRadius: 'Soft',
      componentStyle: ['Minimal', 'Floating'],
      shadowStrategy: 'Elevated',
      typographyPersonality: 'Elegant',
      motionPersonality: 'Gentle',
      informationHierarchy: genericHierarchy(
        'Visual showcase of primary work',
        'Collections and categories',
        'Supporting notes',
        'Primary action is understated and unobtrusive',
        ['Showcase', 'Select item', 'View detail', 'Contact'],
      ),
      accessibilityGoals: ['Readability', 'Contrast'],
      futureResponsiveness: ['Desktop', 'Tablet', 'Mobile', 'Large display'],
    },
  },
  {
    keywords: ['government', 'civic', 'public', 'municipal', 'permit'],
    blueprint: {
      productPersonality: ['Professional', 'Minimal'],
      visualTone: 'Government',
      communicationStyle: ['Formal', 'Helpful'],
      interactionPhilosophy: 'Wizard',
      primaryEmotionalGoals: ['Trust', 'Safety', 'Organization'],
      visualDensity: 'Comfortable',
      spacingPhilosophy: 'Balanced',
      cornerRadius: 'Sharp',
      componentStyle: ['Outlined', 'Panels'],
      shadowStrategy: 'Flat',
      typographyPersonality: 'Corporate',
      motionPersonality: 'Static',
      informationHierarchy: genericHierarchy(
        'Required forms and current status',
        'Instructions and requirements',
        'Reference and history',
        'Primary submission action is unambiguous',
        ['Instructions', 'Form', 'Review', 'Submit'],
      ),
      accessibilityGoals: ['Readability', 'Contrast', 'Keyboard friendly', 'Screen reader ready'],
      futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
    },
  },
  {
    keywords: ['education', 'school', 'course', 'student', 'learning', 'classroom'],
    blueprint: {
      productPersonality: ['Friendly', 'Calm'],
      visualTone: 'Educational',
      communicationStyle: ['Encouraging', 'Helpful'],
      interactionPhilosophy: 'Dashboard-first',
      primaryEmotionalGoals: ['Trust', 'Organization', 'Delight'],
      visualDensity: 'Comfortable',
      spacingPhilosophy: 'Balanced',
      cornerRadius: 'Rounded',
      componentStyle: ['Cards'],
      shadowStrategy: 'Subtle',
      typographyPersonality: 'Friendly',
      motionPersonality: 'Gentle',
      informationHierarchy: genericHierarchy(
        'Current progress and next steps',
        'Schedule and announcements',
        'Reference materials',
        'Primary action is encouraging and low-pressure',
        ['Overview', 'Select item', 'Review progress', 'Continue'],
      ),
      accessibilityGoals: ['Readability', 'Large touch targets', 'Screen reader ready'],
      futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
    },
  },
  {
    keywords: ['finance', 'accounting', 'bank', 'billing', 'payroll', 'tax'],
    blueprint: {
      productPersonality: ['Professional', 'Minimal'],
      visualTone: 'Financial',
      communicationStyle: ['Formal', 'Confident'],
      interactionPhilosophy: 'Dashboard-first',
      primaryEmotionalGoals: ['Trust', 'Control', 'Focus'],
      visualDensity: 'Comfortable',
      spacingPhilosophy: 'Balanced',
      cornerRadius: 'Sharp',
      componentStyle: ['Outlined', 'Panels'],
      shadowStrategy: 'Flat',
      typographyPersonality: 'Corporate',
      motionPersonality: 'Static',
      informationHierarchy: genericHierarchy(
        'Balances and current totals',
        'Recent activity',
        'Category and historical breakdown',
        'Primary action stays near the totals',
        ['Overview', 'Record', 'Review', 'Confirm'],
      ),
      accessibilityGoals: ['Readability', 'Contrast'],
      futureResponsiveness: ['Desktop', 'Tablet'],
    },
  },
  {
    keywords: ['restaurant', 'food', 'cafe', 'menu', 'dining', 'kitchen'],
    blueprint: {
      productPersonality: ['Friendly', 'Bold'],
      visualTone: 'Consumer',
      communicationStyle: ['Conversational', 'Encouraging'],
      interactionPhilosophy: 'Kanban',
      primaryEmotionalGoals: ['Speed', 'Delight', 'Organization'],
      visualDensity: 'Comfortable',
      spacingPhilosophy: 'Balanced',
      cornerRadius: 'Rounded',
      componentStyle: ['Cards', 'Filled'],
      shadowStrategy: 'Medium',
      typographyPersonality: 'Friendly',
      motionPersonality: 'Responsive',
      informationHierarchy: genericHierarchy(
        'Active orders and queue status',
        'Menu and availability',
        'Sales summary',
        'Primary action stays reachable during service',
        ['Queue', 'Item', 'Status update', 'Completion'],
      ),
      accessibilityGoals: ['Contrast', 'Large touch targets'],
      futureResponsiveness: ['Tablet', 'Desktop', 'Mobile'],
    },
  },
  {
    keywords: ['warehouse', 'logistics', 'factory', 'manufacturing', 'supply', 'shipping'],
    blueprint: {
      productPersonality: ['Technical', 'Minimal'],
      visualTone: 'Industrial',
      communicationStyle: ['Confident', 'Minimal'],
      interactionPhilosophy: 'Table',
      primaryEmotionalGoals: ['Speed', 'Control', 'Organization'],
      visualDensity: 'High density',
      spacingPhilosophy: 'Compact',
      cornerRadius: 'Sharp',
      componentStyle: ['Outlined', 'Filled'],
      shadowStrategy: 'Flat',
      typographyPersonality: 'Technical',
      motionPersonality: 'Static',
      informationHierarchy: genericHierarchy(
        'Operational status and exceptions',
        'Throughput and volume',
        'Reference records',
        'Primary action sits next to the record row',
        ['Overview', 'Select record', 'Update status', 'Confirm'],
      ),
      accessibilityGoals: ['Contrast', 'Large touch targets'],
      futureResponsiveness: ['Desktop', 'Tablet'],
    },
  },
];

const GENERIC_FALLBACK_POOL: readonly DesignBlueprint[] = [
  {
    productPersonality: ['Professional', 'Calm'],
    visualTone: 'Corporate',
    communicationStyle: ['Confident', 'Helpful'],
    interactionPhilosophy: 'Dashboard-first',
    primaryEmotionalGoals: ['Organization', 'Control', 'Focus'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Balanced',
    cornerRadius: 'Medium',
    componentStyle: ['Cards', 'Panels'],
    shadowStrategy: 'Subtle',
    typographyPersonality: 'Modern',
    motionPersonality: 'Responsive',
    informationHierarchy: genericHierarchy(
      'Primary records and key actions',
      'Summary metrics',
      'Filters and settings',
      'Primary action stays visible on the main screen',
      ['Overview', 'Select record', 'Perform action', 'Confirmation'],
    ),
    accessibilityGoals: ['Readability', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  {
    productPersonality: ['Friendly', 'Minimal'],
    visualTone: 'Consumer',
    communicationStyle: ['Helpful', 'Conversational'],
    interactionPhilosophy: 'Card',
    primaryEmotionalGoals: ['Delight', 'Organization'],
    visualDensity: 'Comfortable',
    spacingPhilosophy: 'Open',
    cornerRadius: 'Rounded',
    componentStyle: ['Cards', 'Floating'],
    shadowStrategy: 'Medium',
    typographyPersonality: 'Friendly',
    motionPersonality: 'Gentle',
    informationHierarchy: genericHierarchy(
      'Record cards and quick actions',
      'Recently updated items',
      'Filters and categories',
      'Primary action stays near the record list',
      ['Overview', 'Select card', 'Edit', 'Save'],
    ),
    accessibilityGoals: ['Readability', 'Large touch targets'],
    futureResponsiveness: ['Desktop', 'Tablet', 'Mobile'],
  },
  {
    productPersonality: ['Technical', 'Bold'],
    visualTone: 'Creative',
    communicationStyle: ['Confident', 'Minimal'],
    interactionPhilosophy: 'Table',
    primaryEmotionalGoals: ['Speed', 'Productivity', 'Control'],
    visualDensity: 'Information rich',
    spacingPhilosophy: 'Compact',
    cornerRadius: 'Sharp',
    componentStyle: ['Outlined', 'Filled'],
    shadowStrategy: 'Flat',
    typographyPersonality: 'Technical',
    motionPersonality: 'Static',
    informationHierarchy: genericHierarchy(
      'Record table and bulk actions',
      'Status breakdown',
      'Advanced filters',
      'Primary action anchors the toolbar',
      ['Overview', 'Sort/filter', 'Select record', 'Act'],
    ),
    accessibilityGoals: ['Contrast', 'Keyboard friendly'],
    futureResponsiveness: ['Desktop', 'Tablet'],
  },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function inferGenericDesignIdentity(
  domainProfile: ApplicationDomainProfile,
  creationProfile: DomainCreationProfile,
): DesignBlueprint {
  const haystack = `${domainProfile.category} ${domainProfile.entityLabel} ${domainProfile.entityLabelPlural} ${domainProfile.pageSubtitle}`.toLowerCase();

  for (const rule of GENERIC_IDENTITY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.blueprint;
    }
  }

  const seed = `${domainProfile.category}:${domainProfile.entityLabel}:${creationProfile.domainId}`;
  const index = hashString(seed) % GENERIC_FALLBACK_POOL.length;
  return GENERIC_FALLBACK_POOL[index]!;
}

export function getDesignBlueprint(
  domainProfile: ApplicationDomainProfile,
  creationProfile: DomainCreationProfile,
): DesignBlueprint {
  const known = DOMAIN_BLUEPRINTS[domainProfile.domainId];
  if (known) return known;
  return inferGenericDesignIdentity(domainProfile, creationProfile);
}

export function isKnownDesignDomain(domainId: string): boolean {
  return Boolean(DOMAIN_BLUEPRINTS[domainId]);
}

export function blueprintToModel(blueprint: DesignBlueprint): ProductDesignModel {
  return {
    productPersonality: [...blueprint.productPersonality],
    visualTone: blueprint.visualTone,
    communicationStyle: [...blueprint.communicationStyle],
    interactionPhilosophy: blueprint.interactionPhilosophy,
    primaryEmotionalGoals: [...blueprint.primaryEmotionalGoals],
    visualDensity: blueprint.visualDensity,
    spacingPhilosophy: blueprint.spacingPhilosophy,
    cornerRadius: blueprint.cornerRadius,
    componentStyle: [...blueprint.componentStyle],
    shadowStrategy: blueprint.shadowStrategy,
    typographyPersonality: blueprint.typographyPersonality,
    motionPersonality: blueprint.motionPersonality,
    informationHierarchy: {
      primaryFocus: blueprint.informationHierarchy.primaryFocus,
      secondaryFocus: blueprint.informationHierarchy.secondaryFocus,
      supportingContent: blueprint.informationHierarchy.supportingContent,
      ctaEmphasis: blueprint.informationHierarchy.ctaEmphasis,
      scanningOrder: [...blueprint.informationHierarchy.scanningOrder],
    },
    accessibilityGoals: [...blueprint.accessibilityGoals],
    futureResponsiveness: [...blueprint.futureResponsiveness],
  };
}
