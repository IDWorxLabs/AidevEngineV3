import type { GeneratedFile } from '../../types.js';
import {
  CRUD_CAPABILITIES,
  CRUD_CAPABILITY_MARKERS,
  DATA_PATTERNS,
  DATA_PATTERN_MARKERS,
  type CrudCapability,
  type DataPattern,
  type GenericApplicationCapabilities,
  type UiPattern,
  UI_PATTERNS,
  UI_PATTERN_MARKERS,
} from './generic-capability-types.js';

function detectPatterns<T extends string>(
  allPatterns: readonly T[],
  markers: Record<T, string>,
  corpus: string,
): T[] {
  return allPatterns.filter((pattern) => corpus.includes(markers[pattern]));
}

function computeCapabilityScore(
  uiPatterns: UiPattern[],
  dataPatterns: DataPattern[],
  crudCapabilities: CrudCapability[],
): number {
  const uiScore = uiPatterns.length / UI_PATTERNS.length;
  const dataScore = dataPatterns.length / DATA_PATTERNS.length;
  const crudScore = crudCapabilities.length / CRUD_CAPABILITIES.length;
  return Math.round(((uiScore + dataScore + crudScore) / 3) * 100) / 100;
}

export function evaluateGenericApplicationCapabilities(
  files: GeneratedFile[],
): GenericApplicationCapabilities {
  const corpus = files.map((file) => `${file.relativePath}\n${file.content}`).join('\n');

  const uiPatterns = detectPatterns(UI_PATTERNS, UI_PATTERN_MARKERS, corpus);
  const dataPatterns = detectPatterns(DATA_PATTERNS, DATA_PATTERN_MARKERS, corpus);
  const crudCapabilities = detectPatterns(CRUD_CAPABILITIES, CRUD_CAPABILITY_MARKERS, corpus);

  return {
    uiPatterns,
    dataPatterns,
    crudCapabilities,
    capabilityScore: computeCapabilityScore(uiPatterns, dataPatterns, crudCapabilities),
  };
}
