import type { BuildLoopReport, BuildLoopStatus } from '../build-loop/build-loop-types.js';
import type { FeatureRealityReport, FeatureRealityStatus } from '../feature-reality/feature-reality-types.js';
import type { ProductQualityReport } from '../generation/product-quality/product-quality-types.js';
import type {
  PreviewVerificationReport,
  PreviewVerificationStatus,
} from './preview-verification-types.js';

export type RealAppTrialVerdict = 'PASS' | 'WARN' | 'FAIL';

export interface RealAppTrialResult {
  prompt: string;
  applicationType: string;
  understandingSucceeded: boolean;
  architectureGenerationApplied: boolean;
  featureRealityStatus: FeatureRealityStatus;
  previewVerificationStatus: PreviewVerificationStatus;
  productQualityScore: number;
  workspaceGenerated: boolean;
  installSucceeded: boolean;
  buildSucceeded: boolean;
  previewVerified: boolean;
  buildLoopStatus: BuildLoopStatus;
  previewUrl: string | null;
  durationMs: number;
  warnings: string[];
  verdict: RealAppTrialVerdict;
  featureReality: FeatureRealityReport | null;
  buildLoop: BuildLoopReport | null;
  previewVerification: PreviewVerificationReport | null;
  productQuality: ProductQualityReport | null;
  totalEngineeringTimeMs: number;
  slowestStage: string | null;
  fastestStage: string | null;
  timelineHealth: string;
}

export interface RealAppTrialSuiteReport {
  totalApps: number;
  passed: number;
  warned: number;
  failed: number;
  previewPassed: number;
  previewWarned: number;
  previewFailed: number;
  averageQualityScore: number;
  averageBuildTime: number;
  averageEngineeringTime: number;
  totalDuration: number;
  overallSuccessPercentage: number;
  results: RealAppTrialResult[];
}
