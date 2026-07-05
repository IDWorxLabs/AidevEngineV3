import type {
  EntityRelationship,
  PermissionRule,
  ProductArchitectureModel,
  ProductBoundaries,
} from './product-architecture-types.js';

export interface ArchitectureBlueprint {
  productType: string;
  productGoal: string;
  primaryModules: readonly string[];
  secondaryModules: readonly string[];
  adminModules: readonly string[];
  settingsModules: readonly string[];
  userRoles: readonly string[];
  permissionModel: readonly PermissionRule[];
  dataEntities: readonly string[];
  entityRelationships: readonly EntityRelationship[];
  productBoundaries: ProductBoundaries;
  navigationArchitecture: readonly string[];
  notificationModel: readonly string[];
  integrationReadiness: readonly string[];
  extensibilityPlan: readonly string[];
  riskAreas: readonly string[];
  futureCapabilities: readonly string[];
}

const DOMAIN_BLUEPRINTS: Record<string, ArchitectureBlueprint> = {
  'booking-system': {
    productType: 'Scheduling product',
    productGoal: 'Help businesses manage appointments, availability, and customer bookings.',
    primaryModules: ['Schedule', 'Bookings', 'Customers', 'Availability'],
    secondaryModules: ['Services', 'Calendar', 'Reports'],
    adminModules: ['Booking rules', 'Staff availability', 'Cancellation policies'],
    settingsModules: ['Business hours', 'Notification preferences', 'Calendar settings'],
    userRoles: ['Owner', 'Staff', 'Customer'],
    permissionModel: [
      { role: 'Owner', capabilities: ['view all bookings', 'manage settings', 'manage staff'] },
      { role: 'Staff', capabilities: ['view schedule', 'create bookings', 'edit assigned bookings'] },
      { role: 'Customer', capabilities: ['view own bookings', 'request appointments'] },
    ],
    dataEntities: ['Customer', 'Booking', 'Service', 'Time Slot', 'Availability'],
    entityRelationships: [
      { from: 'Customer', relationship: 'has many', to: 'Bookings' },
      { from: 'Booking', relationship: 'belongs to', to: 'Service' },
      { from: 'Booking', relationship: 'has', to: 'Status' },
      { from: 'Booking', relationship: 'uses', to: 'Time Slot' },
    ],
    productBoundaries: {
      includedNow: ['Schedule', 'Booking CRUD', 'Availability', 'Customer records'],
      futureScope: ['Payment collection', 'SMS reminders', 'External calendar sync'],
    },
    navigationArchitecture: ['Schedule', 'Bookings', 'Customers', 'Reports', 'Settings'],
    notificationModel: ['Booking confirmed', 'Upcoming appointment', 'Cancelled booking', 'Available slot changed'],
    integrationReadiness: ['Calendar sync', 'Email reminders', 'SMS reminders', 'Payments'],
    extensibilityPlan: ['Staff scheduling', 'Reminders', 'Recurring bookings', 'Payment deposits'],
    riskAreas: ['Double booking', 'Timezone conflicts', 'Cancellation policy'],
    futureCapabilities: ['Online payments', 'Automated reminders', 'Multi-location support'],
  },
  crm: {
    productType: 'Sales operations product',
    productGoal: 'Track leads, customers, and pipeline progress through the sales cycle.',
    primaryModules: ['Pipeline', 'Customers', 'Deals', 'Follow-ups'],
    secondaryModules: ['Activities', 'Reports', 'Notes'],
    adminModules: ['Pipeline stages', 'Sales team', 'Lead sources'],
    settingsModules: ['Deal settings', 'Notification preferences', 'Stage configuration'],
    userRoles: ['Sales rep', 'Manager', 'Admin'],
    permissionModel: [
      { role: 'Sales rep', capabilities: ['view assigned customers', 'move leads', 'add notes'] },
      { role: 'Manager', capabilities: ['view pipeline reports', 'reassign customers', 'edit stages'] },
      { role: 'Admin', capabilities: ['manage users', 'configure stages', 'manage settings'] },
    ],
    dataEntities: ['Customer', 'Deal', 'Activity', 'Follow-up', 'Stage'],
    entityRelationships: [
      { from: 'Customer', relationship: 'has many', to: 'Activities' },
      { from: 'Deal', relationship: 'belongs to', to: 'Customer' },
      { from: 'Deal', relationship: 'has', to: 'Stage' },
      { from: 'Follow-up', relationship: 'belongs to', to: 'Customer' },
    ],
    productBoundaries: {
      includedNow: ['Pipeline', 'Customers', 'Follow-ups', 'Deal values'],
      futureScope: ['Email integration', 'Lead scoring', 'Team permissions'],
    },
    navigationArchitecture: ['Pipeline', 'Customers', 'Activities', 'Reports', 'Settings'],
    notificationModel: ['Follow-up due', 'Deal moved', 'Lead inactive'],
    integrationReadiness: ['Email', 'Calendar', 'Contacts import', 'Analytics'],
    extensibilityPlan: ['Lead scoring', 'Team assignment', 'Email sync', 'Sales forecasting'],
    riskAreas: ['Duplicate customers', 'Stale leads', 'Stage misclassification'],
    futureCapabilities: ['Email automation', 'Forecasting', 'Territory management'],
  },
  'inventory-system': {
    productType: 'Operations management product',
    productGoal: 'Monitor stock levels, products, and supply chain readiness.',
    primaryModules: ['Products', 'Stock', 'Low-stock alerts', 'Suppliers'],
    secondaryModules: ['Categories', 'Stock movements', 'Reports'],
    adminModules: ['Warehouse rules', 'Reorder thresholds', 'Suppliers'],
    settingsModules: ['Stock units', 'Currency', 'Notification preferences'],
    userRoles: ['Warehouse manager', 'Staff', 'Admin'],
    permissionModel: [
      { role: 'Warehouse manager', capabilities: ['view stock', 'adjust quantities', 'view reports'] },
      { role: 'Staff', capabilities: ['view products', 'record stock movements'] },
      { role: 'Admin', capabilities: ['manage settings', 'configure thresholds', 'manage suppliers'] },
    ],
    dataEntities: ['Product', 'Category', 'Stock Movement', 'Reorder Rule', 'Supplier'],
    entityRelationships: [
      { from: 'Product', relationship: 'belongs to', to: 'Category' },
      { from: 'Product', relationship: 'has many', to: 'Stock Movements' },
      { from: 'Product', relationship: 'has', to: 'Reorder Rule' },
      { from: 'Supplier', relationship: 'provides', to: 'Products' },
    ],
    productBoundaries: {
      includedNow: ['Product catalog', 'Stock quantities', 'Low-stock alerts', 'Stock value'],
      futureScope: ['Barcode scanning', 'Supplier ordering', 'Warehouse transfers'],
    },
    navigationArchitecture: ['Products', 'Stock', 'Suppliers', 'Reports', 'Settings'],
    notificationModel: ['Low stock', 'Out of stock', 'Stock adjusted', 'Reorder needed'],
    integrationReadiness: ['Barcode scanner', 'Supplier API', 'CSV import/export'],
    extensibilityPlan: ['Suppliers', 'Purchase orders', 'Barcode scanning', 'Warehouse transfers'],
    riskAreas: ['Incorrect stock count', 'Missing reorder threshold', 'Price mismatch'],
    futureCapabilities: ['Multi-warehouse', 'Automated reordering', 'Supplier portal'],
  },
  'expense-tracker': {
    productType: 'Finance tracking product',
    productGoal: 'Track spending, categories, budgets, and financial summaries.',
    primaryModules: ['Transactions', 'Categories', 'Budget', 'Dashboard'],
    secondaryModules: ['Reports', 'Monthly summaries', 'Recurring expenses'],
    adminModules: ['Category rules', 'Budget limits'],
    settingsModules: ['Currency', 'Date format', 'Export options'],
    userRoles: ['Owner', 'Viewer'],
    permissionModel: [
      { role: 'Owner', capabilities: ['view all transactions', 'create', 'edit', 'delete', 'manage settings'] },
      { role: 'Viewer', capabilities: ['view reports', 'view dashboard'] },
    ],
    dataEntities: ['Transaction', 'Category', 'Budget', 'Monthly Summary'],
    entityRelationships: [
      { from: 'Transaction', relationship: 'belongs to', to: 'Category' },
      { from: 'Budget', relationship: 'tracks', to: 'Categories' },
      { from: 'Monthly Summary', relationship: 'derives from', to: 'Transactions' },
    ],
    productBoundaries: {
      includedNow: ['Transactions', 'Categories', 'Dashboard', 'Balance tracking'],
      futureScope: ['Bank import', 'Recurring expenses', 'Multi-user budgets'],
    },
    navigationArchitecture: ['Dashboard', 'Transactions', 'Budgets', 'Reports', 'Settings'],
    notificationModel: ['Budget exceeded', 'Large transaction', 'Monthly summary ready'],
    integrationReadiness: ['Bank import', 'CSV export', 'Accounting tools'],
    extensibilityPlan: ['Budgets', 'Recurring expenses', 'Export', 'Bank integration'],
    riskAreas: ['Incorrect totals', 'Duplicate transactions', 'Wrong category'],
    futureCapabilities: ['Bank sync', 'Receipt scanning', 'Shared budgets'],
  },
  'recipe-manager': {
    productType: 'Content collection product',
    productGoal: 'Organize recipes, ingredients, and cooking preferences.',
    primaryModules: ['Recipes', 'Categories', 'Favorites', 'Ingredients'],
    secondaryModules: ['Search', 'Collections', 'Cooking time'],
    adminModules: ['Category rules', 'Import templates'],
    settingsModules: ['Display preferences', 'Unit preferences'],
    userRoles: ['Owner', 'Contributor'],
    permissionModel: [
      { role: 'Owner', capabilities: ['view all recipes', 'create', 'edit', 'delete', 'manage settings'] },
      { role: 'Contributor', capabilities: ['view recipes', 'add recipes', 'favorite recipes'] },
    ],
    dataEntities: ['Recipe', 'Category', 'Ingredient', 'Favorite', 'Collection'],
    entityRelationships: [
      { from: 'Recipe', relationship: 'belongs to', to: 'Category' },
      { from: 'Recipe', relationship: 'has many', to: 'Ingredients' },
      { from: 'Recipe', relationship: 'can be', to: 'Favorited' },
    ],
    productBoundaries: {
      includedNow: ['Recipe browsing', 'Categories', 'Favorites', 'Ingredients list'],
      futureScope: ['Meal planning', 'Shopping lists', 'Nutrition tracking'],
    },
    navigationArchitecture: ['Recipes', 'Categories', 'Favorites', 'Collections', 'Settings'],
    notificationModel: ['Recipe added', 'Favorite updated', 'New collection item'],
    integrationReadiness: ['Recipe import', 'Export', 'Nutrition API'],
    extensibilityPlan: ['Meal planning', 'Shopping lists', 'Nutrition data', 'Sharing'],
    riskAreas: ['Missing ingredients', 'Duplicate recipes', 'Category mismatch'],
    futureCapabilities: ['Meal planner', 'Grocery integration', 'Nutrition analysis'],
  },
  'notes-app': {
    productType: 'Knowledge workspace product',
    productGoal: 'Capture, organize, and retrieve notes efficiently.',
    primaryModules: ['Notes', 'Editor', 'Tags', 'Pinned notes'],
    secondaryModules: ['Search', 'Archive', 'Collections'],
    adminModules: ['Templates', 'Tag rules'],
    settingsModules: ['Editor preferences', 'Autosave preferences'],
    userRoles: ['Owner', 'Collaborator'],
    permissionModel: [
      { role: 'Owner', capabilities: ['view all notes', 'create', 'edit', 'delete', 'manage settings'] },
      { role: 'Collaborator', capabilities: ['view shared notes', 'edit shared notes', 'add comments'] },
    ],
    dataEntities: ['Note', 'Tag', 'Collection', 'Pin'],
    entityRelationships: [
      { from: 'Note', relationship: 'has many', to: 'Tags' },
      { from: 'Note', relationship: 'belongs to', to: 'Collection' },
      { from: 'Note', relationship: 'can be', to: 'Pinned' },
    ],
    productBoundaries: {
      includedNow: ['Notes', 'Editor', 'Tags', 'Search', 'Pinned notes'],
      futureScope: ['Collaboration', 'Version history', 'Cloud sync'],
    },
    navigationArchitecture: ['Notes', 'Tags', 'Archive', 'Settings'],
    notificationModel: ['Note saved', 'Pinned note updated'],
    integrationReadiness: ['Cloud sync', 'Export', 'AI summarization'],
    extensibilityPlan: ['Folders', 'Collaboration', 'Markdown', 'Version history'],
    riskAreas: ['Autosave failure', 'Accidental delete'],
    futureCapabilities: ['Real-time collaboration', 'AI summaries', 'Cross-device sync'],
  },
  'school-portal': {
    productType: 'Education management product',
    productGoal: 'Manage classes, schedules, and student information.',
    primaryModules: ['Timetable', 'Classes', 'Students', 'Attendance'],
    secondaryModules: ['Assignments', 'Reports', 'Announcements'],
    adminModules: ['Class schedules', 'Staff roster', 'Grade policies'],
    settingsModules: ['Term settings', 'Notification preferences', 'Calendar settings'],
    userRoles: ['Teacher', 'Student', 'Parent', 'Admin'],
    permissionModel: [
      { role: 'Teacher', capabilities: ['view classes', 'manage attendance', 'post assignments'] },
      { role: 'Student', capabilities: ['view timetable', 'view assignments'] },
      { role: 'Parent', capabilities: ['view student progress', 'view announcements'] },
      { role: 'Admin', capabilities: ['manage users', 'configure schedules', 'manage settings'] },
    ],
    dataEntities: ['Class', 'Student', 'Attendance', 'Assignment', 'Timetable'],
    entityRelationships: [
      { from: 'Student', relationship: 'belongs to', to: 'Class' },
      { from: 'Attendance', relationship: 'belongs to', to: 'Student' },
      { from: 'Assignment', relationship: 'belongs to', to: 'Class' },
    ],
    productBoundaries: {
      includedNow: ['Timetable', 'Classes', 'Students', 'Attendance'],
      futureScope: ['Gradebook', 'Parent messaging', 'LMS integration'],
    },
    navigationArchitecture: ['Timetable', 'Classes', 'Students', 'Reports', 'Settings'],
    notificationModel: ['Class reminder', 'Assignment due', 'Attendance alert'],
    integrationReadiness: ['Calendar sync', 'LMS', 'Email notifications'],
    extensibilityPlan: ['Gradebook', 'Parent portal', 'Assignment submissions'],
    riskAreas: ['Schedule conflicts', 'Missing attendance', 'Duplicate enrollments'],
    futureCapabilities: ['Grade tracking', 'Parent communication', 'Online submissions'],
  },
  'restaurant-pos': {
    productType: 'Transaction/order operations product',
    productGoal: 'Process orders, manage menu items, and track kitchen workflow.',
    primaryModules: ['Orders', 'Menu', 'Tables', 'Kitchen'],
    secondaryModules: ['Reports', 'Shift summary', 'Modifiers'],
    adminModules: ['Menu management', 'Staff roles', 'Tax rules'],
    settingsModules: ['Receipt settings', 'Payment preferences', 'Printer setup'],
    userRoles: ['Cashier', 'Manager', 'Kitchen staff', 'Admin'],
    permissionModel: [
      { role: 'Cashier', capabilities: ['take orders', 'process payments', 'view menu'] },
      { role: 'Manager', capabilities: ['view reports', 'manage menu', 'void orders'] },
      { role: 'Kitchen staff', capabilities: ['view order queue', 'mark items ready'] },
      { role: 'Admin', capabilities: ['manage users', 'configure settings', 'manage tax rules'] },
    ],
    dataEntities: ['Order', 'Menu Item', 'Table', 'Kitchen Ticket', 'Payment'],
    entityRelationships: [
      { from: 'Order', relationship: 'has many', to: 'Menu Items' },
      { from: 'Order', relationship: 'belongs to', to: 'Table' },
      { from: 'Kitchen Ticket', relationship: 'derives from', to: 'Order' },
    ],
    productBoundaries: {
      includedNow: ['Order taking', 'Menu', 'Order queue', 'Checkout'],
      futureScope: ['Payment processing', 'Inventory sync', 'Delivery integration'],
    },
    navigationArchitecture: ['Orders', 'Menu', 'Tables', 'Kitchen', 'Reports', 'Settings'],
    notificationModel: ['New order', 'Order ready', 'Table assigned'],
    integrationReadiness: ['Payment terminal', 'Kitchen display', 'Inventory sync'],
    extensibilityPlan: ['Split bills', 'Delivery', 'Loyalty program', 'Inventory link'],
    riskAreas: ['Order duplication', 'Wrong table assignment', 'Pricing errors'],
    futureCapabilities: ['Online ordering', 'Delivery tracking', 'Loyalty rewards'],
  },
  'project-manager': {
    productType: 'Work management product',
    productGoal: 'Organize tasks, projects, and team progress.',
    primaryModules: ['Tasks', 'Projects', 'Board', 'Assignments'],
    secondaryModules: ['Timeline', 'Reports', 'Comments'],
    adminModules: ['Project templates', 'Team roles', 'Workflow rules'],
    settingsModules: ['Notification preferences', 'Priority rules', 'Export options'],
    userRoles: ['Member', 'Project lead', 'Admin'],
    permissionModel: [
      { role: 'Member', capabilities: ['view assigned tasks', 'update task status', 'add comments'] },
      { role: 'Project lead', capabilities: ['assign tasks', 'view reports', 'manage project'] },
      { role: 'Admin', capabilities: ['manage users', 'configure workflows', 'manage settings'] },
    ],
    dataEntities: ['Task', 'Project', 'Assignment', 'Comment', 'Board Column'],
    entityRelationships: [
      { from: 'Task', relationship: 'belongs to', to: 'Project' },
      { from: 'Task', relationship: 'has many', to: 'Assignments' },
      { from: 'Task', relationship: 'has many', to: 'Comments' },
    ],
    productBoundaries: {
      includedNow: ['Task board', 'Projects', 'Assignments', 'Status tracking'],
      futureScope: ['Gantt charts', 'Time tracking', 'Team permissions'],
    },
    navigationArchitecture: ['Board', 'Projects', 'Tasks', 'Reports', 'Settings'],
    notificationModel: ['Task assigned', 'Due date approaching', 'Status changed'],
    integrationReadiness: ['Calendar sync', 'Slack', 'CSV export'],
    extensibilityPlan: ['Dependencies', 'Time tracking', 'Sprints', 'Automations'],
    riskAreas: ['Missed deadlines', 'Unclear ownership', 'Scope creep'],
    futureCapabilities: ['Gantt view', 'Resource planning', 'Automation rules'],
  },
  'habit-tracker': {
    productType: 'Personal progress product',
    productGoal: 'Build habits and track daily progress over time.',
    primaryModules: ['Habits', 'Daily checklist', 'Streaks', 'Progress'],
    secondaryModules: ['Weekly overview', 'Reports', 'Goals'],
    adminModules: ['Habit templates', 'Reminder rules'],
    settingsModules: ['Reminder preferences', 'Display options'],
    userRoles: ['Owner'],
    permissionModel: [
      { role: 'Owner', capabilities: ['view habits', 'complete habits', 'manage settings'] },
    ],
    dataEntities: ['Habit', 'Streak', 'Completion', 'Goal'],
    entityRelationships: [
      { from: 'Habit', relationship: 'has many', to: 'Completions' },
      { from: 'Streak', relationship: 'derives from', to: 'Completions' },
      { from: 'Goal', relationship: 'tracks', to: 'Habits' },
    ],
    productBoundaries: {
      includedNow: ['Daily habits', 'Streaks', 'Progress dashboard'],
      futureScope: ['Reminders', 'Social accountability', 'Wearable sync'],
    },
    navigationArchitecture: ['Today', 'Habits', 'Progress', 'Reports', 'Settings'],
    notificationModel: ['Habit reminder', 'Streak at risk', 'Goal achieved'],
    integrationReadiness: ['Calendar reminders', 'Wearable devices', 'Export'],
    extensibilityPlan: ['Reminders', 'Goals', 'Habit groups', 'Analytics'],
    riskAreas: ['Broken streaks', 'Overcommitment', 'Missing reminders'],
    futureCapabilities: ['Smart reminders', 'Social sharing', 'Wearable integration'],
  },
  'fitness-tracker': {
    productType: 'Personal progress product',
    productGoal: 'Track workouts, exercises, and fitness progress.',
    primaryModules: ['Workouts', 'Exercises', 'Progress', 'Today plan'],
    secondaryModules: ['History', 'Reports', 'Goals'],
    adminModules: ['Workout templates', 'Exercise library'],
    settingsModules: ['Unit preferences', 'Reminder preferences'],
    userRoles: ['Owner'],
    permissionModel: [
      { role: 'Owner', capabilities: ['view workouts', 'log exercises', 'manage settings'] },
    ],
    dataEntities: ['Workout', 'Exercise', 'Progress Log', 'Goal'],
    entityRelationships: [
      { from: 'Workout', relationship: 'has many', to: 'Exercises' },
      { from: 'Progress Log', relationship: 'belongs to', to: 'Workout' },
      { from: 'Goal', relationship: 'tracks', to: 'Progress Log' },
    ],
    productBoundaries: {
      includedNow: ['Workout logging', 'Exercise tracking', 'Progress dashboard'],
      futureScope: ['Wearable sync', 'Training plans', 'Nutrition tracking'],
    },
    navigationArchitecture: ['Today', 'Workouts', 'Progress', 'Reports', 'Settings'],
    notificationModel: ['Workout reminder', 'Goal milestone', 'Rest day suggestion'],
    integrationReadiness: ['Wearable devices', 'Health apps', 'Export'],
    extensibilityPlan: ['Training plans', 'Body metrics', 'Social challenges'],
    riskAreas: ['Incomplete logging', 'Overtraining', 'Incorrect metrics'],
    futureCapabilities: ['Wearable sync', 'AI coaching', 'Nutrition integration'],
  },
};

const GENERIC_BLUEPRINT: ArchitectureBlueprint = {
  productType: 'General application product',
  productGoal: 'Organize records with search, filters, and structured management.',
  primaryModules: ['Records', 'Dashboard', 'Search', 'Filters'],
  secondaryModules: ['Reports', 'Activity', 'Categories'],
  adminModules: ['Data rules', 'Access policies'],
  settingsModules: ['Display preferences', 'Export options', 'Notification preferences'],
  userRoles: ['Owner', 'Viewer'],
  permissionModel: [
    { role: 'Owner', capabilities: ['view', 'create', 'edit', 'delete', 'manage settings'] },
    { role: 'Viewer', capabilities: ['view records', 'view reports'] },
  ],
  dataEntities: ['Record', 'Category', 'Activity'],
  entityRelationships: [
    { from: 'Record', relationship: 'belongs to', to: 'Category' },
    { from: 'Activity', relationship: 'references', to: 'Record' },
  ],
  productBoundaries: {
    includedNow: ['Record CRUD', 'Search', 'Filters', 'Dashboard'],
    futureScope: ['Multi-user access', 'Integrations', 'Advanced reporting'],
  },
  navigationArchitecture: ['Dashboard', 'Records', 'Reports', 'Settings'],
  notificationModel: ['Record created', 'Record updated', 'Filter match'],
  integrationReadiness: ['CSV import/export', 'API access', 'Webhooks'],
  extensibilityPlan: ['Custom fields', 'Workflows', 'Integrations', 'Team access'],
  riskAreas: ['Data loss', 'Duplicate records', 'Incorrect categorization'],
  futureCapabilities: ['API access', 'Automation', 'Multi-user support'],
};

export function getArchitectureBlueprint(domainId: string): ArchitectureBlueprint {
  return DOMAIN_BLUEPRINTS[domainId] ?? GENERIC_BLUEPRINT;
}

export function blueprintToModel(
  blueprint: ArchitectureBlueprint,
  entityLabel: string,
): ProductArchitectureModel {
  const tailoredEntities = blueprint.dataEntities.map((entity) =>
    entity === 'Record' ? entityLabel : entity,
  );

  return {
    productType: blueprint.productType,
    productGoal: blueprint.productGoal,
    primaryModules: [...blueprint.primaryModules],
    secondaryModules: [...blueprint.secondaryModules],
    adminModules: [...blueprint.adminModules],
    settingsModules: [...blueprint.settingsModules],
    userRoles: [...blueprint.userRoles],
    permissionModel: blueprint.permissionModel.map((rule) => ({ ...rule, capabilities: [...rule.capabilities] })),
    dataEntities: tailoredEntities,
    entityRelationships: blueprint.entityRelationships.map((rel) => ({ ...rel })),
    productBoundaries: {
      includedNow: [...blueprint.productBoundaries.includedNow],
      futureScope: [...blueprint.productBoundaries.futureScope],
    },
    navigationArchitecture: [...blueprint.navigationArchitecture],
    notificationModel: [...blueprint.notificationModel],
    integrationReadiness: [...blueprint.integrationReadiness],
    extensibilityPlan: [...blueprint.extensibilityPlan],
    riskAreas: [...blueprint.riskAreas],
    futureCapabilities: [...blueprint.futureCapabilities],
  };
}
