export interface PermissionRule {
  role: string;
  capabilities: readonly string[];
}

export interface EntityRelationship {
  from: string;
  relationship: string;
  to: string;
}

export interface ProductBoundaries {
  includedNow: readonly string[];
  futureScope: readonly string[];
}

export interface ProductArchitectureModel {
  productType: string;
  productGoal: string;
  primaryModules: readonly string[];
  secondaryModules: readonly string[];
  adminModules: readonly string[];
  settingsModules: readonly string[];
  userRoles: readonly string[];
  permissionModel: readonly PermissionRule[];
  dataEntities: readonly string[];
  entityRelationships: readonly EntityRelationship[];
  productBoundaries: ProductBoundaries;
  navigationArchitecture: readonly string[];
  notificationModel: readonly string[];
  integrationReadiness: readonly string[];
  extensibilityPlan: readonly string[];
  riskAreas: readonly string[];
  futureCapabilities: readonly string[];
}

export interface ProductArchitectureReport {
  productType: string;
  productGoal: string;
  primaryModules: readonly string[];
  secondaryModules: readonly string[];
  adminModules: readonly string[];
  settingsModules: readonly string[];
  userRoles: readonly string[];
  permissionModel: readonly string[];
  dataEntities: readonly string[];
  entityRelationships: readonly string[];
  productBoundaries: readonly string[];
  navigationArchitecture: readonly string[];
  notificationModel: readonly string[];
  integrationReadiness: readonly string[];
  extensibilityPlan: readonly string[];
  riskAreas: readonly string[];
  futureCapabilities: readonly string[];
  architectureConfidence: number;
  architectureSummary: 'Product-ready' | 'Basic' | 'Prototype';
}

export const PRODUCT_ARCHITECTURE_MARKER = 'data-product-architecture';
