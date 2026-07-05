/**
 * Architecture regression — planning layer for supported and generic apps.
 */

import { createArchitecturePlan } from '../src/architecture/create-architecture-plan.js';
import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { createBuildPlan } from '../src/planner/create-build-plan.js';
import { createDraftBuildPlan } from '../src/planner/create-draft-build-plan.js';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';
import { GENERIC_PROTOTYPE_PROMPT } from './generic-prototype-path-regression.js';
import { assertArchitecture } from './regression-architecture.js';

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

const COMMON_ARCH_OPTIONS = {
  expectStack: ['Vite', 'React', 'TypeScript'] as string[],
  expectStateManagement: 'React useState',
  expectRouting: 'Single page',
  expectStyling: 'CSS',
  expectTestingStrategy: 'Future',
};

export async function runArchitectureRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nArchitecture regression\n');

  console.log('── Direct planning ──\n');

  const calculatorUnderstanding = analyzePrompt(GOLDEN_PATH_PROMPT);
  const calculatorPlan = createBuildPlan(GOLDEN_PATH_PROMPT, 'calculator');
  const calculatorArchitecture = createArchitecturePlan(calculatorUnderstanding, calculatorPlan);

  if (calculatorArchitecture.projectType === 'Calculator utility application') {
    pass('calculator: projectType');
  } else {
    fail('calculator: projectType', calculatorArchitecture.projectType);
  }

  for (const component of ['App', 'Display', 'Keypad', 'Button']) {
    if (calculatorArchitecture.components.includes(component)) pass(`calculator: component ${component}`);
    else fail(`calculator: component ${component}`);
  }

  const weatherUnderstanding = analyzePrompt(GENERIC_PROTOTYPE_PROMPT);
  const weatherPlan = createDraftBuildPlan(weatherUnderstanding);
  const weatherArchitecture = createArchitecturePlan(weatherUnderstanding, weatherPlan);

  for (const folder of ['src/', 'components/', 'pages/', 'services/', 'types/']) {
    if (weatherArchitecture.folders.includes(folder)) pass(`weather: folder ${folder}`);
    else fail(`weather: folder ${folder}`);
  }

  for (const component of ['WeatherDisplay', 'SearchBar', 'ForecastCard']) {
    if (weatherArchitecture.components.includes(component)) pass(`weather: component ${component}`);
    else fail(`weather: component ${component}`);
  }

  if (weatherArchitecture.pages.includes('Home')) pass('weather: page Home');
  else fail('weather: page Home');

  if (weatherArchitecture.dataLayer === 'Placeholder WeatherService') {
    pass('weather: dataLayer Placeholder WeatherService');
  } else {
    fail('weather: dataLayer Placeholder WeatherService', weatherArchitecture.dataLayer);
  }

  console.log('\n── Supported app builds ──\n');

  const calculatorReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT, skipPreview: true });
  assertArchitecture(
    calculatorReport,
    formatBuildReport(calculatorReport),
    {
      ...COMMON_ARCH_OPTIONS,
      expectProjectType: 'Calculator utility application',
      expectFolders: ['src/'],
      expectComponents: ['Display', 'Keypad', 'Button'],
      expectPages: ['Calculator'],
      expectDataLayer: 'Local component state',
    },
    pass,
    fail,
  );

  const counterReport = await buildFromPrompt({ prompt: COUNTER_PATH_PROMPT, skipPreview: true });
  assertArchitecture(
    counterReport,
    formatBuildReport(counterReport),
    {
      ...COMMON_ARCH_OPTIONS,
      expectProjectType: 'Counter utility application',
      expectComponents: ['CountDisplay', 'ControlButtons'],
      expectPages: ['Counter'],
    },
    pass,
    fail,
  );

  const todoReport = await buildFromPrompt({ prompt: TODO_PATH_PROMPT, skipPreview: true });
  assertArchitecture(
    todoReport,
    formatBuildReport(todoReport),
    {
      ...COMMON_ARCH_OPTIONS,
      expectProjectType: 'Todo list application',
      expectComponents: ['TaskInput', 'TaskList', 'TaskItem'],
      expectPages: ['Todo list'],
    },
    pass,
    fail,
  );

  console.log('\n── Generic prototype build ──\n');

  const weatherReport = await buildFromPrompt({ prompt: GENERIC_PROTOTYPE_PROMPT, skipPreview: true });
  assertArchitecture(
    weatherReport,
    formatBuildReport(weatherReport),
    {
      ...COMMON_ARCH_OPTIONS,
      expectProjectType: 'Weather information application',
      expectFolders: ['components/', 'pages/', 'services/', 'types/'],
      expectComponents: ['WeatherDisplay', 'SearchBar', 'ForecastCard'],
      expectPages: ['Home'],
      expectDataLayer: 'Placeholder WeatherService',
    },
    pass,
    fail,
  );

  console.log('');
  if (failures.length === 0) {
    console.log('PASSED\n');
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
