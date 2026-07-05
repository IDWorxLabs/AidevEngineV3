import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { WorkflowModel } from '../workflow/workflow-types.js';
import type { ProductExperienceModel } from '../product-experience/product-experience-types.js';
import type { ProductArchitectureModel } from '../product-architecture/product-architecture-types.js';
import type { ProductDesignModel } from '../product-design/product-design-types.js';
import { blueprintToPresentationModel, getPresentationBlueprint } from './product-presentation-catalog.js';
import type { ProductPresentationModel } from './product-presentation-types.js';

export interface ProductPresentationEngineInput {
  domainProfile: ApplicationDomainProfile;
  creationProfile: DomainCreationProfile;
  workflowModel: WorkflowModel;
  productExperienceModel: ProductExperienceModel;
  productArchitectureModel: ProductArchitectureModel;
  productDesignModel: ProductDesignModel;
}

export function buildProductPresentationModel(
  input: ProductPresentationEngineInput,
): ProductPresentationModel {
  const blueprint = getPresentationBlueprint(
    input.domainProfile,
    input.productDesignModel,
    input.productArchitectureModel,
    input.workflowModel,
  );
  return blueprintToPresentationModel(blueprint);
}

export function computePresentationConfidence(model: ProductPresentationModel): number {
  let score = 0.55;
  if (model.secondarySurfaces.length >= 1) score += 0.06;
  if (model.hiddenEngineeringSurfaces.length >= 3) score += 0.07;
  if (model.dashboardComposition.length >= 3) score += 0.06;
  if (model.aboveTheFoldPriority.length >= 2) score += 0.06;
  if (model.screenSections.length >= 3) score += 0.06;
  if (model.collapsedSections.length >= 2) score += 0.06;
  if (model.drawerSections.length >= 1) score += 0.04;
  if (model.modalSections.length >= 1) score += 0.04;
  return Math.min(0.98, score);
}
