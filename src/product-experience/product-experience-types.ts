export interface CtaHierarchy {
  primary: string;
  secondary: readonly string[];
  destructive: string;
  passive: readonly string[];
  persistent: readonly string[];
}

export interface FeedbackModel {
  afterCreate: string;
  afterEdit: string;
  afterDelete: string;
  afterPrimaryWorkflow: string;
  confirmationMessage: string;
  successMessage: string;
  warningMessage: string;
}

export interface ProductExperienceModel {
  experienceGoal: string;
  primaryUserEmotion: string;
  informationHierarchy: readonly string[];
  visualHierarchy: readonly string[];
  attentionFlow: readonly string[];
  ctaHierarchy: CtaHierarchy;
  feedbackModel: FeedbackModel;
  emptyStateStrategy: string;
  loadingStateStrategy: string;
  errorStateStrategy: string;
  successStateStrategy: string;
  microcopyGuidelines: readonly string[];
  dashboardEmphasis: readonly string[];
  trustSignals: readonly string[];
  frictionReduction: readonly string[];
  accessibilityGuidance: readonly string[];
}

export interface ProductExperienceReport {
  experienceGoal: string;
  primaryUserEmotion: string;
  informationHierarchy: readonly string[];
  visualHierarchy: readonly string[];
  attentionFlow: readonly string[];
  ctaHierarchy: readonly string[];
  feedbackModel: readonly string[];
  emptyStateStrategy: string;
  loadingStateStrategy: string;
  errorStateStrategy: string;
  successStateStrategy: string;
  microcopyGuidelines: readonly string[];
  dashboardEmphasis: readonly string[];
  trustSignals: readonly string[];
  frictionReduction: readonly string[];
  accessibilityGuidance: readonly string[];
  experienceConfidence: number;
  experienceSummary: 'Guided' | 'Strong' | 'Basic';
}

export const PRODUCT_EXPERIENCE_MARKER = 'data-product-experience';
