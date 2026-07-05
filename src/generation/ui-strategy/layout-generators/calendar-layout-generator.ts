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

export function buildCalendarLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.calendar-first-layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: var(--ds-space-md); }
.today-timeline, .schedule-grid, .time-slots-panel, .upcoming-reservations { display: grid; gap: var(--ds-space-sm); }
.schedule-row { display: grid; grid-template-columns: 80px 1fr auto; gap: var(--ds-space-sm); padding: var(--ds-space-sm); border-bottom: 1px solid var(--ds-color-border); align-items: center; }
.slot-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--ds-space-sm); }
.time-slot { padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); text-align: center; font-size: 0.85rem; }
@media (max-width: 900px) { .calendar-first-layout { grid-template-columns: 1fr; } .slot-grid { grid-template-columns: repeat(2, 1fr); } }
`,
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  const today = new Date().toISOString().slice(0, 10);
  const todayItems = visibleItems.filter((item) => item.date === today);
  const upcoming = visibleItems.filter((item) => item.date >= today).slice(0, 6);
  const slots = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'];

  return (
    <div ${layoutRootAttrs(ctx, 'schedule-grid')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="calendar-first-layout" aria-label="Calendar schedule">
        <div className="today-timeline ds-card" ${UI_STRATEGY_MARKER}-component="TodayTimeline">
          <h2 className="section-title">Today</h2>
          {todayItems.length === 0 ? <p className="muted-text">No bookings today.</p> : todayItems.map((item) => (
            <div key={item.id} className="schedule-row">
              <span>{item.notes || '—'}</span>
              <div><strong>{item.title}</strong><span className="muted-text">{item.category}</span></div>
              <span className={\`status-chip \${item.status}\`}>{item.status}</span>
            </div>
          ))}
        </div>
        <div className="schedule-grid ds-card" ${UI_STRATEGY_MARKER}-component="ScheduleGrid">
          <h2 className="section-title">Schedule</h2>
          {visibleItems.slice(0, 8).map((item) => (
            <div key={item.id} className="schedule-row">
              <span>{item.date}</span>
              <div><strong>{item.title}</strong><span className="muted-text">{item.description}</span></div>
              <button type="button" className="ds-button secondary" onClick={() => openEdit(item)}>Edit</button>
            </div>
          ))}
        </div>
        <div className="time-slots-panel ds-card" ${UI_STRATEGY_MARKER}-component="TimeSlotsPanel">
          <h2 className="section-title">Available slots</h2>
          <div className="slot-grid">
            {slots.map((slot) => <div key={slot} className="time-slot">{slot}</div>)}
          </div>
        </div>
        <div className="upcoming-reservations ds-card" ${UI_STRATEGY_MARKER}-component="UpcomingReservations">
          <h2 className="section-title">Upcoming reservations</h2>
          <EntityListView items={upcoming} selectedId={selected?.id ?? null} onSelect={setSelected} onEdit={openEdit} />
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
