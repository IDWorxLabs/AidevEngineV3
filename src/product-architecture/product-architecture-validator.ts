import type { ProductArchitectureModel } from './product-architecture-types.js';

export interface ProductArchitectureValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProductArchitectureModel(
  model: ProductArchitectureModel,
): ProductArchitectureValidationResult {
  const errors: string[] = [];

  if (!model.productType?.trim()) errors.push('missing product type');
  if (!model.productGoal?.trim()) errors.push('missing product goal');
  if (model.primaryModules.length === 0) errors.push('missing primary modules');
  if (model.secondaryModules.length === 0) errors.push('missing secondary modules');
  if (model.userRoles.length === 0) errors.push('missing user roles');
  if (model.permissionModel.length === 0) errors.push('missing permission model');
  if (model.dataEntities.length === 0) errors.push('missing data entities');
  if (model.entityRelationships.length === 0) errors.push('missing entity relationships');
  if (model.productBoundaries.includedNow.length === 0) errors.push('missing product boundaries');
  if (model.navigationArchitecture.length === 0) errors.push('missing navigation architecture');
  if (model.notificationModel.length === 0) errors.push('missing notification model');
  if (model.integrationReadiness.length === 0) errors.push('missing integration readiness');
  if (model.extensibilityPlan.length === 0) errors.push('missing extensibility plan');
  if (model.riskAreas.length === 0) errors.push('missing risk areas');
  if (model.futureCapabilities.length === 0) errors.push('missing future capabilities');

  return { valid: errors.length === 0, errors };
}
