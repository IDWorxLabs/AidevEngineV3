import type { BuildReport, GenerationMode } from '../src/types.js';

export function assertGenerationMode(
  report: BuildReport,
  reportText: string,
  expected: GenerationMode,
  pass: (label: string) => void,
  fail: (label: string, detail?: string) => void,
): void {
  if (report.generationMode === expected) pass(`generationMode is ${expected}`);
  else fail(`generationMode is ${expected}`, report.generationMode ?? 'missing');

  if (reportText.includes(`Generation Mode: ${expected}`)) {
    pass('report text includes Generation Mode');
  } else {
    fail('report text includes Generation Mode');
  }
}
