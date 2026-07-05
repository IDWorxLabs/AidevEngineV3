export type AppType = 'calculator' | 'counter' | 'todo' | 'unknown';

export type GenerationMode = 'specialized-template' | 'generic-prototype';

export type BuildStage =
  | 'detect'
  | 'detection'
  | 'plan'
  | 'architecture'
  | 'generate'
  | 'feature-reality'
  | 'build-loop'
  | 'install'
  | 'build'
  | 'repair'
  | 'preview'
  | 'complete'
  | 'failed';

export interface BuildPlan {
  originalPrompt: string;
  appType: AppType;
  appName: string;
  features: string[];
  pages: string[];
  components: string[];
  projectStructure: string[];
  stack: string[];
}

export interface UnderstandingReport {
  originalPrompt: string;
  detectedIntent: string;
  suggestedAppName: string;
  applicationCategory: string | null;
  detectedFeatures: string[];
  detectedEntities: string[];
  confidence: number;
  supported: boolean;
  matchedAppType: AppType | null;
  reasoning: string;
}

export interface ArchitecturePlan {
  projectType: string;
  recommendedStack: string[];
  folders: string[];
  files: string[];
  components: string[];
  pages: string[];
  stateManagement: string;
  routing: string;
  dataLayer: string;
  styling: string;
  testingStrategy: string;
}

export interface ArchitectureGeneration {
  applied: boolean;
  foldersCreated: string[];
  componentsGenerated: string[];
  pagesGenerated: string[];
  servicesGenerated: string[];
}

export type { FeatureRealityReport, FeatureRealityStatus } from './feature-reality/feature-reality-types.js';
export type { BuildLoopReport, BuildLoopStageResult, BuildLoopStatus } from './build-loop/build-loop-types.js';
export type { RealAppTrialResult, RealAppTrialSuiteReport, RealAppTrialVerdict } from './testing/real-app-trial-types.js';
export type { GenericApplicationCapabilities } from './generation/generic/generic-capability-types.js';
export type {
  PreviewVerificationReport,
  PreviewVerificationStatus,
} from './testing/preview-verification-types.js';
import type { FeatureRealityReport } from './feature-reality/feature-reality-types.js';
import type { BuildLoopReport } from './build-loop/build-loop-types.js';
import type { RealAppTrialResult } from './testing/real-app-trial-types.js';
import type { GenericApplicationCapabilities } from './generation/generic/generic-capability-types.js';
export type { ProductQualityReport } from './generation/product-quality/product-quality-types.js';
export type { UiStrategyReport } from './generation/ui-strategy/ui-strategy-types.js';
export type { WorkflowReport } from './workflow/workflow-types.js';
export type { ProductExperienceReport } from './product-experience/product-experience-types.js';
export type {
  EngineeringTimeline,
  EngineeringTimelineEvent,
  EngineeringTimelineEventStatus,
  EngineeringTimelineHealth,
  TimelineEventCallback,
} from './runtime/live-engineering-timeline.js';
import type { PreviewVerificationReport } from './testing/preview-verification-types.js';
import type { ProductQualityReport } from './generation/product-quality/product-quality-types.js';
import type { UiStrategyReport } from './generation/ui-strategy/ui-strategy-types.js';
import type { WorkflowReport } from './workflow/workflow-types.js';
import type { ProductExperienceReport } from './product-experience/product-experience-types.js';
import type { EngineeringTimeline, TimelineEventCallback } from './runtime/live-engineering-timeline.js';

export interface GeneratedFile {
  relativePath: string;
  content: string;
}

export interface BuildReport {
  ok: boolean;
  prompt: string;
  appType: AppType;
  understanding: UnderstandingReport | null;
  buildPlan: BuildPlan | null;
  architecturePlan: ArchitecturePlan | null;
  architectureGeneration: ArchitectureGeneration | null;
  featureReality: FeatureRealityReport | null;
  buildLoop: BuildLoopReport | null;
  previewVerification: PreviewVerificationReport | null;
  realAppTrialResults: RealAppTrialResult[] | null;
  genericApplicationCapabilities: GenericApplicationCapabilities | null;
  productQuality: ProductQualityReport | null;
  uiStrategy: UiStrategyReport | null;
  workflowIntelligence: WorkflowReport | null;
  productExperience: ProductExperienceReport | null;
  engineeringTimeline: EngineeringTimeline | null;
  generationMode: GenerationMode | null;
  projectId: string;
  projectDir: string;
  generatedFiles: string[];
  installOk: boolean;
  buildOk: boolean;
  previewUrl: string | null;
  stage: BuildStage;
  error: string | null;
  repairAttempted: boolean;
  repairSucceeded: boolean;
  repairSummary: string | null;
  initialBuildError: string | null;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
}

export interface BuildFromPromptInput {
  prompt: string;
  engineRootDir?: string;
  skipPreview?: boolean;
  onTimelineEvent?: TimelineEventCallback;
}
