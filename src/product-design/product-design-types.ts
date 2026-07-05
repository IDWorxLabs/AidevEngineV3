export interface InformationHierarchyModel {
  primaryFocus: string;
  secondaryFocus: string;
  supportingContent: string;
  ctaEmphasis: string;
  scanningOrder: readonly string[];
}

export interface ProductDesignModel {
  productPersonality: readonly string[];
  visualTone: string;
  communicationStyle: readonly string[];
  interactionPhilosophy: string;
  primaryEmotionalGoals: readonly string[];
  visualDensity: string;
  spacingPhilosophy: string;
  cornerRadius: string;
  componentStyle: readonly string[];
  shadowStrategy: string;
  typographyPersonality: string;
  motionPersonality: string;
  informationHierarchy: InformationHierarchyModel;
  accessibilityGoals: readonly string[];
  futureResponsiveness: readonly string[];
}

export interface ProductDesignReport {
  productPersonality: readonly string[];
  visualTone: string;
  communicationStyle: readonly string[];
  interactionPhilosophy: string;
  primaryEmotionalGoals: readonly string[];
  visualDensity: string;
  spacingPhilosophy: string;
  cornerRadius: string;
  componentStyle: readonly string[];
  shadowStrategy: string;
  typographyPersonality: string;
  motionPersonality: string;
  informationHierarchy: readonly string[];
  accessibilityGoals: readonly string[];
  futureResponsiveness: readonly string[];
  designConfidence: number;
  designSummary: 'Distinctive' | 'Guided' | 'Basic';
}

export const PRODUCT_DESIGN_MARKER = 'data-product-design';
