import type { ProductDesignModel } from './product-design-types.js';

export interface ProductDesignValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProductDesignModel(
  model: ProductDesignModel,
): ProductDesignValidationResult {
  const errors: string[] = [];

  if (model.productPersonality.length === 0) errors.push('missing product personality');
  if (!model.visualTone?.trim()) errors.push('missing visual tone');
  if (model.communicationStyle.length === 0) errors.push('missing communication style');
  if (!model.interactionPhilosophy?.trim()) errors.push('missing interaction philosophy');
  if (model.primaryEmotionalGoals.length === 0) errors.push('missing primary emotional goals');
  if (!model.visualDensity?.trim()) errors.push('missing visual density');
  if (!model.spacingPhilosophy?.trim()) errors.push('missing spacing philosophy');
  if (!model.cornerRadius?.trim()) errors.push('missing corner radius');
  if (model.componentStyle.length === 0) errors.push('missing component style');
  if (!model.shadowStrategy?.trim()) errors.push('missing shadow strategy');
  if (!model.typographyPersonality?.trim()) errors.push('missing typography personality');
  if (!model.motionPersonality?.trim()) errors.push('missing motion personality');
  if (!model.informationHierarchy?.primaryFocus?.trim()) errors.push('missing information hierarchy primary focus');
  if (!model.informationHierarchy?.secondaryFocus?.trim()) errors.push('missing information hierarchy secondary focus');
  if (!model.informationHierarchy?.supportingContent?.trim()) errors.push('missing information hierarchy supporting content');
  if (!model.informationHierarchy?.ctaEmphasis?.trim()) errors.push('missing information hierarchy CTA emphasis');
  if (model.informationHierarchy?.scanningOrder.length === 0) errors.push('missing information hierarchy scanning order');
  if (model.accessibilityGoals.length === 0) errors.push('missing accessibility goals');
  if (model.futureResponsiveness.length === 0) errors.push('missing future responsiveness');

  return { valid: errors.length === 0, errors };
}
