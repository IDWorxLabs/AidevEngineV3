import { computeDesignConfidence, summarizeDesign } from './product-design-engine.js';
import type { ProductDesignModel, ProductDesignReport } from './product-design-types.js';

export function buildProductDesignReport(model: ProductDesignModel): ProductDesignReport {
  const confidence = computeDesignConfidence(model);
  const { informationHierarchy, ...rest } = model;

  return {
    ...rest,
    informationHierarchy: [
      `Primary focus: ${informationHierarchy.primaryFocus}`,
      `Secondary focus: ${informationHierarchy.secondaryFocus}`,
      `Supporting content: ${informationHierarchy.supportingContent}`,
      `CTA emphasis: ${informationHierarchy.ctaEmphasis}`,
      `Scanning order: ${informationHierarchy.scanningOrder.join(' → ')}`,
    ],
    designConfidence: confidence,
    designSummary: summarizeDesign(confidence),
  };
}
