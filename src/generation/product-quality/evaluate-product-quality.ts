import type { GeneratedFile } from '../../types.js';
import {
  ACCESSIBILITY_FEATURES,
  ACCESSIBILITY_MARKERS,
  CRUD_UX_FEATURES,
  CRUD_UX_MARKERS,
  DESIGN_COMPONENTS,
  DESIGN_COMPONENT_MARKERS,
  FORM_QUALITY_MARKERS,
  LAYOUT_FEATURES,
  LAYOUT_MARKERS,
  LIST_QUALITY_MARKERS,
  type AccessibilityFeature,
  type CrudUxFeature,
  type DesignComponent,
  type LayoutFeature,
  type ProductQualityReport,
} from './product-quality-types.js';

function detectPatterns<T extends string>(
  allPatterns: readonly T[],
  markers: Record<T, string>,
  corpus: string,
): T[] {
  return allPatterns.filter((pattern) => corpus.includes(markers[pattern]));
}

function computeQualityScore(
  designComponents: DesignComponent[],
  accessibilityFeatures: AccessibilityFeature[],
  crudUxFeatures: CrudUxFeature[],
  layoutFeatures: LayoutFeature[],
  responsiveLayout: boolean,
  formMarkers: number,
  listMarkers: number,
): number {
  const designScore = designComponents.length / DESIGN_COMPONENTS.length;
  const a11yScore = accessibilityFeatures.length / ACCESSIBILITY_FEATURES.length;
  const crudScore = crudUxFeatures.length / CRUD_UX_FEATURES.length;
  const layoutScore = layoutFeatures.length / LAYOUT_FEATURES.length;
  const formScore = Math.min(formMarkers / 3, 1);
  const listScore = Math.min(listMarkers / 4, 1);
  const responsiveBonus = responsiveLayout ? 1 : 0;

  const total =
    designScore + a11yScore + crudScore + layoutScore + formScore + listScore + responsiveBonus;
  return Math.round((total / 7) * 100) / 100;
}

export function evaluateProductQuality(files: GeneratedFile[]): ProductQualityReport {
  const corpus = files.map((file) => `${file.relativePath}\n${file.content}`).join('\n');

  const designComponents = detectPatterns(DESIGN_COMPONENTS, DESIGN_COMPONENT_MARKERS, corpus);
  const accessibilityFeatures = detectPatterns(
    ACCESSIBILITY_FEATURES,
    ACCESSIBILITY_MARKERS,
    corpus,
  );
  const crudUxFeatures = detectPatterns(CRUD_UX_FEATURES, CRUD_UX_MARKERS, corpus);
  const layoutFeatures = detectPatterns(LAYOUT_FEATURES, LAYOUT_MARKERS, corpus);
  const responsiveLayout = corpus.includes(LAYOUT_MARKERS['Responsive layout']);

  let formMarkers = 0;
  for (const marker of Object.values(FORM_QUALITY_MARKERS)) {
    if (corpus.includes(marker)) formMarkers += 1;
  }

  let listMarkers = 0;
  for (const marker of Object.values(LIST_QUALITY_MARKERS)) {
    if (corpus.includes(marker)) listMarkers += 1;
  }

  return {
    designComponents,
    accessibilityFeatures,
    crudUxFeatures,
    layoutFeatures,
    responsiveLayout,
    qualityScore: computeQualityScore(
      designComponents,
      accessibilityFeatures,
      crudUxFeatures,
      layoutFeatures,
      responsiveLayout,
      formMarkers,
      listMarkers,
    ),
  };
}
