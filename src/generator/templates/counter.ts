import type { GeneratedFile } from '../../types.js';

export function buildCounterAppFiles(projectName: string): GeneratedFile[] {
  return [
    {
      relativePath: 'package.json',
      content: JSON.stringify(
        {
          name: projectName,
          private: true,
          version: '0.1.0',
          type: 'module',
          scripts: {
            dev: 'vite --host 127.0.0.1',
            build: 'tsc && vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
          devDependencies: {
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            '@vitejs/plugin-react': '^4.3.0',
            typescript: '^5.7.0',
            vite: '^6.0.0',
          },
        },
        null,
        2,
      ),
    },
    {
      relativePath: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Counter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      relativePath: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
    },
    {
      relativePath: 'tsconfig.json',
      content: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            lib: ['ES2022', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
            noEmit: true,
          },
          include: ['src'],
        },
        null,
        2,
      ),
    },
    {
      relativePath: 'src/main.tsx',
      content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
    },
    {
      relativePath: 'src/App.tsx',
      content: `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>Counter</h1>
      <p className="count" aria-live="polite">{count}</p>
      <div className="controls">
        <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount((c) => c + 1)}>Increment</button>
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
  margin: 0 0 1.5rem;
  color: #a8dadc;
}

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
