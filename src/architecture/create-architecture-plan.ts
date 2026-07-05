import type { ArchitecturePlan, BuildPlan, UnderstandingReport } from '../types.js';

const BASE_STACK = ['Vite', 'React', 'TypeScript'] as const;

const BASE_FILES = [
  'package.json',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
] as const;

function baseArchitecture(
  projectType: string,
  folders: string[],
  files: string[],
  components: string[],
  pages: string[],
  dataLayer: string,
): ArchitecturePlan {
  return {
    projectType,
    recommendedStack: [...BASE_STACK],
    folders,
    files,
    components,
    pages,
    stateManagement: 'React useState',
    routing: 'Single page',
    dataLayer,
    styling: 'CSS',
    testingStrategy: 'Future',
  };
}

function calculatorArchitecture(_buildPlan: BuildPlan): ArchitecturePlan {
  return baseArchitecture(
    'Calculator utility application',
    ['src/'],
    [...BASE_FILES, 'src/components/Display.tsx', 'src/components/Keypad.tsx', 'src/components/Button.tsx'],
    ['App', 'Display', 'Keypad', 'Button'],
    ['Calculator'],
    'Local component state',
  );
}

function counterArchitecture(_buildPlan: BuildPlan): ArchitecturePlan {
  return baseArchitecture(
    'Counter utility application',
    ['src/'],
    [...BASE_FILES, 'src/components/CountDisplay.tsx', 'src/components/ControlButtons.tsx'],
    ['App', 'CountDisplay', 'ControlButtons'],
    ['Counter'],
    'Local component state',
  );
}

function todoArchitecture(_buildPlan: BuildPlan): ArchitecturePlan {
  return baseArchitecture(
    'Todo list application',
    ['src/', 'src/components/'],
    [
      ...BASE_FILES,
      'src/components/TaskInput.tsx',
      'src/components/TaskList.tsx',
      'src/components/TaskItem.tsx',
    ],
    ['App', 'TaskInput', 'TaskList', 'TaskItem'],
    ['Todo list'],
    'Local component state with task array',
  );
}

function weatherArchitecture(): ArchitecturePlan {
  return {
    projectType: 'Weather information application',
    recommendedStack: [...BASE_STACK],
    folders: ['src/', 'components/', 'pages/', 'services/', 'types/'],
    files: [
      ...BASE_FILES,
      'src/components/WeatherDisplay.tsx',
      'src/components/SearchBar.tsx',
      'src/components/ForecastCard.tsx',
      'src/pages/Home.tsx',
      'src/services/WeatherService.ts',
      'src/types/weather.ts',
    ],
    components: ['WeatherDisplay', 'SearchBar', 'ForecastCard'],
    pages: ['Home'],
    stateManagement: 'React useState',
    routing: 'Single page',
    dataLayer: 'Placeholder WeatherService',
    styling: 'CSS',
    testingStrategy: 'Future',
  };
}

function crudApplicationArchitecture(buildPlan: BuildPlan): ArchitecturePlan {
  const components = [
    'NavigationHeader',
    'SearchBar',
    'Toolbar',
    'EntityListView',
    'EntityCardView',
    'EntityFormView',
    'EmptyState',
    'ConfirmationDialog',
    'StatusBadge',
  ];

  return baseArchitecture(
    `${buildPlan.appName} web application`,
    ['src/', 'src/components/', 'src/pages/', 'src/services/', 'src/types/', 'src/hooks/'],
    [
      ...BASE_FILES,
      ...components.map((component) => `src/components/${component}.tsx`),
      'src/pages/Home.tsx',
      'src/services/EntityService.ts',
      'src/types/entity.ts',
      'src/hooks/useEntityCollection.ts',
    ],
    ['App', ...components],
    ['Home'],
    'In-memory EntityService',
  );
}

function genericArchitecture(buildPlan: BuildPlan): ArchitecturePlan {
  return crudApplicationArchitecture(buildPlan);
}

function isWeatherApp(understanding: UnderstandingReport, buildPlan: BuildPlan): boolean {
  return (
    buildPlan.appName.toLowerCase() === 'weather' ||
    understanding.suggestedAppName.toLowerCase() === 'weather' ||
    understanding.detectedIntent.toLowerCase().includes('weather')
  );
}

export function createArchitecturePlan(
  understanding: UnderstandingReport,
  buildPlan: BuildPlan,
): ArchitecturePlan {
  switch (buildPlan.appType) {
    case 'calculator':
      return calculatorArchitecture(buildPlan);
    case 'counter':
      return counterArchitecture(buildPlan);
    case 'todo':
      return todoArchitecture(buildPlan);
    case 'unknown':
      if (isWeatherApp(understanding, buildPlan)) {
        return weatherArchitecture();
      }
      return genericArchitecture(buildPlan);
    default:
      return genericArchitecture(buildPlan);
  }
}
