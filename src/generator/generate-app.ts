import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { BuildPlan, GeneratedFile } from '../types.js';
import { buildCalculatorAppFiles } from './templates/calculator.js';
import { buildCounterAppFiles } from './templates/counter.js';
import { buildTodoAppFiles } from './templates/todo.js';

export function resolveAppFiles(plan: BuildPlan, projectName: string): GeneratedFile[] {
  switch (plan.appType) {
    case 'calculator':
      return buildCalculatorAppFiles(plan, projectName);
    case 'counter':
      return buildCounterAppFiles(plan, projectName);
    case 'todo':
      return buildTodoAppFiles(plan, projectName);
    default:
      throw new Error(
        `Unsupported app type: ${plan.appType}. Try "Build a calculator app", "Build a counter app", or "Build a todo app".`,
      );
  }
}

export function writeGeneratedApp(projectDir: string, files: GeneratedFile[]): string[] {
  const written: string[] = [];
  for (const file of files) {
    const fullPath = join(projectDir, file.relativePath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, file.content, 'utf8');
    written.push(file.relativePath);
  }
  return written;
}
