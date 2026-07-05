import type { ArchitecturePlan, BuildPlan, UnderstandingReport } from '../../types.js';
import type { ApplicationDomainProfile } from '../generic/domain-profiles.js';
import { inferApplicationDomain } from '../generic/domain-profiles.js';
import { inferApplicationIdentity } from '../../understanding/infer-application-identity.js';
import {
  DEFAULT_LAYOUT_PATTERN,
  getUiStrategyByPattern,
  UI_STRATEGIES,
} from './ui-strategy-catalog.js';
import type { LayoutPattern, UiStrategy, UiStrategyReport } from './ui-strategy-types.js';

export interface UiStrategySelectionInput {
  understanding: UnderstandingReport;
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
  domainProfile?: ApplicationDomainProfile;
}

export interface UiStrategySelectionResult {
  strategy: UiStrategy;
  report: UiStrategyReport;
}

const DOMAIN_LAYOUT_AFFINITY: Record<string, LayoutPattern> = {
  'booking-system': 'calendar',
  calendar: 'calendar',
  crm: 'kanban',
  'inventory-system': 'data-table',
  'recipe-manager': 'card-grid',
  'notes-app': 'editor',
  'expense-tracker': 'ledger',
  'budget-planner': 'ledger',
  'invoice-system': 'ledger',
  'school-portal': 'timetable',
  'restaurant-pos': 'pos',
  'habit-tracker': 'progress-dashboard',
  'fitness-tracker': 'progress-dashboard',
  'project-manager': 'board',
  'task-manager': 'board',
};

const FEATURE_LAYOUT_HINTS: readonly { keywords: readonly string[]; pattern: LayoutPattern; weight: number }[] = [
  { keywords: ['booking', 'reservation', 'appointment', 'schedule'], pattern: 'calendar', weight: 4 },
  { keywords: ['pipeline', 'kanban', 'deal', 'sales stage', 'crm'], pattern: 'kanban', weight: 4 },
  { keywords: ['inventory', 'stock', 'sku', 'warehouse', 'reorder'], pattern: 'data-table', weight: 4 },
  { keywords: ['recipe', 'cookbook', 'ingredients', 'cooking time'], pattern: 'card-grid', weight: 4 },
  { keywords: ['note', 'editor', 'writing', 'journal', 'notebook'], pattern: 'editor', weight: 4 },
  { keywords: ['expense', 'ledger', 'transaction', 'income', 'budget', 'finance'], pattern: 'ledger', weight: 4 },
  { keywords: ['pos', 'order', 'menu', 'restaurant', 'cart'], pattern: 'pos', weight: 4 },
  { keywords: ['chat', 'message', 'conversation', 'messenger'], pattern: 'chat', weight: 4 },
  { keywords: ['music', 'playlist', 'track', 'album', 'media library'], pattern: 'media-library', weight: 4 },
  { keywords: ['timetable', 'classroom', 'school', 'attendance', 'lesson'], pattern: 'timetable', weight: 4 },
  { keywords: ['habit', 'streak', 'fitness', 'workout', 'progress', 'goal'], pattern: 'progress-dashboard', weight: 3 },
  { keywords: ['project', 'task board', 'milestone', 'kanban board'], pattern: 'board', weight: 3 },
];

function extractDomain(prompt: string): string {
  const match = prompt.match(/^\s*build\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s+app)?\s*$/i);
  return match?.[1]?.trim().toLowerCase() ?? prompt.toLowerCase();
}

function scorePattern(
  pattern: LayoutPattern,
  domainId: string,
  haystack: string,
  features: readonly string[],
): { score: number; reasons: string[] } {
  const strategy = UI_STRATEGIES[pattern];
  let score = 0;
  const reasons: string[] = [];

  if (DOMAIN_LAYOUT_AFFINITY[domainId] === pattern) {
    score += 10;
    reasons.push(`domain "${domainId}" maps to ${pattern} layout`);
  }

  if (strategy.bestForDomains.includes(domainId)) {
    score += 6;
    reasons.push(`strategy best-for includes "${domainId}"`);
  }

  for (const hint of FEATURE_LAYOUT_HINTS) {
    if (hint.pattern !== pattern) continue;
    for (const keyword of hint.keywords) {
      if (haystack.includes(keyword) || features.some((f) => f.toLowerCase().includes(keyword))) {
        score += hint.weight;
        reasons.push(`feature keyword "${keyword}" supports ${pattern}`);
        break;
      }
    }
  }

  return { score, reasons };
}

export function selectUiStrategy(input: UiStrategySelectionInput): UiStrategySelectionResult {
  const domainProfile =
    input.domainProfile ?? inferApplicationDomain(input.understanding, input.buildPlan);
  const domainText = extractDomain(input.understanding.originalPrompt);
  const identity = inferApplicationIdentity(input.understanding.originalPrompt, domainText);
  const domainId = domainProfile.domainId === 'generic-application' ? identity.domainId : domainProfile.domainId;

  const haystack = [
    input.understanding.originalPrompt,
    input.understanding.detectedIntent,
    domainText,
    domainId,
    input.buildPlan.appName,
    input.architecturePlan.projectType,
    ...input.buildPlan.features,
    ...input.understanding.detectedFeatures,
  ]
    .join(' ')
    .toLowerCase();

  const features = [...input.buildPlan.features, ...input.understanding.detectedFeatures];

  let bestPattern: LayoutPattern = DOMAIN_LAYOUT_AFFINITY[domainId] ?? DEFAULT_LAYOUT_PATTERN;
  let bestScore = -1;
  let bestReasons: string[] = [];

  const patterns = Object.keys(UI_STRATEGIES) as LayoutPattern[];
  for (const pattern of patterns) {
    const { score, reasons } = scorePattern(pattern, domainId, haystack, features);
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
      bestReasons = reasons;
    }
  }

  if (bestScore <= 0) {
    bestPattern = DEFAULT_LAYOUT_PATTERN;
    bestReasons = ['no strong domain match; using split-view fallback'];
  }

  const strategy = getUiStrategyByPattern(bestPattern);
  const selectionReason =
    bestReasons.length > 0
      ? bestReasons.slice(0, 3).join('; ')
      : `default ${DEFAULT_LAYOUT_PATTERN} layout for ${domainId}`;

  return {
    strategy,
    report: {
      strategyId: strategy.id,
      strategyName: strategy.name,
      selectionReason,
      layoutPattern: strategy.layoutPattern,
      primarySurface: strategy.primarySurface,
      primaryUserGoal: strategy.primaryUserGoal,
      interactionModel: strategy.interactionModel,
      generatedLayoutComponents: [...strategy.requiredComponents],
    },
  };
}
