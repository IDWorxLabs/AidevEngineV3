import {
  baseLayoutCss,
  crudHandlers,
  crudImports,
  crudOverlays,
  crudStateBlock,
  layoutRootAttrs,
  type LayoutBuildContext,
  type LayoutBuildResult,
} from './layout-generator-shared.js';
import { UI_STRATEGY_MARKER } from '../ui-strategy-types.js';

const CRM_COLUMNS = ['Lead', 'Active', 'Won', 'Lost'] as const;

export function buildKanbanLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.kanban-layout { display: grid; gap: var(--ds-space-md); }
.pipeline-board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--ds-space-md); }
.pipeline-column { display: grid; gap: var(--ds-space-sm); min-height: 240px; }
.deal-card { padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); cursor: pointer; }
.follow-up-queue { display: grid; gap: var(--ds-space-sm); }
@media (max-width: 900px) { .pipeline-board { grid-template-columns: 1fr 1fr; } }
`,
    homePage: `${crudImports()}
const PIPELINE_COLUMNS = ${JSON.stringify(CRM_COLUMNS)};

export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  const followUps = visibleItems.filter((item) => item.status === 'pending').slice(0, 5);

  return (
    <div ${layoutRootAttrs(ctx, 'pipeline-board')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="kanban-layout">
        <div className="pipeline-board" ${UI_STRATEGY_MARKER}-component="PipelineBoard">
          {PIPELINE_COLUMNS.map((column) => (
            <div key={column} className="pipeline-column ds-card" ${UI_STRATEGY_MARKER}-component="PipelineColumn">
              <h2 className="section-title">{column}</h2>
              {visibleItems.filter((item) => (item.stage ?? item.category) === column).map((item) => (
                <article key={item.id} className="deal-card" onClick={() => setSelected(item)} ${UI_STRATEGY_MARKER}-component="DealCard">
                  <strong>{item.title}</strong>
                  <p className="muted-text">{item.company ?? item.description}</p>
                  {typeof item.amount === 'number' ? <span>{item.amount.toFixed(0)}</span> : null}
                  <button type="button" className="ds-button secondary" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>Edit</button>
                </article>
              ))}
            </div>
          ))}
        </div>
        <div className="follow-up-queue ds-card" ${UI_STRATEGY_MARKER}-component="FollowUpQueue">
          <h2 className="section-title">Follow-up queue</h2>
          {followUps.map((item) => (
            <div key={item.id} className="schedule-row"><strong>{item.title}</strong><span>{item.date}</span></div>
          ))}
        </div>
        <EntityCardView item={selected ?? visibleItems[0] ?? null} />
      </section>
      <div className="strategy-toolbar-row">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar category={filterCategory} onCategoryChange={setFilterCategory} />
        <Toolbar onCreate={openCreate} onSort={() => toggleSort('title')} sortLabel={sortLabel} />
      </div>
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}
