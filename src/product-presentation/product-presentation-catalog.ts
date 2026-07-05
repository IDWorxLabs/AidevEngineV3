import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { ProductDesignModel } from '../product-design/product-design-types.js';
import type { ProductArchitectureModel } from '../product-architecture/product-architecture-types.js';
import type { WorkflowModel } from '../workflow/workflow-types.js';
import type { PresentationMode, ProductPresentationModel } from './product-presentation-types.js';

export const PRESENTATION_MODES: readonly PresentationMode[] = ['Focused', 'Balanced', 'Dense', 'Guided'];

export const INFORMATION_DENSITIES = ['Minimal', 'Comfortable', 'Information rich', 'High density'] as const;

export const ENGINEERING_ONLY_PLACEMENT = 'Engineering report only';

export interface PresentationBlueprint {
  presentationMode: PresentationMode;
  primarySurface: string;
  secondarySurfaces: readonly string[];
  hiddenEngineeringSurfaces: readonly string[];
  dashboardComposition: readonly string[];
  navigationPlacement: string;
  ctaPlacement: string;
  searchPlacement: string;
  filterPlacement: string;
  settingsPlacement: string;
  notificationPlacement: string;
  roleInformationPlacement: string;
  riskInformationPlacement: string;
  futureCapabilityPlacement: string;
  informationDensity: string;
  progressiveDisclosureStrategy: string;
  aboveTheFoldPriority: readonly string[];
  screenSections: readonly string[];
  collapsedSections: readonly string[];
  drawerSections: readonly string[];
  modalSections: readonly string[];
  emptyStatePlacement: string;
  detailViewPlacement: string;
  reportingPlacement: string;
  mobilePresentationStrategy: string;
}

const STANDARD_COLLAPSED_SECTIONS = [
  'Workflow explanation',
  'Product experience guidance',
  'Product architecture detail',
  'Product design detail',
] as const;

const STANDARD_DRAWER_SECTIONS = ['Engineering Report', 'Settings'] as const;

const STANDARD_MODAL_SECTIONS = ['Create/edit form', 'Delete confirmation'] as const;

const STANDARD_PROGRESSIVE_DISCLOSURE =
  'Collapse engineering and planning detail behind an Engineering Intelligence drawer';

export const GENERIC_PRESENTATION_DOMAIN_ID = 'generic-application';

const DOMAIN_BLUEPRINTS: Record<string, PresentationBlueprint> = {
  'booking-system': {
    presentationMode: 'Focused',
    primarySurface: "Today's schedule and available slots",
    secondarySurfaces: ['Upcoming reservations', 'Booking search and filters'],
    hiddenEngineeringSurfaces: [
      'User roles',
      'Integration readiness',
      'Architecture risk notes',
      'Future capability notes',
      'Workflow explanation',
    ],
    dashboardComposition: ["Today's schedule", 'Available slots', 'Upcoming reservations', 'Create booking CTA'],
    navigationPlacement: 'Persistent top navigation across schedule, bookings, and customers',
    ctaPlacement: 'Create Booking pinned in the toolbar near the schedule',
    searchPlacement: 'Inline search above the schedule and booking list',
    filterPlacement: 'Inline filter bar above the booking list',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Unobtrusive banner shown only when relevant',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Comfortable',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ["Today's schedule", 'Available slots', 'Create booking CTA'],
    screenSections: ['Header', "Today's schedule", 'Available slots', 'Upcoming reservations', 'Search/filter'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit booking form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the schedule and booking list surface',
    detailViewPlacement: 'Inline detail panel beside the schedule',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Stacked single column; schedule first, create action pinned to the bottom',
  },
  crm: {
    presentationMode: 'Dense',
    primarySurface: 'Pipeline board with deal columns',
    secondarySurfaces: ['Follow-up queue', 'Deal metrics'],
    hiddenEngineeringSurfaces: [
      'Role model',
      'Integration readiness',
      'Product architecture text',
      'Future email automation notes',
    ],
    dashboardComposition: ['Pipeline board', 'Deal metrics', 'Follow-up queue', 'Move lead CTA'],
    navigationPlacement: 'Persistent top navigation across pipeline, customers, and reports',
    ctaPlacement: 'Move Lead pinned near the pipeline columns',
    searchPlacement: 'Inline search above the pipeline and customer list',
    filterPlacement: 'Inline filter bar above the pipeline board',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Follow-up-due badge, unobtrusive',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Information rich',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Pipeline board', 'Deal metrics', 'Move Lead CTA'],
    screenSections: ['Header', 'Deal metrics', 'Pipeline board', 'Follow-up queue', 'Search/filter'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit customer form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the pipeline columns',
    detailViewPlacement: 'Side panel for the selected deal or customer',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Pipeline columns become swipeable tabs',
  },
  'inventory-system': {
    presentationMode: 'Dense',
    primarySurface: 'Stock metrics and product table',
    secondarySurfaces: ['Low-stock warnings', 'Category filters'],
    hiddenEngineeringSurfaces: ['Architecture explanation', 'Future supplier API notes', 'Role descriptions'],
    dashboardComposition: ['Stock metrics', 'Low-stock table', 'Product table', 'Add product CTA'],
    navigationPlacement: 'Persistent top navigation across products, stock, and reports',
    ctaPlacement: 'Add Product pinned in the toolbar above the table',
    searchPlacement: 'Inline search above the product table',
    filterPlacement: 'Inline filter bar above the product table',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Low-stock warning badge inline with the table',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'High density',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Stock metrics', 'Low-stock warnings', 'Product table'],
    screenSections: ['Header', 'Stock metrics', 'Low-stock warnings', 'Product table', 'Search/filter'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit product form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the product table',
    detailViewPlacement: 'Inline detail panel beside the table',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Stacked product cards replace the table on narrow screens',
  },
  'expense-tracker': {
    presentationMode: 'Focused',
    primarySurface: 'Balance summary and ledger',
    secondarySurfaces: ['Income/expense totals', 'Category filters'],
    hiddenEngineeringSurfaces: ['Product architecture notes', 'Future bank integrations', 'Risk explanations'],
    dashboardComposition: ['Balance summary', 'Income/expense totals', 'Ledger', 'Add transaction CTA'],
    navigationPlacement: 'Persistent top navigation across dashboard, transactions, and reports',
    ctaPlacement: 'Add Transaction pinned near the balance summary',
    searchPlacement: 'Inline search above the ledger',
    filterPlacement: 'Category filter chips above the ledger',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Budget warning banner, unobtrusive',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Comfortable',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Balance summary', 'Income/expense totals', 'Add transaction CTA'],
    screenSections: ['Header', 'Balance summary', 'Income/expense totals', 'Ledger', 'Category filters'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit transaction form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the ledger',
    detailViewPlacement: 'Inline transaction detail row expansion',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Stacked balance card above a scrollable ledger',
  },
  'recipe-manager': {
    presentationMode: 'Balanced',
    primarySurface: 'Recipe cards and discovery',
    secondarySurfaces: ['Categories', 'Selected recipe detail'],
    hiddenEngineeringSurfaces: ['Architecture metadata', 'Role readiness', 'Integration notes'],
    dashboardComposition: ['Recipe cards', 'Categories', 'Search/filter', 'Add recipe CTA'],
    navigationPlacement: 'Persistent top navigation across recipes, categories, and favorites',
    ctaPlacement: 'Add Recipe pinned above the card grid',
    searchPlacement: 'Inline search above the recipe card grid',
    filterPlacement: 'Category filter chips above the card grid',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Hidden unless relevant',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Comfortable',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Recipe cards', 'Search/filter', 'Add recipe CTA'],
    screenSections: ['Header', 'Recipe cards', 'Categories', 'Search/filter', 'Selected recipe detail'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit recipe form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the recipe card grid',
    detailViewPlacement: 'Side panel with the selected recipe details',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Single-column card stack; detail opens as a full-screen view',
  },
  'notes-app': {
    presentationMode: 'Focused',
    primarySurface: 'Notes list and editor',
    secondarySurfaces: ['Tags/search'],
    hiddenEngineeringSurfaces: ['Architecture metadata', 'Role readiness', 'Autosave/internal trust notes'],
    dashboardComposition: ['Notes list', 'Editor', 'New note CTA'],
    navigationPlacement: 'Sidebar navigation between the notes list and editor',
    ctaPlacement: 'Write Note pinned above the notes list',
    searchPlacement: 'Inline search above the notes list',
    filterPlacement: 'Tag filter chips above the notes list',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Save-status indicator inline with the editor',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Minimal',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Notes list', 'Editor', 'New note CTA'],
    screenSections: ['Header', 'Notes list', 'Editor', 'Tags/search'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Delete confirmation'],
    emptyStatePlacement: 'Inline within the editor pane',
    detailViewPlacement: 'Editor pane beside the notes list',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Full-screen editor with a collapsible notes list drawer',
  },
  'restaurant-pos': {
    presentationMode: 'Dense',
    primarySurface: 'Order queue and current order/cart',
    secondarySurfaces: ['Menu', 'Table/order status'],
    hiddenEngineeringSurfaces: ['Future integrations', 'Role model', 'Architecture notes'],
    dashboardComposition: ['Order queue', 'Menu', 'Current order/cart', 'Checkout CTA'],
    navigationPlacement: 'Persistent top navigation across orders, menu, and tables',
    ctaPlacement: 'Checkout pinned near the current order/cart',
    searchPlacement: 'Inline search above the menu',
    filterPlacement: 'Category filter chips above the menu',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Order-status badges inline with the queue',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Information rich',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Order queue', 'Current order/cart', 'Checkout CTA'],
    screenSections: ['Header', 'Order queue', 'Menu', 'Current order/cart', 'Table/order status'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit order form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the order queue',
    detailViewPlacement: 'Inline order detail panel',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Tabbed view switching between menu, cart, and order queue',
  },
  'school-portal': {
    presentationMode: 'Guided',
    primarySurface: 'Timetable and announcements',
    secondarySurfaces: ['Assignments', 'Grades/class summary'],
    hiddenEngineeringSurfaces: ['Architecture metadata', 'Permission explanation'],
    dashboardComposition: ['Timetable', 'Announcements', 'Assignments', 'Class summary'],
    navigationPlacement: 'Role-aware persistent navigation across timetable, classes, and students',
    ctaPlacement: 'Primary action pinned near the relevant section',
    searchPlacement: 'Inline search above the student/class list',
    filterPlacement: 'Inline filter bar above the list',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Announcement banner, unobtrusive',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Comfortable',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Timetable', 'Announcements', 'Assignments'],
    screenSections: ['Header', 'Timetable', 'Announcements', 'Assignments', 'Class summary'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit entry form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the timetable/assignments surface',
    detailViewPlacement: 'Side panel for the selected class or student',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Stacked timetable and announcements with tab navigation',
  },
  'fitness-tracker': {
    presentationMode: 'Balanced',
    primarySurface: "Today's goals and progress",
    secondarySurfaces: ['Streaks', 'Activity log'],
    hiddenEngineeringSurfaces: ['Architecture metadata', 'Future integrations'],
    dashboardComposition: ['Goals', 'Progress', 'Streaks', 'Add workout CTA'],
    navigationPlacement: 'Persistent top navigation across today, workouts, and progress',
    ctaPlacement: 'Add Workout pinned near the goals panel',
    searchPlacement: 'Inline search above the activity log',
    filterPlacement: 'Inline filter chips above the activity log',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Streak-at-risk banner, unobtrusive',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: 'Comfortable',
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: ['Goals', 'Progress', 'Add workout CTA'],
    screenSections: ['Header', 'Goals', 'Progress', 'Streaks', 'Activity log'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: ['Create/edit workout form', 'Delete confirmation'],
    emptyStatePlacement: 'Inline within the activity log',
    detailViewPlacement: 'Inline workout detail expansion',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Stacked goals/progress cards with bottom navigation for quick actions',
  },
};

function densityToMode(density: string): PresentationMode {
  if (density === 'High density' || density === 'Information rich') return 'Dense';
  if (density === 'Minimal') return 'Focused';
  if (density === 'Comfortable') return 'Balanced';
  return 'Guided';
}

export function inferGenericPresentation(
  domainProfile: ApplicationDomainProfile,
  designModel: ProductDesignModel,
  architectureModel: ProductArchitectureModel,
  workflowModel: WorkflowModel,
): PresentationBlueprint {
  const primaryModule = architectureModel.primaryModules[0] ?? designModel.informationHierarchy.primaryFocus;
  const secondaryModules = architectureModel.secondaryModules.slice(0, 2);
  const secondarySurfaces = secondaryModules.length > 0 ? secondaryModules : [designModel.informationHierarchy.secondaryFocus];
  const criticalAction = workflowModel.criticalActions[0] ?? `Create ${domainProfile.entityLabel}`;
  const navSections = architectureModel.navigationArchitecture.slice(0, 3);

  const dashboardComposition = [
    primaryModule,
    designModel.informationHierarchy.secondaryFocus,
    `${criticalAction} CTA`,
  ].filter((value, index, all) => Boolean(value) && all.indexOf(value) === index);

  return {
    presentationMode: densityToMode(designModel.visualDensity),
    primarySurface: primaryModule,
    secondarySurfaces,
    hiddenEngineeringSurfaces: [
      'User roles',
      'Integration readiness',
      'Architecture risk notes',
      'Future capability notes',
      'Workflow explanation',
    ],
    dashboardComposition,
    navigationPlacement:
      navSections.length > 0
        ? `Persistent navigation across ${navSections.join(', ')}`
        : 'Persistent top navigation across primary sections',
    ctaPlacement: `${criticalAction} pinned near the primary surface`,
    searchPlacement: 'Inline search above the primary list',
    filterPlacement: 'Inline filter bar above the primary list',
    settingsPlacement: 'Secondary settings area, not on the primary dashboard',
    notificationPlacement: 'Unobtrusive banner shown only when relevant',
    roleInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    riskInformationPlacement: ENGINEERING_ONLY_PLACEMENT,
    futureCapabilityPlacement: ENGINEERING_ONLY_PLACEMENT,
    informationDensity: designModel.visualDensity,
    progressiveDisclosureStrategy: STANDARD_PROGRESSIVE_DISCLOSURE,
    aboveTheFoldPriority: [primaryModule, ...secondarySurfaces.slice(0, 1), `${criticalAction} CTA`],
    screenSections: ['Header', primaryModule, ...secondarySurfaces, 'Search/filter'],
    collapsedSections: [...STANDARD_COLLAPSED_SECTIONS],
    drawerSections: [...STANDARD_DRAWER_SECTIONS],
    modalSections: [...STANDARD_MODAL_SECTIONS],
    emptyStatePlacement: 'Inline within the primary list/table',
    detailViewPlacement: 'Inline detail panel beside the primary list',
    reportingPlacement: 'Engineering Report drawer only',
    mobilePresentationStrategy: 'Stacked single column with the primary surface shown first',
  };
}

export function getPresentationBlueprint(
  domainProfile: ApplicationDomainProfile,
  designModel: ProductDesignModel,
  architectureModel: ProductArchitectureModel,
  workflowModel: WorkflowModel,
): PresentationBlueprint {
  const known = DOMAIN_BLUEPRINTS[domainProfile.domainId];
  if (known) return known;
  return inferGenericPresentation(domainProfile, designModel, architectureModel, workflowModel);
}

export function isKnownPresentationDomain(domainId: string): boolean {
  return Boolean(DOMAIN_BLUEPRINTS[domainId]);
}

export function blueprintToPresentationModel(blueprint: PresentationBlueprint): ProductPresentationModel {
  return {
    presentationMode: blueprint.presentationMode,
    primarySurface: blueprint.primarySurface,
    secondarySurfaces: [...blueprint.secondarySurfaces],
    hiddenEngineeringSurfaces: [...blueprint.hiddenEngineeringSurfaces],
    dashboardComposition: [...blueprint.dashboardComposition],
    navigationPlacement: blueprint.navigationPlacement,
    ctaPlacement: blueprint.ctaPlacement,
    searchPlacement: blueprint.searchPlacement,
    filterPlacement: blueprint.filterPlacement,
    settingsPlacement: blueprint.settingsPlacement,
    notificationPlacement: blueprint.notificationPlacement,
    roleInformationPlacement: blueprint.roleInformationPlacement,
    riskInformationPlacement: blueprint.riskInformationPlacement,
    futureCapabilityPlacement: blueprint.futureCapabilityPlacement,
    informationDensity: blueprint.informationDensity,
    progressiveDisclosureStrategy: blueprint.progressiveDisclosureStrategy,
    aboveTheFoldPriority: [...blueprint.aboveTheFoldPriority],
    screenSections: [...blueprint.screenSections],
    collapsedSections: [...blueprint.collapsedSections],
    drawerSections: [...blueprint.drawerSections],
    modalSections: [...blueprint.modalSections],
    emptyStatePlacement: blueprint.emptyStatePlacement,
    detailViewPlacement: blueprint.detailViewPlacement,
    reportingPlacement: blueprint.reportingPlacement,
    mobilePresentationStrategy: blueprint.mobilePresentationStrategy,
  };
}
