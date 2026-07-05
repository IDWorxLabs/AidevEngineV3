import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { UiStrategy } from '../generation/ui-strategy/ui-strategy-types.js';
import type { WorkflowModel } from '../workflow/workflow-types.js';
import {
  blueprintToModel,
  getExperienceBlueprint,
  tailorBlueprint,
} from './product-experience-catalog.js';
import type { ProductExperienceModel } from './product-experience-types.js';

export interface ProductExperienceEngineInput {
  domainProfile: ApplicationDomainProfile;
  creationProfile: DomainCreationProfile;
  uiStrategy: UiStrategy;
  workflowModel: WorkflowModel;
}

export function buildProductExperienceModel(input: ProductExperienceEngineInput): ProductExperienceModel {
  const base = getExperienceBlueprint(input.domainProfile.domainId);
  const tailored = tailorBlueprint(
    base,
    input.domainProfile,
    input.creationProfile,
    input.workflowModel,
  );

  const model = blueprintToModel(tailored);

  if (input.workflowModel.workflowSteps.length > 0) {
    return {
      ...model,
      attentionFlow: input.workflowModel.workflowSteps.slice(1, 5).map((step) => step.title),
    };
  }

  return model;
}

export function computeExperienceConfidence(model: ProductExperienceModel): number {
  let score = 0.55;
  if (model.informationHierarchy.length >= 3) score += 0.1;
  if (model.visualHierarchy.length >= 3) score += 0.08;
  if (model.attentionFlow.length >= 3) score += 0.07;
  if (model.trustSignals.length > 0) score += 0.05;
  if (model.frictionReduction.length > 0) score += 0.05;
  if (model.accessibilityGuidance.length >= 3) score += 0.05;
  if (!model.emptyStateStrategy.toLowerCase().includes('no items found')) score += 0.05;
  return Math.min(0.98, score);
}

export function summarizeExperience(confidence: number): 'Guided' | 'Strong' | 'Basic' {
  if (confidence >= 0.85) return 'Guided';
  if (confidence >= 0.7) return 'Strong';
  return 'Basic';
}
