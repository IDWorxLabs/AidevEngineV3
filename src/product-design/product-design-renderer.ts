import type { LayoutBuildResult } from '../generation/ui-strategy/layout-generators/layout-generator-shared.js';
import { UI_STRATEGY_MARKER } from '../generation/ui-strategy/ui-strategy-types.js';
import type { ProductDesignModel } from './product-design-types.js';
import { PRODUCT_DESIGN_MARKER } from './product-design-types.js';

export function productDesignLayoutCss(): string {
  return `
.pdie-design-panel { display: grid; gap: var(--ds-space-sm); margin-bottom: var(--ds-space-md); padding: var(--ds-space-md); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: color-mix(in srgb, var(--ds-color-surface) 94%, #a855f7 6%); }
.pdie-design-panel h3 { margin: 0; font-size: 0.95rem; }
.pdie-meta-row { display: flex; flex-wrap: wrap; gap: 0.35rem; font-size: 0.75rem; color: var(--ds-color-text-muted); }
.pdie-meta-chip { padding: 0.15rem 0.5rem; border-radius: 999px; background: var(--ds-color-border); }
.pdie-hint { font-size: 0.8rem; color: var(--ds-color-text-muted); margin: 0; }
`;
}

export function buildProductDesignPanel(model: ProductDesignModel): string {
  const personalityChips = model.productPersonality
    .map((trait) => `          <span className="pdie-meta-chip" ${PRODUCT_DESIGN_MARKER}="personality-trait">${trait}</span>`)
    .join('\n');
  const emotionalGoals = model.primaryEmotionalGoals.slice(0, 3).join(' · ');
  const accessibilityGoals = model.accessibilityGoals.slice(0, 3).join(' · ');
  const responsiveness = model.futureResponsiveness.join(' · ');

  return `      <section className="pdie-design-panel ds-card" ${PRODUCT_DESIGN_MARKER}="design-panel" aria-label="Product design intelligence">
        <h3 ${PRODUCT_DESIGN_MARKER}="visual-tone">${model.visualTone} · ${model.interactionPhilosophy}</h3>
        <div className="pdie-meta-row" ${PRODUCT_DESIGN_MARKER}="personality">
${personalityChips}
        </div>
        <p className="pdie-hint" ${PRODUCT_DESIGN_MARKER}="emotional-goals">Emotional goals: ${emotionalGoals}</p>
        <p className="pdie-hint" ${PRODUCT_DESIGN_MARKER}="hierarchy">Primary focus: ${model.informationHierarchy.primaryFocus}</p>
        <p className="pdie-hint" ${PRODUCT_DESIGN_MARKER}="density">Density: ${model.visualDensity} · Spacing: ${model.spacingPhilosophy}</p>
        <p className="pdie-hint" ${PRODUCT_DESIGN_MARKER}="accessibility">Accessibility: ${accessibilityGoals}</p>
        <p className="pdie-hint" ${PRODUCT_DESIGN_MARKER}="responsiveness">Responsiveness: ${responsiveness}</p>
      </section>
`;
}

export function applyProductDesignToLayout(
  layoutResult: LayoutBuildResult,
  model: ProductDesignModel,
): LayoutBuildResult {
  const panel = buildProductDesignPanel(model);
  let homePage = layoutResult.homePage;

  const paiePanelEnd = homePage.indexOf('</section>', homePage.indexOf('paie-architecture-panel'));
  if (paiePanelEnd >= 0) {
    const insertAt = paiePanelEnd + '</section>'.length;
    homePage = `${homePage.slice(0, insertAt)}\n${panel}${homePage.slice(insertAt)}`;
  } else {
    const headerStart = homePage.indexOf('<NavigationHeader');
    if (headerStart >= 0) {
      const headerEnd = homePage.indexOf('/>', headerStart);
      if (headerEnd >= 0) {
        homePage = `${homePage.slice(0, headerEnd + 2)}\n${panel}${homePage.slice(headerEnd + 2)}`;
      }
    }
  }

  const pdieAttr = `${PRODUCT_DESIGN_MARKER}="design-driven"`;
  if (!homePage.includes(pdieAttr)) {
    homePage = homePage.replace(
      UI_STRATEGY_MARKER,
      `${pdieAttr}\n      ${PRODUCT_DESIGN_MARKER}-visual-tone="${model.visualTone}"\n      ${PRODUCT_DESIGN_MARKER}-personality="${model.productPersonality.join(', ')}"\n      ${UI_STRATEGY_MARKER}`,
    );
  }

  return {
    ...layoutResult,
    homePage,
    layoutCss: `${layoutResult.layoutCss}\n${productDesignLayoutCss()}`,
    layoutComponents: [...layoutResult.layoutComponents, 'ProductDesignPanel'],
  };
}
