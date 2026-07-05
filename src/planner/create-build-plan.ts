import type { AppType, BuildPlan } from '../types.js';

const COMMON_STACK = ['Vite', 'React', 'TypeScript'] as const;

const COMMON_STRUCTURE = [
  'package.json',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
] as const;

function calculatorPlan(prompt: string): BuildPlan {
  return {
    originalPrompt: prompt,
    appType: 'calculator',
    appName: 'Calculator',
    features: [
      'Numeric display',
      'Digit and decimal input',
      'Basic arithmetic (+, -, *, /)',
      'Clear and equals',
    ],
    pages: ['Calculator (single page)'],
    components: ['App', 'Display', 'Keypad', 'Button'],
    projectStructure: [...COMMON_STRUCTURE],
    stack: [...COMMON_STACK],
  };
}

function counterPlan(prompt: string): BuildPlan {
  return {
    originalPrompt: prompt,
    appType: 'counter',
    appName: 'Counter',
    features: ['Count display', 'Increment', 'Decrement', 'Reset'],
    pages: ['Counter (single page)'],
    components: ['App', 'CountDisplay', 'ControlButtons'],
    projectStructure: [...COMMON_STRUCTURE],
    stack: [...COMMON_STACK],
  };
}

function todoPlan(prompt: string): BuildPlan {
  return {
    originalPrompt: prompt,
    appType: 'todo',
    appName: 'Todo',
    features: [
      'Add task via text input',
      'Task list',
      'Mark complete / uncomplete',
      'Delete task',
      'Empty state message',
    ],
    pages: ['Todo list (single page)'],
    components: ['App', 'TaskInput', 'TaskList', 'TaskItem'],
    projectStructure: [...COMMON_STRUCTURE],
    stack: [...COMMON_STACK],
  };
}

export function createBuildPlan(prompt: string, appType: AppType): BuildPlan {
  switch (appType) {
    case 'calculator':
      return calculatorPlan(prompt);
    case 'counter':
      return counterPlan(prompt);
    case 'todo':
      return todoPlan(prompt);
    default:
      throw new Error(`Cannot create build plan for app type: ${appType}`);
  }
}
