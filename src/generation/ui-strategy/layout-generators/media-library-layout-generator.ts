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

export function buildMediaLibraryLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.media-library-layout { display: grid; grid-template-columns: 240px 1fr; gap: var(--ds-space-md); }
.playlist-sidebar { display: grid; gap: var(--ds-space-sm); }
.track-list { display: grid; gap: var(--ds-space-sm); }
.track-row { display: grid; grid-template-columns: 1fr auto auto; gap: var(--ds-space-sm); padding: var(--ds-space-sm); border-bottom: 1px solid var(--ds-color-border); align-items: center; }
.now-playing { margin-top: var(--ds-space-md); padding: var(--ds-space-md); border-radius: var(--ds-radius-md); background: var(--ds-color-border); }
@media (max-width: 900px) { .media-library-layout { grid-template-columns: 1fr; } }
`,
    homePage: `${crudImports(false)}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  const active = selected ?? visibleItems[0] ?? null;
  const playlists = [...new Set(visibleItems.map((item) => item.category))];

  return (
    <div ${layoutRootAttrs(ctx, 'track-list')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <section className="media-library-layout">
        <aside className="playlist-sidebar ds-card" ${UI_STRATEGY_MARKER}-component="PlaylistSidebar">
          <h2 className="section-title">Playlists</h2>
          {playlists.map((playlist) => (
            <button key={playlist} type="button" className="note-list-item" onClick={() => setFilterCategory(playlist)}>{playlist}</button>
          ))}
        </aside>
        <main>
          <div className="strategy-toolbar-row">
            <SearchBar value={query} onChange={setQuery} />
            <Toolbar onCreate={openCreate} onSort={() => toggleSort('title')} sortLabel={sortLabel} />
          </div>
          <div className="track-list ds-card" ${UI_STRATEGY_MARKER}-component="TrackList">
            {visibleItems.map((item) => (
              <div key={item.id} className="track-row" onClick={() => setSelected(item)}>
                <div><strong>{item.title}</strong><span className="muted-text">{item.description}</span></div>
                <span>{item.category}</span>
                <button type="button" className="ds-button secondary" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>Edit</button>
              </div>
            ))}
          </div>
          <div className="now-playing" ${UI_STRATEGY_MARKER}-component="NowPlayingPanel">
            {active ? <><strong>Now playing:</strong> {active.title} · {active.category}</> : 'Select a track'}
          </div>
        </main>
      </section>
${crudOverlays(profile, creation)}
    </div>
  );
}
`,
  };
}
