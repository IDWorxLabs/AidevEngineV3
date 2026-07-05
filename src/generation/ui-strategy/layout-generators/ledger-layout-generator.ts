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

export function buildLedgerLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.ledger-layout { display: grid; gap: var(--ds-space-md); }
.balance-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--ds-space-sm); }
.transaction-ledger { width: 100%; border-collapse: collapse; }
.transaction-ledger th, .transaction-ledger td { padding: var(--ds-space-sm); border-bottom: 1px solid var(--ds-color-border); text-align: left; }
.transaction-ledger tr.income td:nth-child(3) { color: #15803d; }
.transaction-ledger tr.expense td:nth-child(3) { color: #b91c1c; }
.category-breakdown { display: grid; gap: var(--ds-space-sm); }
`,
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  return (
    <div ${layoutRootAttrs(ctx, 'transaction-ledger')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <section className="balance-summary" ${UI_STRATEGY_MARKER}-component="BalanceSummary">
        {metrics.map((value, index) => (
          <article key={index} className="ds-card dashboard-card"><strong>{value}</strong></article>
        ))}
      </section>
      <div className="domain-panels">
        <ChartPlaceholder items={allItems} />
        <div className="category-breakdown ds-card" ${UI_STRATEGY_MARKER}-component="CategoryBreakdown">
          <h2 className="section-title">${profile.chartLabel}</h2>
          <RecentActivityPanel items={allItems} />
        </div>
      </div>
      <section className="ledger-layout">
        <div className="strategy-toolbar-row">
          <SearchBar value={query} onChange={setQuery} />
          <FilterBar category={filterCategory} onCategoryChange={setFilterCategory} />
          <Toolbar onCreate={openCreate} onSort={() => toggleSort('date')} sortLabel={sortLabel} />
        </div>
        <div className="ds-card" ${UI_STRATEGY_MARKER}-component="TransactionLedger">
          <table className="transaction-ledger">
            <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Type</th><th>Category</th><th></th></tr></thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id} className={item.recordType ?? 'expense'}>
                  <td>{item.date}</td>
                  <td><strong>{item.title}</strong><br /><span className="muted-text">{item.description}</span></td>
                  <td>{typeof item.amount === 'number' ? item.amount.toFixed(2) : '—'}</td>
                  <td>{item.recordType ?? item.category}</td>
                  <td>{item.category}</td>
                  <td><button type="button" className="ds-button secondary" onClick={() => openEdit(item)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}
