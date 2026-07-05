import type { LayoutBuildResult } from '../generation/ui-strategy/layout-generators/layout-generator-shared.js';
import { UI_STRATEGY_MARKER } from '../generation/ui-strategy/ui-strategy-types.js';
import type { ProductArchitectureModel } from './product-architecture-types.js';
import { PRODUCT_ARCHITECTURE_MARKER } from './product-architecture-types.js';

export function productArchitectureLayoutCss(): string {
  return `
.paie-product-nav { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: var(--ds-space-md); padding: var(--ds-space-sm); border-bottom: 1px solid var(--ds-color-border); }
.paie-product-nav button { padding: 0.25rem 0.65rem; border-radius: 999px; border: 1px solid var(--ds-color-border); background: var(--ds-color-surface); font-size: 0.8rem; cursor: default; }
.paie-product-nav button.paie-nav-primary { font-weight: 600; border-color: #6366f1; background: color-mix(in srgb, #6366f1 12%, var(--ds-color-surface)); }
.paie-architecture-panel { display: grid; gap: var(--ds-space-sm); margin-bottom: var(--ds-space-md); padding: var(--ds-space-md); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); }
.paie-architecture-panel h3 { margin: 0; font-size: 0.95rem; }
.paie-meta-row { display: flex; flex-wrap: wrap; gap: 0.35rem; font-size: 0.75rem; color: var(--ds-color-text-muted); }
.paie-meta-chip { padding: 0.15rem 0.5rem; border-radius: 999px; background: var(--ds-color-border); }
.paie-risk-hint { font-size: 0.8rem; color: var(--ds-color-text-muted); margin: 0; }
.paie-role-hint { font-size: 0.8rem; margin: 0; }
.paie-notification-hint { font-size: 0.75rem; color: var(--ds-color-text-muted); margin: 0; }
`;
}

export function buildProductNavigation(model: ProductArchitectureModel): string {
  const navItems = model.navigationArchitecture
    .map((item, index) => {
      const cls = index === 0 ? 'paie-nav-primary' : '';
      return `        <button type="button" className="${cls}" ${PRODUCT_ARCHITECTURE_MARKER}="nav-item" data-module="${item}">${item}</button>`;
    })
    .join('\n');

  return `      <nav className="paie-product-nav" ${PRODUCT_ARCHITECTURE_MARKER}="product-navigation" aria-label="Product navigation">
${navItems}
      </nav>
`;
}

export function buildProductArchitecturePanel(model: ProductArchitectureModel): string {
  const roleHint = model.userRoles.slice(0, 3).join(' · ');
  const riskHint = model.riskAreas[0] ?? 'Monitor data integrity';
  const notificationHint = model.notificationModel.slice(0, 2).join(' · ');
  const futureHint = model.futureCapabilities.slice(0, 2).join(' · ');

  return `      <section className="paie-architecture-panel ds-card" ${PRODUCT_ARCHITECTURE_MARKER}="architecture-panel" aria-label="Product architecture">
        <h3 ${PRODUCT_ARCHITECTURE_MARKER}="product-type">${model.productType}</h3>
        <p className="paie-role-hint" ${PRODUCT_ARCHITECTURE_MARKER}="roles">Roles: ${roleHint}</p>
        <div className="paie-meta-row">
          <span className="paie-meta-chip" ${PRODUCT_ARCHITECTURE_MARKER}="settings-ready">Settings ready</span>
          <span className="paie-meta-chip" ${PRODUCT_ARCHITECTURE_MARKER}="notification-ready">Notifications ready</span>
          <span className="paie-meta-chip" ${PRODUCT_ARCHITECTURE_MARKER}="integration-ready">Integrations ready</span>
        </div>
        <p className="paie-notification-hint" ${PRODUCT_ARCHITECTURE_MARKER}="notifications">${notificationHint}</p>
        <p className="paie-risk-hint" ${PRODUCT_ARCHITECTURE_MARKER}="risk">${riskHint}</p>
        <p className="paie-risk-hint" ${PRODUCT_ARCHITECTURE_MARKER}="future">${futureHint}</p>
      </section>
`;
}

export function applyProductArchitectureToLayout(
  layoutResult: LayoutBuildResult,
  model: ProductArchitectureModel,
): LayoutBuildResult {
  const navigation = buildProductNavigation(model);
  const panel = buildProductArchitecturePanel(model);
  let homePage = layoutResult.homePage;

  const pxiePanelEnd = homePage.indexOf('</section>', homePage.indexOf('pxie-guidance-panel'));
  if (pxiePanelEnd >= 0) {
    const insertAt = pxiePanelEnd + '</section>'.length;
    homePage = `${homePage.slice(0, insertAt)}\n${navigation}${panel}${homePage.slice(insertAt)}`;
  } else {
    const headerStart = homePage.indexOf('<NavigationHeader');
    if (headerStart >= 0) {
      const headerEnd = homePage.indexOf('/>', headerStart);
      if (headerEnd >= 0) {
        homePage = `${homePage.slice(0, headerEnd + 2)}\n${navigation}${panel}${homePage.slice(headerEnd + 2)}`;
      }
    }
  }

  const paieAttr = `${PRODUCT_ARCHITECTURE_MARKER}="architecture-driven"`;
  if (!homePage.includes(paieAttr)) {
    homePage = homePage.replace(
      UI_STRATEGY_MARKER,
      `${paieAttr}\n      ${PRODUCT_ARCHITECTURE_MARKER}-product-type="${model.productType}"\n      ${UI_STRATEGY_MARKER}`,
    );
  }

  return {
    ...layoutResult,
    homePage,
    layoutCss: `${layoutResult.layoutCss}\n${productArchitectureLayoutCss()}`,
    layoutComponents: [...layoutResult.layoutComponents, 'ProductNavigation', 'ProductArchitecturePanel'],
  };
}
