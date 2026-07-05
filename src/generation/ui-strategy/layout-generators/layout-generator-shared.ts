import type { ApplicationDomainProfile } from '../../generic/domain-profiles.js';
import type { DomainCreationProfile } from '../../generic/domain-creation-profiles.js';
import { SOFTWARE_CREATION_MARKER } from '../../generic/domain-creation-profiles.js';
import type { UiStrategy } from '../ui-strategy-types.js';
import { UI_STRATEGY_MARKER } from '../ui-strategy-types.js';

export interface LayoutBuildContext {
  appName: string;
  profile: ApplicationDomainProfile;
  creation: DomainCreationProfile;
  strategy: UiStrategy;
}

export interface LayoutBuildResult {
  homePage: string;
  layoutCss: string;
  layoutComponents: string[];
}

export function layoutRootAttrs(ctx: LayoutBuildContext, surface: string): string {
  return `className="home-page page-main ui-strategy-layout ${ctx.strategy.layoutPattern}-layout"
      data-page="Home"
      data-layout="main-content"
      data-data-pattern="collection"
      data-domain-layout="${ctx.profile.domainId}"
      data-accessibility="semantic-html"
      ${SOFTWARE_CREATION_MARKER}="home"
      ${UI_STRATEGY_MARKER}="${ctx.strategy.layoutPattern}"
      ${UI_STRATEGY_MARKER}-pattern="${ctx.strategy.layoutPattern}"
      ${UI_STRATEGY_MARKER}-surface="${surface}"`;
}

export function crudImports(includeDashboard = true): string {
  const dashboardImports = includeDashboard
    ? `import { DashboardSummary } from '../components/DashboardSummary';
import { ChartPlaceholder } from '../components/ChartPlaceholder';
import { RecentActivityPanel } from '../components/RecentActivityPanel';
`
    : '';
  return `import { useMemo, useState } from 'react';
import type { Entity, EntityInput } from '../types/entity';
import { useEntityCollection } from '../hooks/useEntityCollection';
import { useDomainMetrics } from '../hooks/useDomainMetrics';
import { NavigationHeader } from '../components/NavigationHeader';
${dashboardImports}import { FilterBar } from '../components/FilterBar';
import { SearchBar } from '../components/SearchBar';
import { Toolbar } from '../components/Toolbar';
import { EntityListView } from '../components/EntityListView';
import { EntityCardView } from '../components/EntityCardView';
import { EntityFormView } from '../components/EntityFormView';
import { EmptyState } from '../components/EmptyState';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
`;
}

export function crudStateBlock(creation: DomainCreationProfile): string {
  return `  const {
    allItems,
    items,
    query,
    setQuery,
    sortKey,
    sortAsc,
    toggleSort,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
  } = useEntityCollection();

  const metrics = useDomainMetrics(allItems);

  const [selected, setSelected] = useState<Entity | null>(null);
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden');
  const [formValues, setFormValues] = useState<Partial<EntityInput>>({ title: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');

  const sortLabel = useMemo(
    () => \`Sort by \${sortKey} (\${sortAsc ? 'asc' : 'desc'})\`,
    [sortKey, sortAsc],
  );

  const visibleItems = useMemo(() => {
${creation.filterLogic.split('\n').map((line: string) => `    ${line}`).join('\n')}
  }, [items, filterCategory]);
`;
}

export function crudHandlers(profile: ApplicationDomainProfile, creation: DomainCreationProfile): string {
  return `  const openCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setFormValues({ title: '', description: '' });
  };

  const openEdit = (item: Entity) => {
    setFormMode('edit');
    setEditingId(item.id);
    setFormValues({ ...item });
    setSelected(item);
  };

  const closeForm = () => {
    setFormMode('hidden');
    setEditingId(null);
  };

  const submitForm = () => {
    if (!formValues.title?.trim()) return;
    if (formMode === 'create') {
      createItem(formValues as EntityInput);
    } else if (editingId) {
      updateItem(editingId, formValues);
    }
    setSuccessMessage(formMode === 'create' ? '${profile.entityLabel} created successfully.' : '${profile.entityLabel} updated successfully.');
    closeForm();
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteItem(confirmDeleteId);
    if (selected?.id === confirmDeleteId) setSelected(null);
    setConfirmDeleteId(null);
    setSuccessMessage('${profile.entityLabel} deleted successfully.');
  };
`;
}

export function crudOverlays(profile: ApplicationDomainProfile, creation: DomainCreationProfile): string {
  return `      {successMessage ? (
        <div className="success-banner" role="status" data-crud-ux="success-feedback">{successMessage}</div>
      ) : null}
      {loading ? <div className="loading-state loading-indicator" aria-live="polite">Loading...</div> : null}
      {error ? <div className="error-state error-panel" role="alert">{error}</div> : null}
      {formMode !== 'hidden' ? (
        <EntityFormView
          values={formValues}
          onChange={(field, value) => setFormValues((prev) => ({ ...prev, [field]: value }))}
          onSubmit={submitForm}
          onCancel={closeForm}
          submitLabel={formMode === 'create' ? '${creation.createActionLabel}' : '${creation.editActionLabel}'}
        />
      ) : null}
      <ConfirmationDialog
        open={confirmDeleteId !== null}
        message="Delete this ${profile.entityLabel.toLowerCase()}?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
`;
}

export function baseLayoutCss(): string {
  return `
.ui-strategy-layout { display: grid; gap: var(--ds-space-md); }
.strategy-toolbar-row { display: flex; flex-wrap: wrap; gap: var(--ds-space-sm); align-items: center; justify-content: space-between; }
.status-chip { display: inline-block; padding: 0.15rem 0.55rem; border-radius: 999px; font-size: 0.75rem; background: var(--ds-color-border); }
.status-chip.confirmed, .status-chip.completed, .status-chip.active { background: #dcfce7; }
.status-chip.pending { background: #fef9c3; }
.status-chip.cancelled, .status-chip.archived { background: #fee2e2; }
.progress-bar-track { height: 8px; background: var(--ds-color-border); border-radius: 999px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #34d399); }
.note-list-item { text-align: left; padding: var(--ds-space-sm); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); cursor: pointer; }
`;
}
