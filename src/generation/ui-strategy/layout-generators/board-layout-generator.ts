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

const BOARD_COLUMNS = ['pending', 'active', 'completed'] as const;

export function buildBoardLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.board-layout { display: grid; gap: var(--ds-space-md); }
.task-board { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--ds-space-md); }
.board-column { display: grid; gap: var(--ds-space-sm); min-height: 240px; }
.task-card { padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); cursor: pointer; }
@media (max-width: 900px) { .task-board { grid-template-columns: 1fr; } }
`,
    homePage: `${crudImports()}
const BOARD_COLUMNS = ${JSON.stringify(BOARD_COLUMNS)};

export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  return (
    <div ${layoutRootAttrs(ctx, 'task-board')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="board-layout">
        <div className="task-board" ${UI_STRATEGY_MARKER}-component="TaskBoard">
          {BOARD_COLUMNS.map((column) => (
            <div key={column} className="board-column ds-card" ${UI_STRATEGY_MARKER}-component="BoardColumn">
              <h2 className="section-title">{column}</h2>
              {visibleItems.filter((item) => item.status === column).map((item) => (
                <article key={item.id} className="task-card" onClick={() => setSelected(item)} ${UI_STRATEGY_MARKER}-component="TaskCard">
                  <strong>{item.title}</strong>
                  <p className="muted-text">{item.description}</p>
                  <span className="status-chip">{item.priority ?? item.category}</span>
                  <span className="muted-text">{item.date}</span>
                  <button type="button" className="ds-button secondary" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>Edit</button>
                </article>
              ))}
            </div>
          ))}
        </div>
        <EntityCardView item={selected ?? visibleItems[0] ?? null} />
      </section>
      <div className="strategy-toolbar-row">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar category={filterCategory} onCategoryChange={setFilterCategory} />
        <Toolbar onCreate={openCreate} onSort={() => toggleSort('date')} sortLabel={sortLabel} />
      </div>
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}
