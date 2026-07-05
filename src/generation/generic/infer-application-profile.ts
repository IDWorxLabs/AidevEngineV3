import type { DataPattern, UiPattern } from './generic-capability-types.js';

const DOMAIN_HINTS: Partial<Record<DataPattern, readonly string[]>> = {
  Amount: ['expense', 'budget', 'cost', 'price', 'money', 'shopping'],
  Date: ['timer', 'countdown', 'event', 'deadline', 'schedule', 'habit', 'planner'],
  Priority: ['task', 'planner', 'priority', 'todo'],
  Status: ['habit', 'task', 'tracker', 'status'],
  Notes: ['note', 'recipe', 'description', 'journal'],
  Category: ['expense', 'recipe', 'book', 'library', 'shopping', 'event'],
  Tag: ['recipe', 'note', 'book', 'library', 'tag'],
  'Contact Information': ['contact', 'phone', 'email', 'address'],
};

const BASE_DATA_PATTERNS: DataPattern[] = ['Entity', 'Collection'];

export function inferDataPatterns(appName: string, domainText: string, entities: string[]): DataPattern[] {
  const haystack = `${appName} ${domainText} ${entities.join(' ')}`.toLowerCase();
  const selected = new Set<DataPattern>(BASE_DATA_PATTERNS);

  for (const [pattern, hints] of Object.entries(DOMAIN_HINTS) as [DataPattern, readonly string[]][]) {
    if (hints.some((hint) => haystack.includes(hint))) {
      selected.add(pattern);
    }
  }

  return [...selected];
}

export function standardUiPatterns(): UiPattern[] {
  return [
    'List View',
    'Card View',
    'Detail View',
    'Form View',
    'Search Bar',
    'Toolbar',
    'Navigation Header',
    'Empty State',
    'Confirmation Dialog',
    'Status Badge',
    'Loading State',
    'Error State',
  ];
}

export function isWeatherApplication(
  appName: string,
  detectedIntent: string,
  projectType?: string,
): boolean {
  const text = `${appName} ${detectedIntent} ${projectType ?? ''}`.toLowerCase();
  return text.includes('weather');
}

export function isCrudApplication(
  appType: string,
  appName: string,
  detectedIntent: string,
  projectType?: string,
): boolean {
  return appType === 'unknown' && !isWeatherApplication(appName, detectedIntent, projectType);
}
