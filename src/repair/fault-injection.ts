/** Test-only fault injection for the minimal build repair loop. */

export const BROKEN_CALCULATOR_PROMPT = 'Build a broken calculator app';

export const BROKEN_IMPORT_LINE =
  "import { brokenFaultInjection } from './__broken_fault_injection__';";

export function shouldInjectBrokenImport(prompt: string): boolean {
  return prompt.trim() === BROKEN_CALCULATOR_PROMPT;
}
