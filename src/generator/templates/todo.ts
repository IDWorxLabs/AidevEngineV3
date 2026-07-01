import type { GeneratedFile } from '../../types.js';

export function buildTodoAppFiles(projectName: string): GeneratedFile[] {
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
    <title>Todo</title>
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
      content: `import { useState, type KeyboardEvent } from 'react';

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
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTask();
  };

  return (
    <div className="app">
      <h1>Todo</h1>

      <div className="add-row">
        <input
          type="text"
          placeholder="Add a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Task text"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.text}</span>
              </label>
              <button className="delete" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
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
  width: min(420px, 92vw);
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #a8dadc;
  text-align: center;
}

.add-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

input[type="text"] {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  background: #16213e;
  color: inherit;
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

.empty {
  text-align: center;
  color: #888;
  margin: 2rem 0;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #16213e;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.task-list li.completed span {
  text-decoration: line-through;
  opacity: 0.6;
}

.task-list label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  cursor: pointer;
}

button.delete {
  background: #e94560;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

button.delete:hover { background: #ff6b81; }
`,
    },
  ];
}
