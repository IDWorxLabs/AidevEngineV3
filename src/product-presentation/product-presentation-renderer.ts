import type { LayoutBuildResult } from '../generation/ui-strategy/layout-generators/layout-generator-shared.js';
import { UI_STRATEGY_MARKER } from '../generation/ui-strategy/ui-strategy-types.js';
import type { ProductPresentationModel } from './product-presentation-types.js';
import { PRODUCT_PRESENTATION_MARKER } from './product-presentation-types.js';

export function productPresentationLayoutCss(): string {
  return `
.ppie-engineering-drawer { margin-top: var(--ds-space-lg); border: 1px dashed var(--ds-color-border); border-radius: var(--ds-radius-md); background: color-mix(in srgb, var(--ds-color-surface) 96%, #64748b 4%); }
.ppie-engineering-summary { cursor: pointer; padding: var(--ds-space-sm) var(--ds-space-md); font-size: 0.8rem; color: var(--ds-color-text-muted); list-style: none; }
.ppie-engineering-summary::-webkit-details-marker { display: none; }
.ppie-engineering-content { display: grid; gap: var(--ds-space-sm); padding: 0 var(--ds-space-md) var(--ds-space-md); }
`;
}

/**
 * Extracts a top-level <section className="{className}...">...</section> block
 * (siblings, not nested) from the source string, returning the remainder and the
 * extracted block separately so it can be relocated without losing its content.
 */
function extractSectionByClass(source: string, className: string): { rest: string; block: string } {
  const startIdx = source.indexOf(`<section className="${className}`);
  if (startIdx === -1) return { rest: source, block: '' };
  const endIdx = source.indexOf('</section>', startIdx);
  if (endIdx === -1) return { rest: source, block: '' };
  const blockEnd = endIdx + '</section>'.length;
  const block = source.slice(startIdx, blockEnd);
  const rest = source.slice(0, startIdx) + source.slice(blockEnd);
  return { rest, block };
}

function buildEngineeringDrawer(blocks: readonly string[]): string {
  const content = blocks.filter(Boolean).join('\n');
  if (!content.trim()) return '';

  return `      <details className="ppie-engineering-drawer" ${PRODUCT_PRESENTATION_MARKER}="engineering-drawer" aria-label="Engineering intelligence detail">
        <summary className="ppie-engineering-summary" ${PRODUCT_PRESENTATION_MARKER}="engineering-summary">Engineering intelligence (workflow, experience, architecture, design)</summary>
        <div className="ppie-engineering-content" ${PRODUCT_PRESENTATION_MARKER}="engineering-content">
${content}
        </div>
      </details>
`;
}

/**
 * Moves engineering-derived planning panels (workflow banner, product experience
 * guidance, product architecture detail, product design detail) out of the primary
 * viewport and into a collapsed drawer placed after the domain UI, so the generated
 * app leads with real product content instead of planning metadata. Product
 * navigation and CRUD surfaces are left untouched.
 */
export function applyProductPresentationToLayout(
  layoutResult: LayoutBuildResult,
  model: ProductPresentationModel,
): LayoutBuildResult {
  let homePage = layoutResult.homePage;

  const workflow = extractSectionByClass(homePage, 'workflow-journey-banner');
  homePage = workflow.rest;
  const experience = extractSectionByClass(homePage, 'pxie-guidance-panel');
  homePage = experience.rest;
  const architecture = extractSectionByClass(homePage, 'paie-architecture-panel');
  homePage = architecture.rest;
  const design = extractSectionByClass(homePage, 'pdie-design-panel');
  homePage = design.rest;

  const drawer = buildEngineeringDrawer([workflow.block, experience.block, architecture.block, design.block]);

  if (drawer) {
    const dialogStart = homePage.indexOf('<ConfirmationDialog');
    const dialogCloseIdx = dialogStart >= 0 ? homePage.indexOf('/>', dialogStart) : -1;
    if (dialogCloseIdx >= 0) {
      const insertAt = dialogCloseIdx + 2;
      homePage = `${homePage.slice(0, insertAt)}\n${drawer}${homePage.slice(insertAt)}`;
    } else {
      const closingDivIdx = homePage.lastIndexOf('</div>');
      if (closingDivIdx >= 0) {
        homePage = `${homePage.slice(0, closingDivIdx)}${drawer}${homePage.slice(closingDivIdx)}`;
      } else {
        homePage += drawer;
      }
    }
  }

  const ppieAttr = `${PRODUCT_PRESENTATION_MARKER}="presentation-driven"`;
  if (!homePage.includes(ppieAttr)) {
    homePage = homePage.replace(
      UI_STRATEGY_MARKER,
      `${ppieAttr}\n      ${PRODUCT_PRESENTATION_MARKER}-mode="${model.presentationMode}"\n      ${PRODUCT_PRESENTATION_MARKER}-primary-surface="${model.primarySurface}"\n      ${UI_STRATEGY_MARKER}`,
    );
  }

  return {
    ...layoutResult,
    homePage,
    layoutCss: `${layoutResult.layoutCss}\n${productPresentationLayoutCss()}`,
    layoutComponents: [...layoutResult.layoutComponents, 'ProductPresentationDrawer'],
  };
}
