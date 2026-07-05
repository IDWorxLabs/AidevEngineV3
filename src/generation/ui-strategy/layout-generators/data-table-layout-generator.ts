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

export function buildDataTableLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.stock-table-layout { display: grid; gap: var(--ds-space-md); }
.product-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.product-table th, .product-table td { padding: var(--ds-space-sm); border-bottom: 1px solid var(--ds-color-border); text-align: left; }
.product-table tr.low-stock { background: #fef9c3; }
.product-table tr.out-of-stock { background: #fee2e2; }
.stock-summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--ds-space-sm); }
`,
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  return (
    <div ${layoutRootAttrs(ctx, 'product-table')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="stock-table-layout">
        <div className="stock-summary-row" ${UI_STRATEGY_MARKER}-component="StockSummary">
          {metrics.map((value, index) => (
            <article key={index} className="ds-card"><strong>{value}</strong></article>
          ))}
        </div>
        <div className="ds-card" ${UI_STRATEGY_MARKER}-component="ProductTable">
          <table className="product-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Qty</th><th>Reorder</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {visibleItems.map((item) => {
                const qty = item.quantity ?? 0;
                const reorder = item.reorderLevel ?? 0;
                const rowClass = qty === 0 ? 'out-of-stock' : qty <= reorder ? 'low-stock' : '';
                return (
                  <tr key={item.id} className={rowClass} ${UI_STRATEGY_MARKER}-component="LowStockAlerts">
                    <td><strong>{item.title}</strong></td>
                    <td>{item.sku ?? '—'}</td>
                    <td>{item.category}</td>
                    <td>{qty}</td>
                    <td>{reorder}</td>
                    <td>{typeof item.amount === 'number' ? item.amount.toFixed(2) : '—'}</td>
                    <td><button type="button" className="ds-button secondary" onClick={() => openEdit(item)}>Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
