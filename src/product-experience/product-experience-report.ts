import {
  computeExperienceConfidence,
  summarizeExperience,
} from './product-experience-engine.js';
import type { ProductExperienceModel, ProductExperienceReport } from './product-experience-types.js';

export function buildProductExperienceReport(model: ProductExperienceModel): ProductExperienceReport {
  const confidence = computeExperienceConfidence(model);
  const { ctaHierarchy, feedbackModel, ...rest } = model;

  return {
    ...rest,
    ctaHierarchy: [
      `Primary: ${ctaHierarchy.primary}`,
      `Secondary: ${ctaHierarchy.secondary.join(', ')}`,
      `Destructive: ${ctaHierarchy.destructive}`,
      `Passive: ${ctaHierarchy.passive.join(', ')}`,
      `Persistent: ${ctaHierarchy.persistent.join(', ')}`,
    ],
    feedbackModel: [
      `After create: ${feedbackModel.afterCreate}`,
      `After edit: ${feedbackModel.afterEdit}`,
      `After delete: ${feedbackModel.afterDelete}`,
      `After primary workflow: ${feedbackModel.afterPrimaryWorkflow}`,
      `Confirmation: ${feedbackModel.confirmationMessage}`,
      `Success: ${feedbackModel.successMessage}`,
      `Warning: ${feedbackModel.warningMessage}`,
    ],
    experienceConfidence: confidence,
    experienceSummary: summarizeExperience(confidence),
  };
}
