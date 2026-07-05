import type { BuildPlan, GeneratedFile } from '../../types.js';
import {
  buildCommonProjectFiles,
  featuresConst,
  featuresListCss,
  featuresListJsx,
} from './shared.js';

function controlLabel(plan: BuildPlan, keyword: string, fallback: string): string {
  return plan.features.find((f) => f.toLowerCase().includes(keyword.toLowerCase())) ?? fallback;
}

export function buildCounterAppFiles(plan: BuildPlan, projectName: string): GeneratedFile[] {
  const features = featuresConst(plan);
  const decrementLabel = controlLabel(plan, 'decrement', 'Decrement');
  const resetLabel = controlLabel(plan, 'reset', 'Reset');
  const incrementLabel = controlLabel(plan, 'increment', 'Increment');

  return [
    ...buildCommonProjectFiles(plan, projectName),
    {
      relativePath: 'src/App.tsx',
      content: `import { useState } from 'react';

const FEATURES = ${features} as const;

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>${plan.appName}</h1>
      ${featuresListJsx()}
      <p className="count" aria-live="polite">{count}</p>
      <div className="controls">
        <button onClick={() => setCount((c) => c - 1)}>${decrementLabel}</button>
        <button onClick={() => setCount(0)}>${resetLabel}</button>
        <button onClick={() => setCount((c) => c + 1)}>${incrementLabel}</button>
      </div>
    </div>
  );
}
`,
    },
    {
      relativePath: 'src/index.css',
      content: `:root {
  font-family: system-ui, sans-serif;
  color: #e8e8e8;
  background: #1a1a2e;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.app {
  text-align: center;
  width: min(320px, 92vw);
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #a8dadc;
}
${featuresListCss()}
.count {
  font-size: 4rem;
  font-variant-numeric: tabular-nums;
  margin: 0 0 1.5rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

button {
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: #0f3460;
  color: inherit;
  cursor: pointer;
}

button:hover { background: #1a4a7a; }
`,
    },
  ];
}
