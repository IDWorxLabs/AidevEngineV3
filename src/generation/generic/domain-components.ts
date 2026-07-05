import type { ApplicationDomainProfile } from './domain-profiles.js';
import {
  DOMAIN_COMPONENT_MARKER,
  DOMAIN_LAYOUT_MARKER,
} from './domain-profiles.js';
import type { DomainCreationProfile } from './domain-creation-profiles.js';
import { SOFTWARE_CREATION_MARKER } from './domain-creation-profiles.js';

export function buildDashboardSummary(
  profile: ApplicationDomainProfile,
  creation: DomainCreationProfile,
): string {
  const cards = profile.dashboardCards
    .map(
      (card, index) => `        <article className="ds-card dashboard-card" ${DOMAIN_COMPONENT_MARKER}="statistics-card" ${SOFTWARE_CREATION_MARKER}="computed-metric" data-domain-section="${card.label}">
          <p className="dashboard-card-label">${card.label}</p>
          <strong className="dashboard-card-value">{metrics[${index}] ?? '—'}</strong>
          <span className="dashboard-card-hint">${card.hint}</span>
        </article>`,
    )
    .join('\n');

  return `interface DashboardSummaryProps {
  metrics: string[];
}

export function DashboardSummary({ metrics }: DashboardSummaryProps) {
  return (
    <section className="dashboard-summary responsive-grid" ${DOMAIN_LAYOUT_MARKER}="${profile.domainId}" ${DOMAIN_COMPONENT_MARKER}="summary-section" ${SOFTWARE_CREATION_MARKER}="dashboard" data-accessibility="semantic-html">
      <div className="dashboard-grid">
${cards}
      </div>
    </section>
  );
}
`;
}

export function buildChartPlaceholder(
  profile: ApplicationDomainProfile,
  creation: DomainCreationProfile,
): string {
  const bars = creation.chartSegments
    .map(
      (segment) => `          <div className="chart-bar-row" ${SOFTWARE_CREATION_MARKER}="chart-bar">
            <span className="chart-bar-label">${segment.label}</span>
            <div className="chart-bar-track"><div className="chart-bar-fill" style={{ width: \`${segment.value}%\` }} /></div>
            <span className="chart-bar-value">${segment.value}%</span>
          </div>`,
    )
    .join('\n');

  return `import { useMemo } from 'react';
import type { Entity } from '../types/entity';

interface ChartPlaceholderProps {
  items: Entity[];
}

export function ChartPlaceholder({ items }: ChartPlaceholderProps) {
  const breakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of items) {
      const key = item.category || 'Other';
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }
    const max = Math.max(1, ...totals.values());
    return [...totals.entries()].slice(0, 4).map(([label, count]) => ({
      label,
      pct: Math.round((count / max) * 100),
    }));
  }, [items]);

  return (
    <section className="ds-card chart-placeholder" ${DOMAIN_COMPONENT_MARKER}="chart-placeholder" ${SOFTWARE_CREATION_MARKER}="category-chart" aria-label="${profile.chartLabel}">
      <h2 className="section-title">${profile.chartLabel}</h2>
      <div className="chart-bars" role="img" aria-label="${profile.chartLabel}">
${bars}
        {breakdown.map((row) => (
          <div key={row.label} className="chart-bar-row live-bar">
            <span className="chart-bar-label">{row.label}</span>
            <div className="chart-bar-track"><div className="chart-bar-fill live" style={{ width: \`\${row.pct}%\` }} /></div>
            <span className="chart-bar-value">{row.pct}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

export function buildRecentActivityPanel(
  profile: ApplicationDomainProfile,
  entityLabel: string,
): string {
  return `import type { Entity } from '../types/entity';

interface RecentActivityPanelProps {
  items: Entity[];
}

export function RecentActivityPanel({ items }: RecentActivityPanelProps) {
  const recent = items.slice(0, 5);

  return (
    <section className="ds-card recent-activity" ${DOMAIN_COMPONENT_MARKER}="recent-activity" ${SOFTWARE_CREATION_MARKER}="starter-list" data-accessibility="semantic-html">
      <h2 className="section-title">${profile.recentActivityLabel}</h2>
      <ul className="recent-activity-list entity-table">
        {recent.map((item) => (
          <li key={item.id} className="entity-table-row">
            <div>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>
            <div className="entity-table-meta">
              <span>{item.category}</span>
              {item.date ? <span>{item.date}</span> : null}
              {typeof item.amount === 'number' ? <span>{item.amount.toFixed(2)}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
`;
}

export function buildFilterBar(creation: DomainCreationProfile, entityLabelPlural: string): string {
  const options = creation.filterOptions.map((o) => `'${o}'`).join(', ');

  return `interface FilterBarProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

const FILTER_OPTIONS = [${options}] as const;

export function FilterBar({ category, onCategoryChange }: FilterBarProps) {
  return (
    <div className="filter-bar" ${DOMAIN_COMPONENT_MARKER}="filter-bar" ${SOFTWARE_CREATION_MARKER}="domain-filter" data-ui-pattern="filter-bar">
      <label>
        Filter ${entityLabelPlural.toLowerCase()}
        <select className="ds-input" value={category} onChange={(e) => onCategoryChange(e.target.value)} aria-label="Filter category">
          {FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
`;
}

export function buildDomainMetricsHook(creation: DomainCreationProfile): string {
  return `import { useMemo } from 'react';
import type { Entity } from '../types/entity';

export function useDomainMetrics(items: Entity[]): string[] {
  return useMemo(() => {
    ${creation.metricsComputation}
  }, [items]);
}
`;
}

export function domainLayoutCss(): string {
  return `
.dashboard-summary { margin-bottom: var(--ds-space-lg); }
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--ds-space-md);
}
.dashboard-card-label { margin: 0; color: var(--ds-color-text-muted); font-size: 0.85rem; }
.dashboard-card-value { display: block; font-size: 1.75rem; margin: 0.35rem 0; }
.dashboard-card-hint { color: var(--ds-color-text-muted); font-size: 0.8rem; }
.section-title { margin: 0 0 var(--ds-space-sm); font-size: 1rem; }
.domain-layout { display: grid; gap: var(--ds-space-md); }
.domain-panels { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: var(--ds-space-md); }
.chart-bars { display: grid; gap: var(--ds-space-sm); padding-top: var(--ds-space-sm); }
.chart-bar-row { display: grid; grid-template-columns: 90px 1fr 40px; gap: var(--ds-space-sm); align-items: center; font-size: 0.85rem; }
.chart-bar-track { height: 10px; background: var(--ds-color-border); border-radius: 999px; overflow: hidden; }
.chart-bar-fill { height: 100%; background: linear-gradient(90deg, var(--ds-color-primary, #6366f1), #34d399); border-radius: 999px; }
.chart-bar-fill.live { opacity: 0.85; }
.chart-bar-label, .chart-bar-value { color: var(--ds-color-text-muted); }
.recent-activity-list { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--ds-space-sm); }
.entity-table-row { display: flex; justify-content: space-between; gap: var(--ds-space-md); padding: var(--ds-space-sm) 0; border-bottom: 1px solid var(--ds-color-border); }
.entity-table-row strong { display: block; }
.entity-table-row span { color: var(--ds-color-text-muted); font-size: 0.85rem; }
.entity-table-meta { display: grid; gap: 0.15rem; text-align: right; font-size: 0.8rem; color: var(--ds-color-text-muted); }
.list-meta { display: flex; flex-wrap: wrap; gap: 0.35rem; font-size: 0.75rem; color: var(--ds-color-text-muted); }
.list-meta-row { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem; }
.filter-bar { margin-bottom: var(--ds-space-md); }
.muted-text { color: var(--ds-color-text-muted); }
@media (max-width: 900px) {
  .dashboard-grid, .domain-panels, .content-grid { grid-template-columns: 1fr; }
}
`;
}
