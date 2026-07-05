import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { ProductExperienceModel } from '../product-experience/product-experience-types.js';
import type { WorkflowModel } from '../workflow/workflow-types.js';
import { blueprintToModel, getArchitectureBlueprint } from './product-architecture-catalog.js';
import type { ProductArchitectureModel } from './product-architecture-types.js';

export interface ProductArchitectureEngineInput {
  domainProfile: ApplicationDomainProfile;
  workflowModel: WorkflowModel;
  productExperienceModel: ProductExperienceModel;
}

export function buildProductArchitectureModel(
  input: ProductArchitectureEngineInput,
): ProductArchitectureModel {
  const blueprint = getArchitectureBlueprint(input.domainProfile.domainId);
  const model = blueprintToModel(blueprint, input.domainProfile.entityLabel);

  return {
    ...model,
    productGoal: `${model.productGoal} Focus: ${input.productExperienceModel.experienceGoal}`,
    futureCapabilities: [
      ...model.futureCapabilities,
      ...input.productExperienceModel.dashboardEmphasis.slice(0, 2),
    ],
  };
}

export function computeArchitectureConfidence(model: ProductArchitectureModel): number {
  let score = 0.55;
  if (model.primaryModules.length >= 3) score += 0.1;
  if (model.secondaryModules.length > 0) score += 0.05;
  if (model.userRoles.length > 0) score += 0.05;
  if (model.permissionModel.length > 0) score += 0.08;
  if (model.entityRelationships.length >= 2) score += 0.07;
  if (model.productBoundaries.includedNow.length > 0) score += 0.05;
  if (model.navigationArchitecture.length >= 4) score += 0.05;
  return Math.min(0.98, score);
}

export function summarizeArchitecture(
  confidence: number,
): 'Product-ready' | 'Basic' | 'Prototype' {
  if (confidence >= 0.85) return 'Product-ready';
  if (confidence >= 0.7) return 'Basic';
  return 'Prototype';
}
