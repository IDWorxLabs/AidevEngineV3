import type {
  ArchitectureGeneration,
  ArchitecturePlan,
  BuildPlan,
  GeneratedFile,
  UnderstandingReport,
} from '../types.js';
import type { FeatureRealityReport, FeatureRealityStatus } from './feature-reality-types.js';

export interface EvaluateFeatureRealityInput {
  understanding: UnderstandingReport;
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
  architectureGeneration: ArchitectureGeneration | null;
  generatedFiles: GeneratedFile[];
  previewUrl?: string | null;
}

const UI_RENDER_MARKERS = [
  '<button',
  '<input',
  'className=',
  'aria-live',
  'onClick',
  'onChange',
  'onPress',
  'data-component=',
  'data-page=',
] as const;

function featureKeywords(feature: string): string[] {
  const words = feature
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  const symbols = feature.match(/[+\-*/=]/g) ?? [];

  return [...words, ...symbols];
}

function componentTokens(name: string): string[] {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function scoreTokenOverlap(left: string[], right: string[]): number {
  let score = 0;
  for (const a of left) {
    for (const b of right) {
      if (a === b || a.includes(b) || b.includes(a)) {
        score += 1;
      }
    }
  }
  return score;
}

function deriveArchitectureFeatures(
  architecturePlan: ArchitecturePlan,
  architectureGeneration: ArchitectureGeneration | null,
): string[] {
  const features = new Set<string>();

  for (const component of architecturePlan.components) {
    if (component !== 'App') features.add(component);
  }
  for (const page of architecturePlan.pages) {
    features.add(page);
  }
  if (architectureGeneration) {
    for (const service of architectureGeneration.servicesGenerated) {
      features.add(service);
    }
  }
  if (architecturePlan.dataLayer.toLowerCase().includes('service')) {
    features.add(architecturePlan.dataLayer);
  }

  return [...features];
}

function findBestComponentMatch(feature: string, components: string[]): string | null {
  const keywords = featureKeywords(feature);
  let best: { name: string; score: number } | null = null;

  for (const component of components) {
    const score = scoreTokenOverlap(keywords, componentTokens(component));
    if (score > 0 && (!best || score > best.score)) {
      best = { name: component, score };
    }
  }

  return best?.name ?? null;
}

function fileForComponent(files: GeneratedFile[], component: string): GeneratedFile | null {
  const normalized = files.map((file) => ({
    ...file,
    relativePath: file.relativePath.replace(/\\/g, '/'),
  }));

  return (
    normalized.find((file) => file.relativePath.endsWith(`/components/${component}.tsx`)) ??
    normalized.find((file) => file.relativePath.endsWith(`/${component}.tsx`)) ??
    null
  );
}

function renderSurfaces(files: GeneratedFile[]): string {
  return files
    .filter(
      (file) =>
        file.relativePath.endsWith('App.tsx') || file.relativePath.includes('/pages/'),
    )
    .map((file) => file.content)
    .join('\n');
}

function keywordEvidence(feature: string, files: GeneratedFile[]): string | null {
  const keywords = featureKeywords(feature);
  if (keywords.length === 0) return null;

  for (const file of files) {
    const haystack = `${file.relativePath}\n${file.content}`.toLowerCase();
    const hits = keywords.filter((keyword) => haystack.includes(keyword));
    if (hits.length >= Math.min(2, keywords.length) || (keywords.length === 1 && hits.length === 1)) {
      return `${feature}: keywords [${hits.join(', ')}] in ${file.relativePath}`;
    }
  }

  return null;
}

function hasRenderedUiEvidence(feature: string, surface: string, component: string | null): boolean {
  if (component && surface.includes(`<${component}`)) {
    return true;
  }

  const keywords = featureKeywords(feature);
  const lower = surface.toLowerCase();
  const hasKeyword = keywords.some((keyword) => lower.includes(keyword));
  const hasUi = UI_RENDER_MARKERS.some((marker) => surface.includes(marker));

  return hasKeyword && hasUi;
}

function resolveStatus(confidenceScore: number, missingCount: number): FeatureRealityStatus {
  if (missingCount === 0) return 'PASS';
  if (confidenceScore >= 0.5) return 'WARN';
  return 'FAIL';
}

export function evaluateFeatureReality(input: EvaluateFeatureRealityInput): FeatureRealityReport {
  const {
    understanding,
    buildPlan,
    architecturePlan,
    architectureGeneration,
    generatedFiles,
    previewUrl,
  } = input;

  const requestedFeatures = [...understanding.detectedFeatures];
  const plannedFeatures = [...buildPlan.features];
  const architectureFeatures = deriveArchitectureFeatures(architecturePlan, architectureGeneration);

  const architectureComponents = architecturePlan.components.filter((name) => name !== 'App');
  const generatedFeatureEvidence: string[] = [];
  const renderedFeatureEvidence: string[] = [];
  const missingFeatures: string[] = [];

  const surface = renderSurfaces(generatedFiles);

  for (const feature of requestedFeatures) {
    const matchedComponent = findBestComponentMatch(feature, architectureComponents);
    const componentFile = matchedComponent ? fileForComponent(generatedFiles, matchedComponent) : null;

    if (componentFile) {
      generatedFeatureEvidence.push(
        `${feature}: ${matchedComponent} in ${componentFile.relativePath}`,
      );

      if (hasRenderedUiEvidence(feature, surface, matchedComponent)) {
        renderedFeatureEvidence.push(
          `${feature}: <${matchedComponent} /> rendered in app/page surface`,
        );
      }
      continue;
    }

    const keywordProof = keywordEvidence(feature, generatedFiles);
    if (keywordProof) {
      generatedFeatureEvidence.push(keywordProof);

      if (hasRenderedUiEvidence(feature, surface, null)) {
        renderedFeatureEvidence.push(`${feature}: UI markers in app/page surface`);
      }
      continue;
    }

    missingFeatures.push(feature);
  }

  if (architectureGeneration) {
    for (const service of architectureGeneration.servicesGenerated) {
      const serviceFile = generatedFiles.find((file) =>
        file.relativePath.replace(/\\/g, '/').endsWith(`/services/${service}.ts`),
      );
      if (serviceFile) {
        generatedFeatureEvidence.push(`Service: ${service} in ${serviceFile.relativePath}`);
      }
    }

    for (const component of architectureGeneration.componentsGenerated) {
      const componentFile = fileForComponent(generatedFiles, component);
      if (!componentFile) continue;

      const alreadyRecorded = generatedFeatureEvidence.some((entry) =>
        entry.includes(component),
      );
      if (!alreadyRecorded) {
        generatedFeatureEvidence.push(
          `Architecture component: ${component} in ${componentFile.relativePath}`,
        );
      }

      if (surface.includes(`<${component}`)) {
        renderedFeatureEvidence.push(
          `Architecture component: <${component} /> rendered in app/page surface`,
        );
      }
    }
  }

  if (previewUrl) {
    renderedFeatureEvidence.push(`Preview reachable: ${previewUrl}`);
  }

  const confidenceScore =
    requestedFeatures.length === 0
      ? 1
      : (requestedFeatures.length - missingFeatures.length) / requestedFeatures.length;

  return {
    requestedFeatures,
    plannedFeatures,
    architectureFeatures,
    generatedFeatureEvidence,
    renderedFeatureEvidence,
    missingFeatures,
    confidenceScore,
    status: resolveStatus(confidenceScore, missingFeatures.length),
  };
}
