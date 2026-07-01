import type { GeneratedFile } from '../../types.js';

export function buildCalculatorAppFiles(projectName: string): GeneratedFile[] {
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
    <title>Calculator</title>
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

  const buttons = [
    ['C', '±', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

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
    <div className="app">
      <h1>Calculator</h1>
      <div className="display" aria-live="polite">{display}</div>
      <div className="keypad">
        {buttons.flat().map((label) => (
          <button
            key={label}
            className={['+', '-', '*', '/', '='].includes(label) ? 'op' : label === '0' ? 'zero' : ''}
            onClick={() => handlePress(label)}
          >
            {label}
          </button>
        ))}
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
  width: min(320px, 92vw);
}

h1 {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #a8dadc;
}

.display {
  background: #16213e;
  border-radius: 12px;
  padding: 1rem;
  text-align: right;
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  margin-bottom: 1rem;
  min-height: 3.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

button {
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.1rem;
  background: #0f3460;
  color: inherit;
  cursor: pointer;
}

button:hover { background: #1a4a7a; }
button.op { background: #e94560; }
button.op:hover { background: #ff6b81; }
button.zero { grid-column: span 2; }
`,
    },
  ];
}
