import { computePresentationConfidence } from './product-presentation-engine.js';
import type { ProductPresentationModel, ProductPresentationReport } from './product-presentation-types.js';

export function buildProductPresentationReport(
  model: ProductPresentationModel,
): ProductPresentationReport {
  const confidence = computePresentationConfidence(model);

  return {
    ...model,
    presentationConfidence: confidence,
  };
}
