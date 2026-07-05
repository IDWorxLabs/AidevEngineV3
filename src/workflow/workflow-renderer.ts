import type { DomainCreationProfile } from '../generation/generic/domain-creation-profiles.js';
import type { LayoutBuildResult } from '../generation/ui-strategy/layout-generators/layout-generator-shared.js';
import { UI_STRATEGY_MARKER } from '../generation/ui-strategy/ui-strategy-types.js';
import type { WorkflowModel } from './workflow-types.js';
import { WORKFLOW_MARKER } from './workflow-types.js';

export function workflowLayoutCss(): string {
  return `
.workflow-journey-banner { display: grid; gap: var(--ds-space-sm); margin-bottom: var(--ds-space-md); padding: var(--ds-space-md); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); }
.workflow-journey-banner h2 { margin: 0; font-size: 1.05rem; }
.workflow-step-trail { display: flex; flex-wrap: wrap; gap: 0.35rem; list-style: none; padding: 0; margin: 0; }
.workflow-step-trail li { padding: 0.2rem 0.55rem; border-radius: 999px; background: var(--ds-color-border); font-size: 0.75rem; }
.workflow-critical-action { justify-self: start; }
.workflow-entry-label { color: var(--ds-color-text-muted); font-size: 0.85rem; margin: 0; }
`;
}

export function buildWorkflowBanner(model: WorkflowModel, creation: DomainCreationProfile): string {
  const steps = model.workflowSteps.slice(0, 6);
  const stepItems = steps
    .map((step) => `          <li ${WORKFLOW_MARKER}="step" data-step-id="${step.id}">${step.title}</li>`)
    .join('\n');

  return `      <section className="workflow-journey-banner ds-card" ${WORKFLOW_MARKER}="primary-workflow" ${WORKFLOW_MARKER}-entry="${model.entryScreen}" ${WORKFLOW_MARKER}-completion="${model.completionScreen}" aria-label="Primary workflow">
        <p className="workflow-entry-label">Entry: ${model.entryScreen} · Goal: ${model.applicationGoal}</p>
        <h2 ${WORKFLOW_MARKER}="entry-screen">${model.entryScreen}</h2>
        <ol className="workflow-step-trail">
${stepItems}
        </ol>
        <button type="button" className="ds-button workflow-critical-action" onClick={openCreate} ${WORKFLOW_MARKER}="critical-action" data-crud-action="create">
          ${model.criticalActions[0] ?? creation.createActionLabel}
        </button>
      </section>
`;
}

export function applyWorkflowToLayout(
  layoutResult: LayoutBuildResult,
  model: WorkflowModel,
  creation: DomainCreationProfile,
): LayoutBuildResult {
  const banner = buildWorkflowBanner(model, creation);
  let homePage = layoutResult.homePage;

  const headerStart = homePage.indexOf('<NavigationHeader');
  if (headerStart >= 0) {
    const headerEnd = homePage.indexOf('/>', headerStart);
    if (headerEnd >= 0) {
      homePage = `${homePage.slice(0, headerEnd + 2)}\n${banner}${homePage.slice(headerEnd + 2)}`;
    }
  }

  const navAttr = `${WORKFLOW_MARKER}-navigation="${model.navigationModel}"`;
  if (!homePage.includes(navAttr)) {
    homePage = homePage.replace(
      UI_STRATEGY_MARKER,
      `${WORKFLOW_MARKER}="workflow-driven"\n      ${navAttr}\n      ${UI_STRATEGY_MARKER}`,
    );
  }

  return {
    ...layoutResult,
    homePage,
    layoutCss: `${layoutResult.layoutCss}\n${workflowLayoutCss()}`,
    layoutComponents: [...layoutResult.layoutComponents, 'WorkflowJourneyBanner'],
  };
}
