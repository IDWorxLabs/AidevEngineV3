import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { WorkflowModel } from '../workflow/workflow-types.js';
import type { ProductExperienceModel } from '../product-experience/product-experience-types.js';
import type { ProductArchitectureModel } from '../product-architecture/product-architecture-types.js';
import { blueprintToModel, getDesignBlueprint } from './product-design-catalog.js';
import type { ProductDesignModel } from './product-design-types.js';

export interface ProductDesignEngineInput {
  domainProfile: ApplicationDomainProfile;
  creationProfile: DomainCreationProfile;
  workflowModel: WorkflowModel;
  productExperienceModel: ProductExperienceModel;
  productArchitectureModel: ProductArchitectureModel;
}

export function buildProductDesignModel(input: ProductDesignEngineInput): ProductDesignModel {
  const blueprint = getDesignBlueprint(input.domainProfile, input.creationProfile);
  return blueprintToModel(blueprint);
}

export function computeDesignConfidence(model: ProductDesignModel): number {
  let score = 0.55;
  if (model.productPersonality.length >= 2) score += 0.08;
  if (model.communicationStyle.length >= 2) score += 0.07;
  if (model.primaryEmotionalGoals.length >= 2) score += 0.07;
  if (model.componentStyle.length >= 2) score += 0.05;
  if (model.informationHierarchy.scanningOrder.length >= 3) score += 0.06;
  if (model.accessibilityGoals.length >= 2) score += 0.06;
  if (model.futureResponsiveness.length >= 3) score += 0.06;
  return Math.min(0.98, score);
}

export function summarizeDesign(confidence: number): 'Distinctive' | 'Guided' | 'Basic' {
  if (confidence >= 0.85) return 'Distinctive';
  if (confidence >= 0.7) return 'Guided';
  return 'Basic';
}
