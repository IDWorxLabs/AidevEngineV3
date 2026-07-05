import type { ArchitecturePlan, BuildPlan, UnderstandingReport } from '../types.js';
import type { ApplicationDomainProfile } from '../generation/generic/domain-profiles.js';
import { inferApplicationDomain } from '../generation/generic/domain-profiles.js';
import {
  resolveDomainCreationProfile,
  type DomainCreationProfile,
} from '../generation/generic/domain-creation-profiles.js';
import {
  selectUiStrategy,
  type UiStrategySelectionResult,
} from '../generation/ui-strategy/select-ui-strategy.js';
import { buildWorkflowModel } from '../workflow/workflow-engine.js';
import { validateWorkflowModel } from '../workflow/workflow-validator.js';
import { buildWorkflowReport } from '../workflow/workflow-report.js';
import type { WorkflowModel, WorkflowReport } from '../workflow/workflow-types.js';
import { buildProductExperienceModel } from '../product-experience/product-experience-engine.js';
import { validateProductExperienceModel } from '../product-experience/product-experience-validator.js';
import { buildProductExperienceReport } from '../product-experience/product-experience-report.js';
import type {
  ProductExperienceModel,
  ProductExperienceReport,
} from '../product-experience/product-experience-types.js';
import { buildProductArchitectureModel } from '../product-architecture/product-architecture-engine.js';
import { validateProductArchitectureModel } from '../product-architecture/product-architecture-validator.js';
import { buildProductArchitectureReport } from '../product-architecture/product-architecture-report.js';
import type {
  ProductArchitectureModel,
  ProductArchitectureReport,
} from '../product-architecture/product-architecture-types.js';

export interface CrudExperiencePlan {
  domainProfile: ApplicationDomainProfile;
  creationProfile: DomainCreationProfile;
  uiStrategySelection: UiStrategySelectionResult;
  workflowModel: WorkflowModel;
  productExperienceModel: ProductExperienceModel;
  productArchitectureModel: ProductArchitectureModel;
}

export interface PlannedCrudExperience {
  plan: CrudExperiencePlan;
  workflowReport: WorkflowReport;
  productExperienceReport: ProductExperienceReport;
  productArchitectureReport: ProductArchitectureReport;
}

export function planCrudExperience(input: {
  understanding: UnderstandingReport;
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
}): PlannedCrudExperience {
  const domainProfile = inferApplicationDomain(input.understanding, input.buildPlan);
  const creationProfile = resolveDomainCreationProfile(input.understanding, input.buildPlan);
  const uiStrategySelection = selectUiStrategy({
    understanding: input.understanding,
    buildPlan: input.buildPlan,
    architecturePlan: input.architecturePlan,
    domainProfile,
  });

  const workflowModel = buildWorkflowModel({
    understanding: input.understanding,
    buildPlan: input.buildPlan,
    architecturePlan: input.architecturePlan,
    domainProfile,
    creationProfile,
    uiStrategy: uiStrategySelection.strategy,
  });

  const workflowValidation = validateWorkflowModel(workflowModel);
  if (!workflowValidation.valid) {
    throw new Error(`Workflow validation failed: ${workflowValidation.errors.join('; ')}`);
  }

  const productExperienceModel = buildProductExperienceModel({
    domainProfile,
    creationProfile,
    uiStrategy: uiStrategySelection.strategy,
    workflowModel,
  });

  const productExperienceValidation = validateProductExperienceModel(productExperienceModel);
  if (!productExperienceValidation.valid) {
    throw new Error(
      `Product experience validation failed: ${productExperienceValidation.errors.join('; ')}`,
    );
  }

  const productArchitectureModel = buildProductArchitectureModel({
    domainProfile,
    workflowModel,
    productExperienceModel,
  });

  const productArchitectureValidation = validateProductArchitectureModel(productArchitectureModel);
  if (!productArchitectureValidation.valid) {
    throw new Error(
      `Product architecture validation failed: ${productArchitectureValidation.errors.join('; ')}`,
    );
  }

  return {
    plan: {
      domainProfile,
      creationProfile,
      uiStrategySelection,
      workflowModel,
      productExperienceModel,
      productArchitectureModel,
    },
    workflowReport: buildWorkflowReport(workflowModel),
    productExperienceReport: buildProductExperienceReport(productExperienceModel),
    productArchitectureReport: buildProductArchitectureReport(productArchitectureModel),
  };
}
