import type { BuildPlan, UnderstandingReport } from '../types.js';

import { isWeatherApplication } from '../generation/generic/infer-application-profile.js';



const DRAFT_STACK = ['Vite', 'React', 'TypeScript'] as const;



const DRAFT_PROJECT_STRUCTURE = [

  'package.json',

  'index.html',

  'vite.config.ts',

  'tsconfig.json',

  'src/main.tsx',

  'src/App.tsx',

  'src/index.css',

] as const;



const CRUD_COMPONENTS = [
  'NavigationHeader',
  'DashboardSummary',
  'ChartPlaceholder',
  'RecentActivityPanel',
  'FilterBar',
  'SearchBar',
  'Toolbar',
  'EntityListView',
  'EntityCardView',
  'EntityFormView',
  'EmptyState',
  'ConfirmationDialog',
  'StatusBadge',
] as const;



const CRUD_PAGES = ['Home'] as const;



function featureToComponentName(feature: string): string {

  const words = feature

    .replace(/[^a-zA-Z0-9\s]/g, '')

    .split(/\s+/)

    .filter(Boolean);



  if (words.length === 0) return 'FeaturePanel';



  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');

}



function inferPages(appName: string): string[] {

  return [`${appName} (single page)`];

}



function inferComponents(appName: string, features: string[]): string[] {

  const components = ['App'];

  for (const feature of features) {

    const name = featureToComponentName(feature);

    if (!components.includes(name)) {

      components.push(name);

    }

  }



  if (components.length === 1) {

    components.push(`${appName.replace(/\s+/g, '')}View`);

  }



  return components;

}



export function createDraftBuildPlan(understanding: UnderstandingReport): BuildPlan {

  const appName = understanding.suggestedAppName;

  const features = [...understanding.detectedFeatures];



  if (

    isWeatherApplication(appName, understanding.detectedIntent)

  ) {

    return {

      originalPrompt: understanding.originalPrompt,

      appType: 'unknown',

      appName,

      features,

      pages: inferPages(appName),

      components: inferComponents(appName, features),

      projectStructure: [...DRAFT_PROJECT_STRUCTURE],

      stack: [...DRAFT_STACK],

    };

  }



  return {

    originalPrompt: understanding.originalPrompt,

    appType: 'unknown',

    appName,

    features,

    pages: [...CRUD_PAGES],

    components: ['App', ...CRUD_COMPONENTS],

    projectStructure: [...DRAFT_PROJECT_STRUCTURE],

    stack: [...DRAFT_STACK],

  };

}

