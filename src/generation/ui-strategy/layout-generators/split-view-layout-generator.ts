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

export function buildSplitViewLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation } = ctx;
  return {
    layoutComponents: ['DashboardSummary', 'ChartPlaceholder', 'RecentActivityPanel', 'EntityListView', 'EntityCardView'],
    layoutCss: baseLayoutCss(),
    homePage: `${crudImports()}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  return (
    <div ${layoutRootAttrs(ctx, 'list-detail-split')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <DashboardSummary metrics={metrics} />
      <div className="domain-panels">
        <ChartPlaceholder items={allItems} />
        <RecentActivityPanel items={allItems} />
      </div>
      <SearchBar value={query} onChange={setQuery} />
      <FilterBar category={filterCategory} onCategoryChange={setFilterCategory} />
      <Toolbar onCreate={openCreate} onSort={() => toggleSort('title')} sortLabel={sortLabel} />
      {visibleItems.length === 0 ? (
        <EmptyState message="No matching ${profile.entityLabelPlural.toLowerCase()}. Adjust filters or ${creation.createActionLabel.toLowerCase()}." />
      ) : (
        <div className="content-grid">
          <EntityListView items={visibleItems} selectedId={selected?.id ?? null} onSelect={setSelected} onEdit={openEdit} />
          <EntityCardView item={selected ?? visibleItems[0] ?? null} />
        </div>
      )}
      {selected ? (
        <div className="detail-actions">
          <button type="button" className="ds-button secondary" onClick={() => openEdit(selected)}>${creation.editActionLabel}</button>
          <button type="button" className="ds-button danger" onClick={() => setConfirmDeleteId(selected.id)}>${creation.deleteActionLabel}</button>
        </div>
      ) : null}
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}

export function buildDashboardLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  return buildSplitViewLayout(ctx);
}
