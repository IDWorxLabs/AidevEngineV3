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

export function buildPosLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.pos-layout { display: grid; grid-template-columns: 1.4fr 0.8fr; gap: var(--ds-space-md); }
.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--ds-space-sm); }
.menu-item-card { padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); cursor: pointer; }
.order-cart { display: grid; gap: var(--ds-space-sm); align-content: start; }
.checkout-panel { display: grid; gap: var(--ds-space-sm); margin-top: var(--ds-space-md); padding-top: var(--ds-space-md); border-top: 1px solid var(--ds-color-border); }
@media (max-width: 900px) { .pos-layout { grid-template-columns: 1fr; } }
`,
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  const cartItems = selected ? [selected] : visibleItems.slice(0, 3);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);

  return (
    <div ${layoutRootAttrs(ctx, 'menu-grid')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="pos-layout">
        <div>
          <div className="strategy-toolbar-row" ${UI_STRATEGY_MARKER}-component="MenuCategories">
            <FilterBar category={filterCategory} onCategoryChange={setFilterCategory} />
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <div className="menu-grid" ${UI_STRATEGY_MARKER}-component="MenuGrid">
            {visibleItems.map((item) => (
              <article key={item.id} className="menu-item-card ds-card" onClick={() => setSelected(item)}>
                <strong>{item.title}</strong>
                <span className="muted-text">{item.category}</span>
                <span>{typeof item.amount === 'number' ? item.amount.toFixed(2) : '—'}</span>
              </article>
            ))}
          </div>
        </div>
        <aside className="order-cart ds-card" ${UI_STRATEGY_MARKER}-component="OrderCart">
          <h2 className="section-title">Active order</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="schedule-row">
              <strong>{item.title}</strong>
              <span>{typeof item.amount === 'number' ? item.amount.toFixed(2) : '—'}</span>
            </div>
          ))}
          <div className="checkout-panel" ${UI_STRATEGY_MARKER}-component="CheckoutPanel">
            <strong>Total: {cartTotal.toFixed(2)}</strong>
            <Toolbar onCreate={openCreate} onSort={() => toggleSort('title')} sortLabel={sortLabel} />
            {selected ? <button type="button" className="ds-button secondary" onClick={() => openEdit(selected)}>${creation.editActionLabel}</button> : null}
          </div>
        </aside>
      </section>
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}
