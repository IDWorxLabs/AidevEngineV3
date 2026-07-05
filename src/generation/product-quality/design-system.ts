import type { GeneratedFile } from '../../types.js';

export function buildProductQualityCss(): string {
  return `:root {
  --ds-font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  --ds-color-bg: #0f1724;
  --ds-color-surface: #16213e;
  --ds-color-surface-alt: #1a2744;
  --ds-color-primary: #3b82f6;
  --ds-color-primary-hover: #2563eb;
  --ds-color-secondary: #334155;
  --ds-color-accent: #a8dadc;
  --ds-color-text: #e8eef7;
  --ds-color-text-muted: #94a3b8;
  --ds-color-danger: #e94560;
  --ds-color-success: #22c55e;
  --ds-color-warning: #f59e0b;
  --ds-radius-sm: 6px;
  --ds-radius-md: 10px;
  --ds-radius-lg: 14px;
  --ds-space-xs: 0.25rem;
  --ds-space-sm: 0.5rem;
  --ds-space-md: 1rem;
  --ds-space-lg: 1.5rem;
  --ds-space-xl: 2rem;
  --ds-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  --ds-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.45);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--ds-font-family);
  color: var(--ds-color-text);
  background: var(--ds-color-bg);
  line-height: 1.5;
}

.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: min(960px, 96vw);
  margin: 0 auto;
  padding: var(--ds-space-lg);
  gap: var(--ds-space-md);
}

.page-layout[data-layout="responsive-page"] {
  max-width: 100%;
}

.page-header {
  padding: var(--ds-space-md);
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow);
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-color-accent);
}

.page-header p {
  margin: var(--ds-space-xs) 0 0;
  color: var(--ds-color-text-muted);
}

.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-md);
}

.ds-button {
  border: none;
  border-radius: var(--ds-radius-md);
  padding: 0.65rem 1.1rem;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  background: var(--ds-color-primary);
  color: #fff;
  transition: background 0.15s ease;
}

.ds-button:hover { background: var(--ds-color-primary-hover); }
.ds-button:focus-visible { outline: none; box-shadow: var(--ds-focus-ring); }
.ds-button:disabled { opacity: 0.5; cursor: not-allowed; }
.ds-button.secondary { background: var(--ds-color-secondary); }
.ds-button.danger { background: var(--ds-color-danger); }

.ds-input,
.ds-textarea,
.ds-select {
  width: 100%;
  border: 1px solid transparent;
  border-radius: var(--ds-radius-sm);
  padding: 0.65rem 0.75rem;
  background: var(--ds-color-surface-alt);
  color: inherit;
  font: inherit;
}

.ds-input:focus-visible,
.ds-textarea:focus-visible,
.ds-select:focus-visible {
  outline: none;
  border-color: var(--ds-color-primary);
  box-shadow: var(--ds-focus-ring);
}

.ds-card {
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-md);
  box-shadow: var(--ds-shadow);
}

.field-group {
  display: grid;
  gap: var(--ds-space-sm);
  margin-bottom: var(--ds-space-md);
}

.field-hint {
  font-size: 0.85rem;
  color: var(--ds-color-text-muted);
}

.success-banner {
  padding: var(--ds-space-sm) var(--ds-space-md);
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid var(--ds-color-success);
  border-radius: var(--ds-radius-md);
  color: var(--ds-color-success);
}

.scroll-panel {
  max-height: 420px;
  overflow-y: auto;
  padding-right: var(--ds-space-xs);
}

.list-item-selected {
  outline: 2px solid var(--ds-color-accent);
  outline-offset: 2px;
}

.loading-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-sm);
  padding: var(--ds-space-md);
  color: var(--ds-color-text-muted);
}

.empty-state-panel {
  text-align: center;
  padding: var(--ds-space-xl);
  color: var(--ds-color-text-muted);
}

.error-panel {
  padding: var(--ds-space-md);
  background: rgba(233, 69, 96, 0.15);
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-color-danger);
}

@media (max-width: 720px) {
  .page-layout { padding: var(--ds-space-md); }
  .content-grid { grid-template-columns: 1fr !important; }
}
`;
}

export function productQualityStylesFile(): GeneratedFile {
  return {
    relativePath: 'src/styles/product-quality.css',
    content: buildProductQualityCss(),
  };
}

export function wrapIndexCss(appCss: string): string {
  return `@import './styles/product-quality.css';\n\n${appCss}`;
}

export function pageLayoutShell(headerTitle: string, headerSubtitle: string, mainContent: string): string {
  return `<div className="page-layout" data-layout="responsive-page">
      <header className="page-header" data-layout="header" data-accessibility="semantic-html">
        <h1>${headerTitle}</h1>
        <p>${headerSubtitle}</p>
      </header>
      <main className="page-main" data-layout="main-content" data-accessibility="semantic-html">
${mainContent}
      </main>
    </div>`;
}
