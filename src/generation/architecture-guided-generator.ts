import type {
  ArchitectureGeneration,
  ArchitecturePlan,
  BuildPlan,
  GeneratedFile,
  UnderstandingReport,
} from '../types.js';
import { shouldInjectBrokenImport, BROKEN_IMPORT_LINE } from '../repair/fault-injection.js';
import {
  featuresConst,
  featuresListCss,
  featuresListJsx,
} from '../generator/templates/shared.js';
import { buildGenericCrudWorkspace } from './generic/generic-crud-generator.js';
import type { CrudExperiencePlan } from './plan-crud-experience.js';
import { buildWeatherWorkspace } from './generic/weather-workspace.js';
import { isWeatherApplication } from './generic/infer-application-profile.js';
import {
  baseProjectFiles,
  collectEvidence,
  type ArchitectureGuidedInput,
} from './architecture-guided-shared.js';
import { productQualityStylesFile, wrapIndexCss } from './product-quality/design-system.js';

export interface ArchitectureGuidedWorkspace {
  files: GeneratedFile[];
  architectureGeneration: ArchitectureGeneration;
  uiStrategy: import('./ui-strategy/ui-strategy-types.js').UiStrategyReport | null;
  workflowIntelligence: import('../workflow/workflow-types.js').WorkflowReport | null;
  productExperience: import('../product-experience/product-experience-types.js').ProductExperienceReport | null;
}

export interface ArchitectureGuidedWorkspaceInput {
  understanding: UnderstandingReport;
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
  projectName: string;
  experiencePlan?: CrudExperiencePlan | null;
}

function guidedInput(input: ArchitectureGuidedWorkspaceInput): ArchitectureGuidedInput {
  return {
    buildPlan: input.buildPlan,
    architecturePlan: input.architecturePlan,
    projectName: input.projectName,
  };
}

function finalizeWorkspace(
  files: GeneratedFile[],
  architecturePlan: ArchitecturePlan,
  uiStrategy: import('./ui-strategy/ui-strategy-types.js').UiStrategyReport | null = null,
  workflowIntelligence: import('../workflow/workflow-types.js').WorkflowReport | null = null,
  productExperience: import('../product-experience/product-experience-types.js').ProductExperienceReport | null = null,
): ArchitectureGuidedWorkspace {
  const evidence = collectEvidence(files, architecturePlan);
  return {
    files,
    uiStrategy,
    workflowIntelligence,
    productExperience,
    architectureGeneration: {
      applied: true,
      foldersCreated: evidence.foldersCreated,
      componentsGenerated: evidence.componentsGenerated,
      pagesGenerated: evidence.pagesGenerated,
      servicesGenerated: evidence.servicesGenerated,
    },
  };
}

function buildCalculatorWorkspace(input: ArchitectureGuidedWorkspaceInput): GeneratedFile[] {
  const { buildPlan } = input;
  const features = featuresConst(buildPlan);
  const brokenImport = shouldInjectBrokenImport(buildPlan.originalPrompt)
    ? `${BROKEN_IMPORT_LINE}\n\n`
    : '';

  const displayComponent = `interface DisplayProps {
  value: string;
}

export function Display({ value }: DisplayProps) {
  return <div className="display ds-card" aria-live="polite" data-design-component="card" data-accessibility="aria-label">{value}</div>;
}
`;

  const buttonComponent = `interface CalcButtonProps {
  label: string;
  className?: string;
  onPress: (label: string) => void;
}

export function Button({ label, className = '', onPress }: CalcButtonProps) {
  return (
    <button className={'ds-button' + (className ? ' ' + className : '')} onClick={() => onPress(label)} data-design-component="button" data-accessibility="focus-visible keyboard-nav" aria-label={label}>
      {label}
    </button>
  );
}
`;

  const keypadComponent = `import { Button } from './Button';

const BUTTONS = [
  ['C', '±', '%', '/'],
  ['7', '8', '9', '*'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
] as const;

interface KeypadProps {
  onPress: (label: string) => void;
}

export function Keypad({ onPress }: KeypadProps) {
  return (
    <div className="keypad">
      {BUTTONS.flat().map((label) => (
        <Button
          key={label}
          label={label}
          className={['+', '-', '*', '/', '='].includes(label) ? 'op' : label === '0' ? 'zero' : ''}
          onPress={onPress}
        />
      ))}
    </div>
  );
}
`;

  const appComponent = `${brokenImport}import { useState } from 'react';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';

const FEATURES = ${features} as const;

function evaluate(a: number, b: number, op: string): number | null {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? null : a / b;
    default: return null;
  }
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const inputDigit = (digit: string) => {
    setDisplay((prev) => {
      if (fresh) return digit === '.' ? '0.' : digit;
      if (digit === '.' && prev.includes('.')) return prev;
      return prev === '0' && digit !== '.' ? digit : prev + digit;
    });
    setFresh(false);
  };

  const clearAll = () => {
    setDisplay('0');
    setStored(null);
    setOperator(null);
    setFresh(true);
  };

  const applyOperator = (op: string) => {
    const current = parseFloat(display);
    if (stored !== null && operator && !fresh) {
      const result = evaluate(stored, current, operator);
      if (result === null) {
        setDisplay('Error');
        setStored(null);
        setOperator(null);
        setFresh(true);
        return;
      }
      setDisplay(String(result));
      setStored(result);
    } else {
      setStored(current);
    }
    setOperator(op);
    setFresh(true);
  };

  const calculate = () => {
    if (stored === null || !operator) return;
    const current = parseFloat(display);
    const result = evaluate(stored, current, operator);
    if (result === null) {
      setDisplay('Error');
    } else {
      setDisplay(String(result));
    }
    setStored(null);
    setOperator(null);
    setFresh(true);
  };

  const handlePress = (label: string) => {
    if (label === 'C') return clearAll();
    if (label === '=') return calculate();
    if (['+', '-', '*', '/'].includes(label)) return applyOperator(label);
    if (label === '±') {
      setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      return;
    }
    if (label === '%') {
      setDisplay(String(parseFloat(display) / 100));
      return;
    }
    inputDigit(label);
  };

  return (
    <div className="page-layout app" data-layout="responsive-page">
      <header className="page-header" data-layout="header" data-design-component="section-header" data-accessibility="semantic-html">
        <h1>${buildPlan.appName}</h1>
      </header>
      <main className="page-main" data-layout="main-content" data-accessibility="semantic-html">
        ${featuresListJsx()}
        <Display value={display} />
        <Keypad onPress={handlePress} />
      </main>
    </div>
  );
}
`;

  const indexCss = wrapIndexCss(`.app { width: min(360px, 92vw); margin: 0 auto; }
${featuresListCss()}
.display {
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-md);
  text-align: right;
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  margin-bottom: var(--ds-space-md);
  min-height: 3.5rem;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--ds-space-sm);
}

.ds-button.op { background: var(--ds-color-danger); }
.ds-button.zero { grid-column: span 2; }
`);

  return [
    ...baseProjectFiles(guidedInput(input)),
    productQualityStylesFile(),
    { relativePath: 'src/components/Display.tsx', content: displayComponent },
    { relativePath: 'src/components/Button.tsx', content: buttonComponent },
    { relativePath: 'src/components/Keypad.tsx', content: keypadComponent },
    { relativePath: 'src/App.tsx', content: appComponent },
    { relativePath: 'src/index.css', content: indexCss },
  ];
}

function buildCounterWorkspace(input: ArchitectureGuidedWorkspaceInput): GeneratedFile[] {
  const { buildPlan } = input;
  const features = featuresConst(buildPlan);
  const decrementLabel =
    buildPlan.features.find((f) => f.toLowerCase().includes('decrement')) ?? 'Decrement';
  const resetLabel = buildPlan.features.find((f) => f.toLowerCase().includes('reset')) ?? 'Reset';
  const incrementLabel =
    buildPlan.features.find((f) => f.toLowerCase().includes('increment')) ?? 'Increment';

  const countDisplay = `interface CountDisplayProps {
  count: number;
}

export function CountDisplay({ count }: CountDisplayProps) {
  return <p className="count ds-card" aria-live="polite" data-design-component="card" data-accessibility="aria-label">{count}</p>;
}
`;

  const controlButtons = `interface ControlButtonsProps {
  onDecrement: () => void;
  onReset: () => void;
  onIncrement: () => void;
  decrementLabel: string;
  resetLabel: string;
  incrementLabel: string;
}

export function ControlButtons({
  onDecrement,
  onReset,
  onIncrement,
  decrementLabel,
  resetLabel,
  incrementLabel,
}: ControlButtonsProps) {
  return (
    <div className="controls" role="toolbar" data-accessibility="keyboard-nav">
      <button className="ds-button secondary" onClick={onDecrement} data-design-component="button" data-accessibility="focus-visible" aria-label={decrementLabel}>{decrementLabel}</button>
      <button className="ds-button secondary" onClick={onReset} data-design-component="button" data-accessibility="focus-visible" aria-label={resetLabel}>{resetLabel}</button>
      <button className="ds-button" onClick={onIncrement} data-design-component="button" data-accessibility="focus-visible" aria-label={incrementLabel}>{incrementLabel}</button>
    </div>
  );
}
`;

  const appComponent = `import { useState } from 'react';
import { CountDisplay } from './components/CountDisplay';
import { ControlButtons } from './components/ControlButtons';

const FEATURES = ${features} as const;

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="page-layout app" data-layout="responsive-page">
      <header className="page-header" data-layout="header" data-design-component="section-header" data-accessibility="semantic-html">
        <h1>${buildPlan.appName}</h1>
      </header>
      <main className="page-main" data-layout="main-content" data-accessibility="semantic-html">
        ${featuresListJsx()}
        <CountDisplay count={count} />
        <ControlButtons
        decrementLabel={${JSON.stringify(decrementLabel)}}
        resetLabel={${JSON.stringify(resetLabel)}}
        incrementLabel={${JSON.stringify(incrementLabel)}}
        onDecrement={() => setCount((c) => c - 1)}
        onReset={() => setCount(0)}
        onIncrement={() => setCount((c) => c + 1)}
      />
      </main>
    </div>
  );
}
`;

  const indexCss = wrapIndexCss(`.app { text-align: center; width: min(360px, 92vw); margin: 0 auto; }
${featuresListCss()}
.count { font-size: 4rem; margin: 0 0 var(--ds-space-lg); }

.controls { display: flex; gap: var(--ds-space-sm); justify-content: center; flex-wrap: wrap; }
`);

  return [
    ...baseProjectFiles(guidedInput(input)),
    productQualityStylesFile(),
    { relativePath: 'src/components/CountDisplay.tsx', content: countDisplay },
    { relativePath: 'src/components/ControlButtons.tsx', content: controlButtons },
    { relativePath: 'src/App.tsx', content: appComponent },
    { relativePath: 'src/index.css', content: indexCss },
  ];
}

function buildTodoWorkspace(input: ArchitectureGuidedWorkspaceInput): GeneratedFile[] {
  const { buildPlan } = input;
  const features = featuresConst(buildPlan);
  const hasEmptyState = buildPlan.features.some((f) => f.toLowerCase().includes('empty state'));
  const emptyMessage = hasEmptyState ? 'No tasks yet. Add one above.' : 'No tasks yet.';

  const taskInput = `import type { KeyboardEvent } from 'react';

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export function TaskInput({ value, onChange, onAdd }: TaskInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onAdd();
  };

  return (
    <div className="add-row field-group" data-quality-form="field-group">
      <input
        className="ds-input"
        type="text"
        placeholder="Add a task..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Task text"
        data-design-component="input"
        data-accessibility="keyboard-nav focus-visible"
      />
      <span className="field-hint" data-quality-form="validation-hint">Press Enter or click Add Task.</span>
      <button className="ds-button" onClick={onAdd} disabled={!value.trim()} data-design-component="button" data-quality-form="disabled-submit" data-accessibility="focus-visible">Add Task</button>
    </div>
  );
}
`;

  const taskItem = `interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className={task.completed ? 'completed' : ''}>
      <label>
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span>{task.text}</span>
      </label>
      <button className="delete ds-button danger" onClick={() => onDelete(task.id)} data-design-component="button" data-crud-ux="delete-confirm" data-accessibility="focus-visible" aria-label="Delete task">Delete</button>
    </li>
  );
}
`;

  const taskList = `import { TaskItem } from './TaskItem';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  emptyMessage: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskList({ tasks, emptyMessage, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty empty-state-panel" data-layout="empty-state" data-design-component="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="task-list scroll-panel" data-quality-list="scrollable" data-accessibility="semantic-html">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
`;

  const appComponent = `import { useState } from 'react';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';

const FEATURES = ${features} as const;
const EMPTY_MESSAGE = ${JSON.stringify(emptyMessage)};

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [...prev, { id: Date.now(), text, completed: false }]);
    setInput('');
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="page-layout app" data-layout="responsive-page">
      <header className="page-header" data-layout="header" data-design-component="section-header" data-accessibility="semantic-html">
        <h1>${buildPlan.appName}</h1>
      </header>
      <main className="page-main" data-layout="main-content" data-accessibility="semantic-html">
        ${featuresListJsx()}
        <TaskInput value={input} onChange={setInput} onAdd={addTask} />
        <TaskList
          tasks={tasks}
          emptyMessage={EMPTY_MESSAGE}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      </main>
    </div>
  );
}
`;

  const indexCss = wrapIndexCss(`.app { width: min(480px, 92vw); margin: 0 auto; }
${featuresListCss()}
.add-row { display: flex; flex-direction: column; gap: var(--ds-space-sm); margin-bottom: var(--ds-space-md); }

.task-list { list-style: none; padding: 0; margin: 0; }

.task-list li {
  display: flex;
  justify-content: space-between;
  gap: var(--ds-space-sm);
  padding: var(--ds-space-md);
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-md);
  margin-bottom: var(--ds-space-sm);
}

.empty { text-align: center; color: var(--ds-color-text-muted); }
`);

  return [
    ...baseProjectFiles(guidedInput(input)),
    productQualityStylesFile(),
    { relativePath: 'src/components/TaskInput.tsx', content: taskInput },
    { relativePath: 'src/components/TaskItem.tsx', content: taskItem },
    { relativePath: 'src/components/TaskList.tsx', content: taskList },
    { relativePath: 'src/App.tsx', content: appComponent },
    { relativePath: 'src/index.css', content: indexCss },
  ];
}

export function buildArchitectureGuidedWorkspace(
  input: ArchitectureGuidedWorkspaceInput,
): ArchitectureGuidedWorkspace {
  let files: GeneratedFile[];

  switch (input.buildPlan.appType) {
    case 'calculator':
      files = buildCalculatorWorkspace(input);
      break;
    case 'counter':
      files = buildCounterWorkspace(input);
      break;
    case 'todo':
      files = buildTodoWorkspace(input);
      break;
    default:
      if (
        isWeatherApplication(
          input.understanding.suggestedAppName,
          input.understanding.detectedIntent,
          input.architecturePlan.projectType,
        )
      ) {
        files = buildWeatherWorkspace(input);
      } else {
        if (!input.experiencePlan) {
          throw new Error('CRUD experience plan is required before UI generation');
        }
        const crud = buildGenericCrudWorkspace({
          ...input,
          experiencePlan: input.experiencePlan,
        });
        return finalizeWorkspace(
          crud.files,
          input.architecturePlan,
          crud.uiStrategy,
          crud.workflowIntelligence,
          crud.productExperience,
        );
      }
      break;
  }

  return finalizeWorkspace(files, input.architecturePlan, null, null);
}
