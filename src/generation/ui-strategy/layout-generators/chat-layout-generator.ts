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

export function buildChatLayout(ctx: LayoutBuildContext): LayoutBuildResult {
  const { appName, profile, creation, strategy } = ctx;
  return {
    layoutComponents: [...strategy.requiredComponents],
    layoutCss: `${baseLayoutCss()}
.chat-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--ds-space-md); min-height: 420px; }
.conversation-list { display: grid; gap: var(--ds-space-sm); }
.conversation-item { text-align: left; padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); cursor: pointer; }
.message-thread { display: grid; gap: var(--ds-space-sm); align-content: start; min-height: 280px; }
.message-bubble { padding: var(--ds-space-sm); border-radius: var(--ds-radius-md); background: var(--ds-color-border); max-width: 80%; }
.message-composer { display: grid; gap: var(--ds-space-sm); margin-top: auto; }
@media (max-width: 900px) { .chat-layout { grid-template-columns: 1fr; } }
`,
    homePage: `${crudImports(false)}
export default function Home() {
${crudStateBlock(creation)}
${crudHandlers(profile, creation)}

  const active = selected ?? visibleItems[0] ?? null;

  return (
    <div ${layoutRootAttrs(ctx, 'message-thread')}>
      <NavigationHeader title="${appName}" subtitle="${profile.pageSubtitle}" />
      <div className="strategy-toolbar-row">
        <SearchBar value={query} onChange={setQuery} />
        <Toolbar onCreate={openCreate} onSort={() => toggleSort('date')} sortLabel={sortLabel} />
      </div>
      <section className="chat-layout">
        <aside className="conversation-list ds-card" ${UI_STRATEGY_MARKER}-component="ConversationList">
          {visibleItems.map((item) => (
            <button key={item.id} type="button" className="conversation-item" onClick={() => setSelected(item)}>
              <strong>{item.title}</strong>
              <span className="muted-text">{item.category}</span>
              {item.status === 'pending' ? <span className="status-chip">Unread</span> : null}
            </button>
          ))}
        </aside>
        <main className="message-thread ds-card" ${UI_STRATEGY_MARKER}-component="MessageThread">
          {active ? (
            <>
              <div className="message-bubble"><strong>{active.title}</strong><p>{active.description}</p></div>
              <div className="message-bubble"><p>{active.notes || 'Follow-up message preview.'}</p><span className="muted-text">{active.date}</span></div>
              <div className="message-composer" ${UI_STRATEGY_MARKER}-component="MessageComposer">
                <input className="ds-input" placeholder="Type a message..." aria-label="Message composer" />
                <button type="button" className="ds-button secondary" onClick={() => openEdit(active)}>Edit conversation</button>
              </div>
            </>
          ) : (
            <EmptyState message="Select a conversation." />
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
