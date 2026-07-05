import type { ProductExperienceModel } from './product-experience-types.js';

export interface ProductExperienceValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProductExperienceModel(
  model: ProductExperienceModel,
): ProductExperienceValidationResult {
  const errors: string[] = [];

  if (!model.experienceGoal?.trim()) errors.push('missing experience goal');
  if (!model.primaryUserEmotion?.trim()) errors.push('missing primary user emotion');
  if (model.informationHierarchy.length < 3) errors.push('information hierarchy incomplete');
  if (model.visualHierarchy.length === 0) errors.push('missing visual hierarchy');
  if (model.attentionFlow.length === 0) errors.push('missing attention flow');
  if (!model.ctaHierarchy.primary?.trim()) errors.push('missing primary CTA');
  if (model.ctaHierarchy.secondary.length === 0) errors.push('missing secondary CTAs');
  if (!model.feedbackModel.afterCreate?.trim()) errors.push('missing feedback after create');
  if (!model.emptyStateStrategy?.trim()) errors.push('missing empty state strategy');
  if (!model.loadingStateStrategy?.trim()) errors.push('missing loading state strategy');
  if (!model.errorStateStrategy?.trim()) errors.push('missing error state strategy');
  if (!model.successStateStrategy?.trim()) errors.push('missing success state strategy');
  if (model.microcopyGuidelines.length === 0) errors.push('missing microcopy guidelines');
  if (model.trustSignals.length === 0) errors.push('missing trust signals');
  if (model.frictionReduction.length === 0) errors.push('missing friction reduction');
  if (model.accessibilityGuidance.length === 0) errors.push('missing accessibility guidance');

  const genericPhrases = ['create item', 'update item', 'no items found'];
  const combined = [
    model.emptyStateStrategy,
    model.feedbackModel.afterCreate,
    model.ctaHierarchy.primary,
    ...model.microcopyGuidelines,
  ]
    .join(' ')
    .toLowerCase();

  for (const phrase of genericPhrases) {
    if (combined.includes(phrase)) {
      errors.push(`generic microcopy detected: ${phrase}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
