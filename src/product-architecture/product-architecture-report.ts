import {
  computeArchitectureConfidence,
  summarizeArchitecture,
} from './product-architecture-engine.js';
import type { ProductArchitectureModel, ProductArchitectureReport } from './product-architecture-types.js';

export function buildProductArchitectureReport(
  model: ProductArchitectureModel,
): ProductArchitectureReport {
  const confidence = computeArchitectureConfidence(model);

  return {
    productType: model.productType,
    productGoal: model.productGoal,
    primaryModules: [...model.primaryModules],
    secondaryModules: [...model.secondaryModules],
    adminModules: [...model.adminModules],
    settingsModules: [...model.settingsModules],
    userRoles: [...model.userRoles],
    permissionModel: model.permissionModel.map(
      (rule) => `${rule.role}: ${rule.capabilities.join(', ')}`,
    ),
    dataEntities: [...model.dataEntities],
    entityRelationships: model.entityRelationships.map(
      (rel) => `${rel.from} ${rel.relationship} ${rel.to}`,
    ),
    productBoundaries: [
      `Included now: ${model.productBoundaries.includedNow.join(', ')}`,
      `Future scope: ${model.productBoundaries.futureScope.join(', ')}`,
    ],
    navigationArchitecture: [...model.navigationArchitecture],
    notificationModel: [...model.notificationModel],
    integrationReadiness: [...model.integrationReadiness],
    extensibilityPlan: [...model.extensibilityPlan],
    riskAreas: [...model.riskAreas],
    futureCapabilities: [...model.futureCapabilities],
    architectureConfidence: confidence,
    architectureSummary: summarizeArchitecture(confidence),
  };
}
