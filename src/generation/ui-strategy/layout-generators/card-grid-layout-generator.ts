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

export function buildCardGridLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.recipe-card-grid-layout { display: grid; gap: var(--ds-space-md); }
.recipe-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--ds-space-md); }
.recipe-card { display: grid; gap: 0.35rem; padding: var(--ds-space-md); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); cursor: pointer; }
.recipe-card.selected { outline: 2px solid #6366f1; }
`,
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  return (
    <div ${layoutRootAttrs(ctx, 'recipe-card-grid')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <section className="recipe-card-grid-layout">
        <div className="strategy-toolbar-row">
          <FilterBar category={filterCategory} onCategoryChange={setFilterCategory} />
          <SearchBar value={query} onChange={setQuery} />
          <Toolbar onCreate={openCreate} onSort={() => toggleSort('title')} sortLabel={sortLabel} />
        </div>
        <div className="recipe-card-grid" ${UI_STRATEGY_MARKER}-component="RecipeCardGrid">
          {visibleItems.map((item) => (
            <article key={item.id} className={\`recipe-card ds-card \${selected?.id === item.id ? 'selected' : ''}\`} onClick={() => setSelected(item)}>
              <strong>{item.title}</strong>
              <span className="status-chip">{item.category}</span>
              <span className="muted-text">{item.cookingTime ?? '—'}</span>
              <p className="muted-text">{item.ingredients ?? item.description}</p>
              <button type="button" className="ds-button secondary" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>Edit</button>
            </article>
          ))}
        </div>
        <div ${UI_STRATEGY_MARKER}-component="RecipeDetailPanel"><EntityCardView item={selected ?? visibleItems[0] ?? null} /></div>
      </section>
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}
