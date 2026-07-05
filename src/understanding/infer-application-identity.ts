export interface ApplicationIdentity {
  suggestedAppName: string;
  applicationCategory: string;
  domainId: string;
}

const QUALIFIER_PATTERN = /\s+(?:with|including|that|featuring|for|and|has|have|supports?|supporting)\s+/i;

interface DomainIdentityEntry {
  domainId: string;
  suggestedAppName: string;
  applicationCategory: string;
  keywords: readonly string[];
}

const IDENTITY_CATALOG: readonly DomainIdentityEntry[] = [
  { domainId: 'expense-tracker', suggestedAppName: 'Expense Tracker', applicationCategory: 'Expense Tracker', keywords: ['expense', 'budget', 'spending', 'finance tracker'] },
  { domainId: 'crm', suggestedAppName: 'CRM', applicationCategory: 'CRM', keywords: ['crm', 'customer relationship', 'sales pipeline', 'client manager'] },
  { domainId: 'inventory-system', suggestedAppName: 'Inventory System', applicationCategory: 'Inventory System', keywords: ['inventory', 'stock', 'warehouse', 'product catalog'] },
  { domainId: 'recipe-manager', suggestedAppName: 'Recipe Manager', applicationCategory: 'Recipe Manager', keywords: ['recipe', 'cookbook', 'cooking'] },
  { domainId: 'restaurant-pos', suggestedAppName: 'Restaurant POS', applicationCategory: 'Restaurant POS', keywords: ['restaurant pos', 'point of sale', 'restaurant order'] },
  { domainId: 'school-portal', suggestedAppName: 'School Portal', applicationCategory: 'School Portal', keywords: ['school portal', 'student portal', 'classroom portal'] },
  { domainId: 'fitness-tracker', suggestedAppName: 'Fitness Tracker', applicationCategory: 'Fitness Tracker', keywords: ['fitness', 'workout', 'gym tracker', 'exercise tracker'] },
  { domainId: 'notes-app', suggestedAppName: 'Notes App', applicationCategory: 'Notes App', keywords: ['note-taking', 'note taking', 'notes app', 'notebook', 'journal'] },
  { domainId: 'habit-tracker', suggestedAppName: 'Habit Tracker', applicationCategory: 'Habit Tracker', keywords: ['habit tracker', 'habit tracking', 'daily habit'] },
  { domainId: 'contact-manager', suggestedAppName: 'Contact Manager', applicationCategory: 'Contact Manager', keywords: ['contact manager', 'address book', 'phone book'] },
  { domainId: 'countdown-timer', suggestedAppName: 'Countdown Timer', applicationCategory: 'Countdown Timer', keywords: ['countdown', 'countdown timer', 'timer app'] },
  { domainId: 'project-manager', suggestedAppName: 'Project Manager', applicationCategory: 'Project Manager', keywords: ['project manager', 'project management', 'project tracker'] },
  { domainId: 'booking-system', suggestedAppName: 'Booking System', applicationCategory: 'Booking System', keywords: ['booking', 'reservation', 'appointment'] },
  { domainId: 'calendar', suggestedAppName: 'Calendar', applicationCategory: 'Calendar', keywords: ['calendar app', 'calendar', 'schedule planner'] },
  { domainId: 'task-manager', suggestedAppName: 'Task Manager', applicationCategory: 'Task Manager', keywords: ['task manager', 'task management', 'task list app'] },
  { domainId: 'invoice-system', suggestedAppName: 'Invoice System', applicationCategory: 'Invoice System', keywords: ['invoice', 'billing', 'invoicing'] },
  { domainId: 'budget-planner', suggestedAppName: 'Budget Planner', applicationCategory: 'Budget Planner', keywords: ['budget planner', 'budget planning'] },
  { domainId: 'weather', suggestedAppName: 'Weather', applicationCategory: 'Weather App', keywords: ['weather'] },
];

function titleCaseWords(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function compactDomainPhrase(domain: string): string {
  const withoutQualifiers = domain.split(QUALIFIER_PATTERN)[0]?.trim() ?? domain.trim();
  const words = withoutQualifiers.replace(/\.$/, '').split(/\s+/).filter(Boolean);
  if (words.length <= 3) return titleCaseWords(words.join(' '));
  return titleCaseWords(words.slice(0, 2).join(' '));
}

function scoreEntry(entry: DomainIdentityEntry, haystack: string): number {
  let score = 0;
  for (const keyword of entry.keywords) {
    if (haystack.includes(keyword)) score += keyword.includes(' ') ? 3 : 1;
  }
  return score;
}

export function inferApplicationIdentity(prompt: string, extractedDomain: string): ApplicationIdentity {
  const haystack = `${prompt} ${extractedDomain}`.toLowerCase().replace(/\s+/g, ' ');

  let best: DomainIdentityEntry | null = null;
  let bestScore = 0;

  for (const entry of IDENTITY_CATALOG) {
    const score = scoreEntry(entry, haystack);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  if (best && bestScore > 0) {
    return {
      suggestedAppName: best.suggestedAppName,
      applicationCategory: best.applicationCategory,
      domainId: best.domainId,
    };
  }

  const fallbackName = compactDomainPhrase(extractedDomain);
  return {
    suggestedAppName: fallbackName,
    applicationCategory: fallbackName,
    domainId: 'generic-application',
  };
}
