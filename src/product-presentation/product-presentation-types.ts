export type PresentationMode = 'Focused' | 'Balanced' | 'Dense' | 'Guided';

export interface ProductPresentationModel {
  presentationMode: PresentationMode;
  primarySurface: string;
  secondarySurfaces: readonly string[];
  hiddenEngineeringSurfaces: readonly string[];
  dashboardComposition: readonly string[];
  navigationPlacement: string;
  ctaPlacement: string;
  searchPlacement: string;
  filterPlacement: string;
  settingsPlacement: string;
  notificationPlacement: string;
  roleInformationPlacement: string;
  riskInformationPlacement: string;
  futureCapabilityPlacement: string;
  informationDensity: string;
  progressiveDisclosureStrategy: string;
  aboveTheFoldPriority: readonly string[];
  screenSections: readonly string[];
  collapsedSections: readonly string[];
  drawerSections: readonly string[];
  modalSections: readonly string[];
  emptyStatePlacement: string;
  detailViewPlacement: string;
  reportingPlacement: string;
  mobilePresentationStrategy: string;
}

export interface ProductPresentationReport {
  presentationMode: PresentationMode;
  primarySurface: string;
  secondarySurfaces: readonly string[];
  hiddenEngineeringSurfaces: readonly string[];
  dashboardComposition: readonly string[];
  navigationPlacement: string;
  ctaPlacement: string;
  searchPlacement: string;
  filterPlacement: string;
  settingsPlacement: string;
  notificationPlacement: string;
  roleInformationPlacement: string;
  riskInformationPlacement: string;
  futureCapabilityPlacement: string;
  informationDensity: string;
  progressiveDisclosureStrategy: string;
  aboveTheFoldPriority: readonly string[];
  screenSections: readonly string[];
  collapsedSections: readonly string[];
  drawerSections: readonly string[];
  modalSections: readonly string[];
  emptyStatePlacement: string;
  detailViewPlacement: string;
  reportingPlacement: string;
  mobilePresentationStrategy: string;
  presentationConfidence: number;
}

export const PRODUCT_PRESENTATION_MARKER = 'data-product-presentation';
