export type FeatureRealityStatus = 'PASS' | 'WARN' | 'FAIL';

export interface FeatureRealityReport {
  requestedFeatures: string[];
  plannedFeatures: string[];
  architectureFeatures: string[];
  generatedFeatureEvidence: string[];
  renderedFeatureEvidence: string[];
  missingFeatures: string[];
  confidenceScore: number;
  status: FeatureRealityStatus;
}
