import type { AppType } from '../types.js';

const CALCULATOR_PATTERN = /\bcalculator\b/i;
const COUNTER_APP_PATTERN = /counter app/i;
const TODO_APP_PATTERN = /(?:todo app|to-do app|task app)/i;

export function detectAppType(prompt: string): AppType {
  if (CALCULATOR_PATTERN.test(prompt)) return 'calculator';
  if (COUNTER_APP_PATTERN.test(prompt)) return 'counter';
  if (TODO_APP_PATTERN.test(prompt)) return 'todo';
  return 'unknown';
}

export function slugifyPrompt(prompt: string, appType: AppType): string {
  const base = appType !== 'unknown' ? appType : 'app';
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join('-');
  return words ? `${base}-${words}` : base;
}
