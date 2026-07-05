import type { BuildPlan, GeneratedFile, UnderstandingReport } from '../types.js';
import { buildCommonProjectFiles } from './templates/shared.js';

function listSectionJsx(title: string, constName: string): string {
  return `<section className="plan-section">
        <h2>${title}</h2>
        <ul>
          {${constName}.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>`;
}

export function buildGenericAppFiles(
  understanding: UnderstandingReport,
  plan: BuildPlan,
  projectName: string,
): GeneratedFile[] {
  const features = JSON.stringify(plan.features);
  const pages = JSON.stringify(plan.pages);
  const components = JSON.stringify(plan.components);
  const stack = JSON.stringify(plan.stack);
  const appName = plan.appName;
  const description = understanding.detectedIntent;

  return [
    ...buildCommonProjectFiles(plan, projectName),
    {
      relativePath: 'src/App.tsx',
      content: `const APP_NAME = ${JSON.stringify(appName)};
const DESCRIPTION = ${JSON.stringify(description)};
const FEATURES = ${features} as const;
const PAGES = ${pages} as const;
const COMPONENTS = ${components} as const;
const STACK = ${stack} as const;

export default function App() {
  return (
    <div className="app">
      <p className="prototype-banner">Prototype generated from application understanding.</p>
      <h1>{APP_NAME}</h1>
      <p className="description">{DESCRIPTION}</p>
      ${listSectionJsx('Planned features', 'FEATURES')}
      ${listSectionJsx('Planned pages', 'PAGES')}
      ${listSectionJsx('Planned components', 'COMPONENTS')}
      ${listSectionJsx('Stack', 'STACK')}
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
  width: min(520px, 92vw);
  padding: 1.5rem;
}

.prototype-banner {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  background: #0f3460;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #a8dadc;
  text-align: center;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  color: #a8dadc;
  text-align: center;
}

.description {
  margin: 0 0 1.5rem;
  color: #888;
  text-align: center;
  font-size: 0.9375rem;
}

.plan-section {
  margin-bottom: 1.25rem;
  background: #16213e;
  border-radius: 8px;
  padding: 1rem;
}

.plan-section h2 {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #a8dadc;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.plan-section ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.875rem;
  color: #ccc;
}

.plan-section li {
  margin: 0.25rem 0;
}
`,
    },
  ];
}
