import type { AppType, UnderstandingReport } from '../types.js';
import { detectAppType } from '../generator/detect-app-type.js';
import { createBuildPlan } from '../planner/create-build-plan.js';
import { inferApplicationIdentity } from './infer-application-identity.js';

const BUILD_REQUEST_PATTERN = /^\s*build\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s+app)?\s*$/i;

interface DomainProfile {
  suggestedAppName: string;
  applicationCategory: string;
  domainId: string;
  detectedIntent: string;
  features: string[];
  entities: string[];
  confidence: number;
  reasoning: string;
}

const WEATHER_PROFILE: DomainProfile = {
  suggestedAppName: 'Weather',
  applicationCategory: 'Weather App',
  domainId: 'weather',
  detectedIntent: 'Build a weather application',
  features: ['Weather display', 'Search city', 'Current conditions'],
  entities: ['weather', 'city', 'conditions'],
  confidence: 0.82,
  reasoning:
    'Recognized a weather application request with display and location lookup needs, but AiDevEngine V3 only supports calculator, counter, and todo templates.',
};

function extractDomain(prompt: string): string | null {
  const match = prompt.match(BUILD_REQUEST_PATTERN);
  if (!match?.[1]) return null;
  return match[1].trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildGenericDomainProfile(domain: string, originalPrompt: string): DomainProfile {
  const identity = inferApplicationIdentity(originalPrompt, domain);
  const baseFeatures = [
    'Create item',
    'View item list',
    'Edit item',
    'Delete item',
    'Search and filter',
    'Dashboard summary',
    'Recent activity',
  ];

  return {
    suggestedAppName: identity.suggestedAppName,
    applicationCategory: identity.applicationCategory,
    domainId: identity.domainId,
    detectedIntent: `Build a ${identity.applicationCategory.toLowerCase()} application`,
    features: baseFeatures,
    entities: [identity.domainId.replace(/-/g, ' '), 'collection', 'category'],
    confidence: identity.domainId === 'generic-application' ? 0.78 : 0.86,
    reasoning:
      identity.domainId === 'generic-application'
        ? 'Interpreted as a custom application with collection management and domain-aware layout generation.'
        : `Matched the prompt to the ${identity.applicationCategory} category and inferred domain-specific layout features.`,
  };
}

function buildSupportedReport(originalPrompt: string, appType: AppType): UnderstandingReport {
  const plan = createBuildPlan(originalPrompt, appType);
  const intentLabel = appType === 'todo' ? 'todo list' : appType;

  return {
    originalPrompt,
    detectedIntent: `Build a ${intentLabel} application`,
    suggestedAppName: plan.appName,
    applicationCategory: plan.appName,
    detectedFeatures: [...plan.features],
    detectedEntities: [appType, 'application', plan.appName.toLowerCase()],
    confidence: 0.98,
    supported: true,
    matchedAppType: appType,
    reasoning: `Prompt matches the supported ${appType} template with high confidence based on explicit app-type keywords.`,
  };
}

export function analyzePrompt(rawPrompt: string): UnderstandingReport {
  const originalPrompt = rawPrompt.trim();
  const appType = detectAppType(originalPrompt);

  if (appType !== 'unknown') {
    return buildSupportedReport(originalPrompt, appType);
  }

  const domain = extractDomain(originalPrompt) ?? 'custom application';

  if (/\bweather\b/i.test(originalPrompt)) {
    const profile = WEATHER_PROFILE;
    return {
      originalPrompt,
      detectedIntent: profile.detectedIntent,
      suggestedAppName: profile.suggestedAppName,
      applicationCategory: profile.applicationCategory,
      detectedFeatures: [...profile.features],
      detectedEntities: [...profile.entities],
      confidence: profile.confidence,
      supported: false,
      matchedAppType: null,
      reasoning: profile.reasoning,
    };
  }

  const profile = buildGenericDomainProfile(domain, originalPrompt);

  return {
    originalPrompt,
    detectedIntent: profile.detectedIntent,
    suggestedAppName: profile.suggestedAppName,
    applicationCategory: profile.applicationCategory,
    detectedFeatures: [...profile.features],
    detectedEntities: [...profile.entities],
    confidence: profile.confidence,
    supported: false,
    matchedAppType: null,
    reasoning: profile.reasoning,
  };
}
