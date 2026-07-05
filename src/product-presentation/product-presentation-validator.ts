import type { ProductPresentationModel } from './product-presentation-types.js';

export interface ProductPresentationValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProductPresentationModel(
  model: ProductPresentationModel,
): ProductPresentationValidationResult {
  const errors: string[] = [];

  if (!model.presentationMode?.trim()) errors.push('missing presentation mode');
  if (!model.primarySurface?.trim()) errors.push('missing primary surface');
  if (model.secondarySurfaces.length === 0) errors.push('missing secondary surfaces');
  if (model.hiddenEngineeringSurfaces.length === 0) errors.push('missing hidden engineering surfaces');
  if (model.dashboardComposition.length === 0) errors.push('missing dashboard composition');
  if (!model.navigationPlacement?.trim()) errors.push('missing navigation placement');
  if (!model.ctaPlacement?.trim()) errors.push('missing CTA placement');
  if (!model.searchPlacement?.trim()) errors.push('missing search placement');
  if (!model.filterPlacement?.trim()) errors.push('missing filter placement');
  if (!model.settingsPlacement?.trim()) errors.push('missing settings placement');
  if (!model.notificationPlacement?.trim()) errors.push('missing notification placement');
  if (!model.roleInformationPlacement?.trim()) errors.push('missing role information placement');
  if (!model.riskInformationPlacement?.trim()) errors.push('missing risk information placement');
  if (!model.futureCapabilityPlacement?.trim()) errors.push('missing future capability placement');
  if (!model.informationDensity?.trim()) errors.push('missing information density');
  if (!model.progressiveDisclosureStrategy?.trim()) errors.push('missing progressive disclosure strategy');
  if (model.aboveTheFoldPriority.length === 0) errors.push('missing above the fold priority');
  if (model.screenSections.length === 0) errors.push('missing screen sections');
  if (model.collapsedSections.length === 0) errors.push('missing collapsed sections');
  if (model.drawerSections.length === 0) errors.push('missing drawer sections');
  if (model.modalSections.length === 0) errors.push('missing modal sections');
  if (!model.emptyStatePlacement?.trim()) errors.push('missing empty state placement');
  if (!model.detailViewPlacement?.trim()) errors.push('missing detail view placement');
  if (!model.reportingPlacement?.trim()) errors.push('missing reporting placement');
  if (!model.mobilePresentationStrategy?.trim()) errors.push('missing mobile presentation strategy');

  return { valid: errors.length === 0, errors };
}
