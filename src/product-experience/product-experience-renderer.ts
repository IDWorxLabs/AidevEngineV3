import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { LayoutBuildResult } from '../generation/ui-strategy/layout-generators/layout-generator-shared.js';
import { UI_STRATEGY_MARKER } from '../generation/ui-strategy/ui-strategy-types.js';
import type { ProductExperienceModel } from './product-experience-types.js';
import { PRODUCT_EXPERIENCE_MARKER } from './product-experience-types.js';

function escapeForJsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function productExperienceLayoutCss(): string {
  return `
.pxie-guidance-panel { display: grid; gap: var(--ds-space-sm); margin-bottom: var(--ds-space-md); padding: var(--ds-space-md); border: 1px dashed var(--ds-color-border); border-radius: var(--ds-radius-md); background: color-mix(in srgb, var(--ds-color-surface) 92%, #6366f1 8%); }
.pxie-guidance-panel h3 { margin: 0; font-size: 0.95rem; }
.pxie-hierarchy-list, .pxie-trust-list { margin: 0; padding-left: 1.1rem; font-size: 0.85rem; color: var(--ds-color-text-muted); }
.pxie-trust-signal { font-size: 0.8rem; color: var(--ds-color-text-muted); margin: 0; }
.pxie-primary-cta { font-weight: 600; box-shadow: 0 0 0 2px color-mix(in srgb, #6366f1 35%, transparent); }
.pxie-highlight { border-left: 3px solid #6366f1; padding-left: var(--ds-space-sm); }
.pxie-danger-highlight { border-left: 3px solid #ef4444; padding-left: var(--ds-space-sm); background: color-mix(in srgb, #fee2e2 40%, transparent); }
.pxie-success-highlight { border-left: 3px solid #22c55e; padding-left: var(--ds-space-sm); }
.pxie-attention-flow { display: flex; flex-wrap: wrap; gap: 0.35rem; list-style: none; padding: 0; margin: 0; }
.pxie-attention-flow li { padding: 0.15rem 0.5rem; border-radius: 999px; background: var(--ds-color-border); font-size: 0.75rem; }
.pxie-empty-state { font-style: normal; }
.success-banner.pxie-success { border-left: 3px solid #22c55e; }
.loading-state.pxie-loading::after { content: ''; display: inline-block; width: 0.75rem; height: 0.75rem; margin-left: 0.35rem; border: 2px solid var(--ds-color-border); border-top-color: #6366f1; border-radius: 50%; animation: pxie-spin 0.8s linear infinite; vertical-align: middle; }
@keyframes pxie-spin { to { transform: rotate(360deg); } }
`;
}

export function buildProductExperiencePanel(model: ProductExperienceModel): string {
  const hierarchyItems = model.informationHierarchy
    .map((item, index) => `            <li ${PRODUCT_EXPERIENCE_MARKER}="info-${index + 1}">${item}</li>`)
    .join('\n');
  const flowItems = model.attentionFlow
    .map((step) => `            <li ${PRODUCT_EXPERIENCE_MARKER}="attention-step">${step}</li>`)
    .join('\n');
  const trustItems = model.trustSignals
    .map((signal) => `        <p className="pxie-trust-signal" ${PRODUCT_EXPERIENCE_MARKER}="trust">${signal}</p>`)
    .join('\n');

  return `      <section className="pxie-guidance-panel ds-card pxie-highlight" ${PRODUCT_EXPERIENCE_MARKER}="guidance-panel" aria-label="Product experience guidance">
        <h3 ${PRODUCT_EXPERIENCE_MARKER}="experience-goal">${model.experienceGoal}</h3>
        <p className="pxie-trust-signal" ${PRODUCT_EXPERIENCE_MARKER}="emotion">${model.primaryUserEmotion}</p>
        <p className="pxie-trust-signal pxie-empty-state" ${PRODUCT_EXPERIENCE_MARKER}="empty-state">${model.emptyStateStrategy}</p>
        <div>
          <strong>Notice first</strong>
          <ol className="pxie-hierarchy-list">
${hierarchyItems}
          </ol>
        </div>
        <div>
          <strong>Attention flow</strong>
          <ol className="pxie-attention-flow">
${flowItems}
          </ol>
        </div>
${trustItems}
      </section>
`;
}

export function applyProductExperienceToLayout(
  layoutResult: LayoutBuildResult,
  model: ProductExperienceModel,
  creation: DomainCreationProfile,
): LayoutBuildResult {
  const panel = buildProductExperiencePanel(model);
  let homePage = layoutResult.homePage;
  const fb = model.feedbackModel;

  const workflowBannerEnd = homePage.indexOf('</section>', homePage.indexOf('workflow-journey-banner'));
  if (workflowBannerEnd >= 0) {
    const insertAt = workflowBannerEnd + '</section>'.length;
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

  homePage = homePage.replace(
    /setSuccessMessage\(formMode === 'create' \? '[^']*' : '[^']*'\)/,
    `setSuccessMessage(formMode === 'create' ? '${escapeForJsString(fb.afterCreate)}' : '${escapeForJsString(fb.afterEdit)}')`,
  );

  homePage = homePage.replace(
    /setSuccessMessage\('[^']*deleted successfully\.'\)/,
    `setSuccessMessage('${escapeForJsString(fb.afterDelete)}')`,
  );

  homePage = homePage.replace(
    />Loading\.\.\.<\/div>/,
    `>${model.loadingStateStrategy}</div>`,
  );

  homePage = homePage.replace(
    'className="loading-state loading-indicator"',
    `className="loading-state loading-indicator pxie-loading" ${PRODUCT_EXPERIENCE_MARKER}="loading"`,
  );

  homePage = homePage.replace(
    'className="success-banner"',
    `className="success-banner pxie-success" ${PRODUCT_EXPERIENCE_MARKER}="success"`,
  );

  homePage = homePage.replace(
    'className="error-state error-panel"',
    `className="error-state error-panel pxie-error-state" ${PRODUCT_EXPERIENCE_MARKER}="error"`,
  );

  homePage = homePage.replace(
    'workflow-critical-action',
    'workflow-critical-action pxie-primary-cta',
  );

  homePage = homePage.replace(
    /EmptyState message="[^"]*"/g,
    `EmptyState message="${model.emptyStateStrategy.replace(/"/g, '\\"')}" ${PRODUCT_EXPERIENCE_MARKER}="empty-state"`,
  );

  const pxieAttr = `${PRODUCT_EXPERIENCE_MARKER}="experience-driven"`;
  if (!homePage.includes(pxieAttr)) {
    homePage = homePage.replace(
      UI_STRATEGY_MARKER,
      `${pxieAttr}\n      ${PRODUCT_EXPERIENCE_MARKER}-primary-cta="${model.ctaHierarchy.primary}"\n      ${PRODUCT_EXPERIENCE_MARKER}-empty="${model.emptyStateStrategy.slice(0, 40)}"\n      ${UI_STRATEGY_MARKER}`,
    );
  }

  return {
    ...layoutResult,
    homePage,
    layoutCss: `${layoutResult.layoutCss}\n${productExperienceLayoutCss()}`,
    layoutComponents: [...layoutResult.layoutComponents, 'ProductExperiencePanel'],
  };
}
