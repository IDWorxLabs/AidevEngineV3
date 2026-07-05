import type { UnderstandingReport, BuildPlan } from '../../types.js';
import { inferApplicationIdentity } from '../../understanding/infer-application-identity.js';

export interface DomainDashboardCard {
  label: string;
  hint: string;
}

export interface ApplicationDomainProfile {
  domainId: string;
  category: string;
  entityLabel: string;
  entityLabelPlural: string;
  pageSubtitle: string;
  dashboardCards: DomainDashboardCard[];
  sections: readonly string[];
  features: readonly string[];
  recentActivityLabel: string;
  chartLabel: string;
}

const DOMAIN_PROFILES: Record<string, ApplicationDomainProfile> = {
  'expense-tracker': {
    domainId: 'expense-tracker',
    category: 'Expense Tracker',
    entityLabel: 'Expense',
    entityLabelPlural: 'Expenses',
    pageSubtitle: 'Track spending, categories, and monthly totals',
    dashboardCards: [
      { label: 'Total income', hint: 'Monthly inflow' },
      { label: 'Total expenses', hint: 'Monthly spending' },
      { label: 'Current balance', hint: 'Net total' },
      { label: 'Biggest category', hint: 'Top spending' },
    ],
    sections: ['Dashboard', 'Recent transactions', 'Category breakdown', 'Monthly totals'],
    features: ['Dashboard', 'Income card', 'Expense card', 'Balance card', 'Recent transactions', 'Category breakdown', 'Search', 'Filtering', 'Editing', 'Delete'],
    recentActivityLabel: 'Recent transactions',
    chartLabel: 'Category breakdown',
  },
  crm: {
    domainId: 'crm',
    category: 'CRM',
    entityLabel: 'Contact',
    entityLabelPlural: 'Contacts',
    pageSubtitle: 'Manage customers, pipeline, and recent activity',
    dashboardCards: [
      { label: 'Total customers', hint: 'All accounts' },
      { label: 'Active deals', hint: 'Open pipeline' },
      { label: 'Pipeline value', hint: 'Deal total' },
      { label: 'Follow-ups due', hint: 'Needs contact' },
    ],
    sections: ['Sales dashboard', 'Customer list', 'Pipeline summary', 'Recent activity'],
    features: ['Customer list', 'Pipeline summary', 'Sales dashboard', 'Contact details', 'Recent activity', 'Search', 'Filtering'],
    recentActivityLabel: 'Recent activity',
    chartLabel: 'Pipeline summary',
  },
  'recipe-manager': {
    domainId: 'recipe-manager',
    category: 'Recipe Manager',
    entityLabel: 'Recipe',
    entityLabelPlural: 'Recipes',
    pageSubtitle: 'Browse recipes, categories, and favorites',
    dashboardCards: [
      { label: 'Recipes', hint: 'Saved recipes' },
      { label: 'Categories', hint: 'Collections' },
      { label: 'Favorites', hint: 'Starred items' },
    ],
    sections: ['Recipe cards', 'Categories', 'Search', 'Recipe detail'],
    features: ['Recipe cards', 'Search', 'Categories', 'Ingredients', 'Cooking time', 'Favorites', 'Recipe detail'],
    recentActivityLabel: 'Recently viewed',
    chartLabel: 'Popular categories',
  },
  'inventory-system': {
    domainId: 'inventory-system',
    category: 'Inventory System',
    entityLabel: 'Product',
    entityLabelPlural: 'Products',
    pageSubtitle: 'Monitor stock levels, categories, and products',
    dashboardCards: [
      { label: 'Total products', hint: 'Catalog size' },
      { label: 'Low stock items', hint: 'Needs reorder' },
      { label: 'Total stock value', hint: 'Inventory worth' },
      { label: 'Categories', hint: 'Product groups' },
    ],
    sections: ['Stock overview', 'Low stock panel', 'Inventory table'],
    features: ['Stock overview', 'Low stock panel', 'Categories', 'Products', 'Inventory table', 'Search', 'Sorting'],
    recentActivityLabel: 'Recent stock changes',
    chartLabel: 'Stock overview',
  },
  'habit-tracker': {
    domainId: 'habit-tracker',
    category: 'Habit Tracker',
    entityLabel: 'Habit',
    entityLabelPlural: 'Habits',
    pageSubtitle: 'Track daily habits, streaks, and weekly progress',
    dashboardCards: [
      { label: 'Habits today', hint: 'Due today' },
      { label: 'Completion rate', hint: 'Daily percentage' },
      { label: 'Current streak', hint: 'Day streak' },
      { label: 'Weekly progress', hint: 'This week' },
    ],
    sections: ["Today's habits", 'Weekly overview', 'Progress chart'],
    features: ["Today's habits", 'Completion percentage', 'Current streak', 'Weekly overview', 'Calendar', 'Progress chart'],
    recentActivityLabel: 'Recent completions',
    chartLabel: 'Weekly overview',
  },
  'fitness-tracker': {
    domainId: 'fitness-tracker',
    category: 'Fitness Tracker',
    entityLabel: 'Workout',
    entityLabelPlural: 'Workouts',
    pageSubtitle: 'Review workouts, goals, and progress',
    dashboardCards: [
      { label: 'Workouts', hint: 'This week' },
      { label: 'Goals', hint: 'Active goals' },
      { label: 'Progress', hint: 'Weekly trend' },
    ],
    sections: ['Workout history', 'Progress summary', 'Exercise list', 'Statistics cards'],
    features: ['Workout history', 'Progress summary', 'Exercise list', 'Goals', 'Statistics cards', 'Charts placeholder'],
    recentActivityLabel: 'Recent workouts',
    chartLabel: 'Progress summary',
  },
  'notes-app': {
    domainId: 'notes-app',
    category: 'Notes App',
    entityLabel: 'Note',
    entityLabelPlural: 'Notes',
    pageSubtitle: 'Capture notes, search, and organize ideas',
    dashboardCards: [
      { label: 'Notes', hint: 'Total notes' },
      { label: 'Pinned', hint: 'Important' },
      { label: 'Recent', hint: 'Edited today' },
    ],
    sections: ['Notes list', 'Search', 'Recent notes'],
    features: ['Notes list', 'Search', 'Create note', 'Edit note', 'Delete note', 'Recent notes'],
    recentActivityLabel: 'Recent notes',
    chartLabel: 'Notes activity',
  },
  'contact-manager': {
    domainId: 'contact-manager',
    category: 'Contact Manager',
    entityLabel: 'Contact',
    entityLabelPlural: 'Contacts',
    pageSubtitle: 'Organize contacts and communication details',
    dashboardCards: [
      { label: 'Contacts', hint: 'Total contacts' },
      { label: 'Companies', hint: 'Organizations' },
      { label: 'Recent', hint: 'Updated recently' },
    ],
    sections: ['Contact list', 'Search', 'Contact details'],
    features: ['Contact list', 'Search', 'Contact details', 'Create contact', 'Edit contact', 'Delete contact'],
    recentActivityLabel: 'Recent contacts',
    chartLabel: 'Contact groups',
  },
  'school-portal': {
    domainId: 'school-portal',
    category: 'School Portal',
    entityLabel: 'Student',
    entityLabelPlural: 'Students',
    pageSubtitle: 'Manage students, classes, and announcements',
    dashboardCards: [
      { label: 'Students', hint: 'Enrolled' },
      { label: 'Classes', hint: 'Active classes' },
      { label: 'Announcements', hint: 'This week' },
    ],
    sections: ['Student list', 'Class overview', 'Announcements', 'Recent activity'],
    features: ['Student list', 'Class overview', 'Announcements', 'Search', 'Recent activity'],
    recentActivityLabel: 'Recent activity',
    chartLabel: 'Enrollment overview',
  },
  'restaurant-pos': {
    domainId: 'restaurant-pos',
    category: 'Restaurant POS',
    entityLabel: 'Order',
    entityLabelPlural: 'Orders',
    pageSubtitle: 'Track orders, tables, and daily sales',
    dashboardCards: [
      { label: 'Orders', hint: 'Today' },
      { label: 'Tables', hint: 'Active' },
      { label: 'Sales', hint: 'Daily total' },
    ],
    sections: ['Order queue', 'Table overview', 'Sales summary'],
    features: ['Order queue', 'Table overview', 'Sales summary', 'Search', 'Recent orders'],
    recentActivityLabel: 'Recent orders',
    chartLabel: 'Sales summary',
  },
  'booking-system': {
    domainId: 'booking-system',
    category: 'Booking System',
    entityLabel: 'Booking',
    entityLabelPlural: 'Bookings',
    pageSubtitle: 'Manage reservations and appointments',
    dashboardCards: [
      { label: 'Total bookings', hint: 'All reservations' },
      { label: "Today's bookings", hint: 'Scheduled today' },
      { label: 'Available slots', hint: 'Open times' },
      { label: 'Upcoming reservations', hint: 'Next dates' },
    ],
    sections: ['Booking calendar', 'Upcoming reservations', 'Search'],
    features: ['Booking calendar', 'Upcoming reservations', 'Search', 'Create booking', 'Edit booking'],
    recentActivityLabel: 'Recent bookings',
    chartLabel: 'Booking overview',
  },
  calendar: {
    domainId: 'calendar',
    category: 'Calendar',
    entityLabel: 'Event',
    entityLabelPlural: 'Events',
    pageSubtitle: 'Plan events, schedules, and reminders',
    dashboardCards: [
      { label: 'Events', hint: 'This month' },
      { label: 'Today', hint: 'Scheduled' },
      { label: 'Upcoming', hint: 'Next 7 days' },
    ],
    sections: ['Calendar view', 'Upcoming events', 'Search'],
    features: ['Calendar view', 'Upcoming events', 'Search', 'Create event', 'Edit event'],
    recentActivityLabel: 'Recent events',
    chartLabel: 'Schedule overview',
  },
  'task-manager': {
    domainId: 'task-manager',
    category: 'Task Manager',
    entityLabel: 'Task',
    entityLabelPlural: 'Tasks',
    pageSubtitle: 'Organize tasks, priorities, and progress',
    dashboardCards: [
      { label: 'Tasks', hint: 'Total open' },
      { label: 'Due today', hint: 'Priority' },
      { label: 'Completed', hint: 'This week' },
    ],
    sections: ['Task list', 'Priority summary', 'Search'],
    features: ['Task list', 'Priority summary', 'Search', 'Create task', 'Edit task', 'Delete task'],
    recentActivityLabel: 'Recent tasks',
    chartLabel: 'Progress summary',
  },
  'invoice-system': {
    domainId: 'invoice-system',
    category: 'Invoice System',
    entityLabel: 'Invoice',
    entityLabelPlural: 'Invoices',
    pageSubtitle: 'Track invoices, payments, and billing',
    dashboardCards: [
      { label: 'Invoices', hint: 'Outstanding' },
      { label: 'Paid', hint: 'This month' },
      { label: 'Due', hint: 'Overdue' },
    ],
    sections: ['Invoice list', 'Payment summary', 'Search'],
    features: ['Invoice list', 'Payment summary', 'Search', 'Create invoice', 'Edit invoice'],
    recentActivityLabel: 'Recent invoices',
    chartLabel: 'Billing overview',
  },
  'budget-planner': {
    domainId: 'budget-planner',
    category: 'Budget Planner',
    entityLabel: 'Budget Item',
    entityLabelPlural: 'Budget Items',
    pageSubtitle: 'Plan budgets, categories, and monthly totals',
    dashboardCards: [
      { label: 'Income', hint: 'Planned' },
      { label: 'Expenses', hint: 'Allocated' },
      { label: 'Remaining', hint: 'Available' },
    ],
    sections: ['Budget overview', 'Category breakdown', 'Monthly totals'],
    features: ['Budget overview', 'Category breakdown', 'Monthly totals', 'Search', 'Filtering'],
    recentActivityLabel: 'Recent entries',
    chartLabel: 'Category breakdown',
  },
  'project-manager': {
    domainId: 'project-manager',
    category: 'Project Manager',
    entityLabel: 'Project',
    entityLabelPlural: 'Projects',
    pageSubtitle: 'Track projects, milestones, and team progress',
    dashboardCards: [
      { label: 'Projects', hint: 'Active' },
      { label: 'Milestones', hint: 'Due soon' },
      { label: 'Progress', hint: 'Overall' },
    ],
    sections: ['Project list', 'Milestone summary', 'Recent activity'],
    features: ['Project list', 'Milestone summary', 'Recent activity', 'Search', 'Filtering'],
    recentActivityLabel: 'Recent activity',
    chartLabel: 'Progress overview',
  },
  'countdown-timer': {
    domainId: 'countdown-timer',
    category: 'Countdown Timer',
    entityLabel: 'Timer',
    entityLabelPlural: 'Timers',
    pageSubtitle: 'Create countdowns and track remaining time',
    dashboardCards: [
      { label: 'Active', hint: 'Running timers' },
      { label: 'Upcoming', hint: 'Scheduled' },
      { label: 'Completed', hint: 'Finished' },
    ],
    sections: ['Timer list', 'Active countdown', 'Search'],
    features: ['Timer list', 'Active countdown', 'Search', 'Create timer', 'Edit timer'],
    recentActivityLabel: 'Recent timers',
    chartLabel: 'Timer activity',
  },
  generic: {
    domainId: 'generic-application',
    category: 'Application',
    entityLabel: 'Item',
    entityLabelPlural: 'Items',
    pageSubtitle: 'Manage your collection with search, filters, and CRUD actions',
    dashboardCards: [
      { label: 'Total', hint: 'All records' },
      { label: 'Active', hint: 'In progress' },
      { label: 'Recent', hint: 'Updated today' },
    ],
    sections: ['Summary', 'Collection list', 'Search'],
    features: ['List view', 'Search', 'Create', 'Edit', 'Delete', 'Filtering'],
    recentActivityLabel: 'Recent activity',
    chartLabel: 'Summary overview',
  },
};

function extractDomain(prompt: string): string {
  const match = prompt.match(/^\s*build\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s+app)?\s*$/i);
  return match?.[1]?.trim().toLowerCase() ?? prompt.toLowerCase();
}

export function inferApplicationDomain(
  understanding: UnderstandingReport,
  buildPlan: BuildPlan,
): ApplicationDomainProfile {
  const identity = inferApplicationIdentity(
    understanding.originalPrompt,
    extractDomain(understanding.originalPrompt),
  );

  const profile = DOMAIN_PROFILES[identity.domainId] ?? DOMAIN_PROFILES.generic;
  return {
    ...profile,
    category: understanding.applicationCategory ?? identity.applicationCategory,
  };
}

export const DOMAIN_LAYOUT_MARKER = 'data-domain-layout';
export const DOMAIN_COMPONENT_MARKER = 'data-domain-component';
