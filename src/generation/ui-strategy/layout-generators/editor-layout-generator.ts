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

export function buildEditorLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.editor-workspace { display: grid; grid-template-columns: 280px 1fr; gap: var(--ds-space-md); min-height: 420px; }
.notes-sidebar { display: grid; gap: var(--ds-space-sm); align-content: start; }
.note-list-item { text-align: left; padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); cursor: pointer; }
.note-list-item.selected { outline: 2px solid #6366f1; }
.editor-pane { display: grid; gap: var(--ds-space-sm); }
.tags-panel { display: flex; flex-wrap: wrap; gap: 0.35rem; }
@media (max-width: 900px) { .editor-workspace { grid-template-columns: 1fr; } }
`,
    homePage: `${crudImports(false)}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  const active = selected ?? visibleItems[0] ?? null;

  return (
    <div ${layoutRootAttrs(ctx, 'editor-pane')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <div className="strategy-toolbar-row">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar category={filterCategory} onCategoryChange={setFilterCategory} />
        <Toolbar onCreate={openCreate} onSort={() => toggleSort('date')} sortLabel={sortLabel} />
      </div>
      <section className="editor-workspace">
        <aside className="notes-sidebar ds-card" ${UI_STRATEGY_MARKER}-component="NotesSidebar">
          <h2 className="section-title">Notes</h2>
          {visibleItems.map((item) => (
            <button key={item.id} type="button" className={\`note-list-item \${active?.id === item.id ? 'selected' : ''}\`} onClick={() => setSelected(item)}>
              <strong>{item.title}</strong>
              <span className="muted-text">{item.date} · {item.category}</span>
              {item.priority === 'high' ? <span className="status-chip">Pinned</span> : null}
            </button>
          ))}
        </aside>
        <main className="editor-pane ds-card" ${UI_STRATEGY_MARKER}-component="EditorPane">
          {active ? (
            <>
              <h2>{active.title}</h2>
              <div className="tags-panel" ${UI_STRATEGY_MARKER}-component="TagsPanel">
                <span className="status-chip">{active.category}</span>
                {(active.tags ?? []).map((tag) => <span key={tag} className="status-chip">{tag}</span>)}
              </div>
              <p>{active.description}</p>
              <p className="muted-text">Last edited: {active.date}</p>
              <div className="detail-actions">
                <button type="button" className="ds-button secondary" onClick={() => openEdit(active)}>${creation.editActionLabel}</button>
                <button type="button" className="ds-button danger" onClick={() => setConfirmDeleteId(active.id)}>${creation.deleteActionLabel}</button>
              </div>
            </>
          ) : (
            <EmptyState message="Select or create a note." />
          )}
        </main>
      </section>
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}
