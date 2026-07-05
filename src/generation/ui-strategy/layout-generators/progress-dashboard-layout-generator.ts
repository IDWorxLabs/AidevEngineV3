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

export function buildProgressDashboardLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.progress-dashboard-layout { display: grid; gap: var(--ds-space-md); }
.today-checklist, .goal-cards { display: grid; gap: var(--ds-space-sm); }
.checklist-row { display: grid; grid-template-columns: auto 1fr auto; gap: var(--ds-space-sm); align-items: center; padding: var(--ds-space-sm); border-bottom: 1px solid var(--ds-color-border); }
.streak-panel, .weekly-progress { display: grid; gap: var(--ds-space-sm); }
.progress-row { display: grid; grid-template-columns: 100px 1fr 40px; gap: var(--ds-space-sm); align-items: center; }
`,
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  const today = new Date().toISOString().slice(0, 10);
  const todayItems = visibleItems.filter((item) => item.date === today);
  const completed = todayItems.filter((item) => item.status === 'completed').length;
  const completionPct = todayItems.length ? Math.round((completed / todayItems.length) * 100) : 0;

  return (
    <div ${layoutRootAttrs(ctx, 'today-checklist')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="progress-dashboard-layout">
        <div className="today-checklist ds-card" ${UI_STRATEGY_MARKER}-component="TodayChecklist">
          <h2 className="section-title">Today</h2>
          {todayItems.map((item) => (
            <div key={item.id} className="checklist-row">
              <span className={\`status-chip \${item.status}\`}>{item.status}</span>
              <div><strong>{item.title}</strong><span className="muted-text">{item.description}</span></div>
              <button type="button" className="ds-button secondary" onClick={() => openEdit(item)}>Edit</button>
            </div>
          ))}
        </div>
        <div className="streak-panel ds-card" ${UI_STRATEGY_MARKER}-component="StreakPanel">
          <h2 className="section-title">Streak & goals</h2>
          <p>Completion today: {completionPct}%</p>
          <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: \`\${completionPct}%\` }} /></div>
        </div>
        <div className="weekly-progress ds-card" ${UI_STRATEGY_MARKER}-component="WeeklyProgress">
          <h2 className="section-title">Weekly progress</h2>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <div key={day} className="progress-row">
              <span>{day}</span>
              <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: \`\${Math.min(100, 40 + index * 12)}%\` }} /></div>
              <span>{Math.min(100, 40 + index * 12)}%</span>
            </div>
          ))}
        </div>
        <div className="goal-cards" ${UI_STRATEGY_MARKER}-component="GoalCards">
          {visibleItems.slice(0, 4).map((item) => (
            <article key={item.id} className="ds-card"><strong>{item.title}</strong><p className="muted-text">{item.category}</p></article>
          ))}
        </div>
        <ChartPlaceholder items={allItems} />
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
