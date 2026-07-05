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

export function buildTimetableLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.timetable-layout { display: grid; gap: var(--ds-space-md); }
.timetable-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--ds-space-sm); }
.timetable-cell { padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-sm); font-size: 0.85rem; min-height: 72px; }
.class-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--ds-space-sm); }
`,
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  return (
    <div ${layoutRootAttrs(ctx, 'timetable-grid')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="timetable-layout">
        <div className="timetable-grid ds-card" ${UI_STRATEGY_MARKER}-component="TimetableGrid">
          {visibleItems.slice(0, 10).map((item) => (
            <div key={item.id} className="timetable-cell">
              <strong>{item.title}</strong>
              <span className="muted-text">{item.date} · {item.category}</span>
              <span className={\`status-chip \${item.status}\`}>{item.status}</span>
            </div>
          ))}
        </div>
        <div className="class-cards" ${UI_STRATEGY_MARKER}-component="ClassCards">
          {visibleItems.slice(0, 6).map((item) => (
            <article key={item.id} className="ds-card">
              <strong>{item.title}</strong>
              <p className="muted-text">{item.description}</p>
              <span className={\`status-chip \${item.status}\`}>{item.status}</span>
              <button type="button" className="ds-button secondary" onClick={() => openEdit(item)}>Edit</button>
            </article>
          ))}
        </div>
        <div className="ds-card" ${UI_STRATEGY_MARKER}-component="UpcomingLessons">
          <h2 className="section-title">Upcoming lessons</h2>
          <EntityListView items={visibleItems.slice(0, 5)} selectedId={selected?.id ?? null} onSelect={setSelected} onEdit={openEdit} />
        </div>
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
