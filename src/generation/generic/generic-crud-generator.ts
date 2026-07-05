import type { BuildPlan, GeneratedFile, ArchitecturePlan, UnderstandingReport } from '../../types.js';
import {
  buildChartPlaceholder,
  buildDashboardSummary,
  buildDomainMetricsHook,
  buildFilterBar,
  buildRecentActivityPanel,
  domainLayoutCss,
} from './domain-components.js';
import {
  buildEntityInterface,
  buildSeedInitializer,
  SOFTWARE_CREATION_MARKER,
  type DomainCreationProfile,
} from './domain-creation-profiles.js';
import { buildUiLayoutHomePage } from '../ui-strategy/layout-generators/build-ui-layout.js';
import type { UiStrategyReport } from '../ui-strategy/ui-strategy-types.js';
import type { CrudExperiencePlan } from '../plan-crud-experience.js';
import { applyWorkflowToLayout } from '../../workflow/workflow-renderer.js';
import { buildWorkflowReport } from '../../workflow/workflow-report.js';
import type { WorkflowReport } from '../../workflow/workflow-types.js';
import { applyProductExperienceToLayout } from '../../product-experience/product-experience-renderer.js';
import { buildProductExperienceReport } from '../../product-experience/product-experience-report.js';
import type { ProductExperienceReport } from '../../product-experience/product-experience-types.js';
import { applyProductArchitectureToLayout } from '../../product-architecture/product-architecture-renderer.js';
import { buildProductArchitectureReport } from '../../product-architecture/product-architecture-report.js';
import type { ProductArchitectureReport } from '../../product-architecture/product-architecture-types.js';
import {
  baseProjectFiles,
  type ArchitectureGuidedInput,
} from '../architecture-guided-shared.js';
import { productQualityStylesFile, wrapIndexCss } from '../product-quality/design-system.js';

export interface GenericCrudWorkspaceInput {
  understanding: UnderstandingReport;
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
  projectName: string;
  experiencePlan: CrudExperiencePlan;
}

export interface GenericCrudWorkspaceResult {
  files: GeneratedFile[];
  uiStrategy: UiStrategyReport;
  workflowIntelligence: WorkflowReport;
  productExperience: ProductExperienceReport;
  productArchitecture: ProductArchitectureReport;
}

function buildEntityService(entitySlug: string, creation: DomainCreationProfile): string {
  const seedBlock = buildSeedInitializer(creation);
  return `import type { Entity, EntityInput } from '../types/entity';

export class ${entitySlug}Service {
  private items: Entity[] = [
${seedBlock}
  ];

  list(): Entity[] {
    return [...this.items];
  }

  create(input: EntityInput): Entity {
    const entity: Entity = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      category: input.category ?? 'General',
      status: input.status ?? 'active',
      date: input.date ?? new Date().toISOString().slice(0, 10),
      amount: input.amount ?? 0,
      notes: input.notes ?? '',
      recordType: input.recordType,
      quantity: input.quantity,
      stage: input.stage,
      company: input.company,
      sku: input.sku,
      reorderLevel: input.reorderLevel,
      cookingTime: input.cookingTime,
      ingredients: input.ingredients,
      priority: input.priority,
      tags: input.tags ?? [],
    };
    this.items = [entity, ...this.items];
    return entity;
  }

  update(id: string, input: Partial<EntityInput>): Entity | null {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...input, id };
    return this.items[index];
  }

  remove(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < before;
  }
}
`;
}

function buildUseEntityCollection(): string {
  return `import { useMemo, useState } from 'react';
import type { Entity, EntityInput } from '../types/entity';
import { EntityService } from '../services/EntityService';

const service = new EntityService();

export function useEntityCollection() {
  const [items, setItems] = useState<Entity[]>(() => service.list());
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof Entity>('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => setItems(service.list());

  const createItem = (input: EntityInput) => {
    setLoading(true);
    setError(null);
    try {
      service.create(input);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (id: string, input: Partial<EntityInput>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = service.update(id, input);
      if (!updated) setError('Item not found');
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = (id: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!service.remove(id)) setError('Item not found');
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let result = items;

    if (normalized) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(normalized),
        ),
      );
    }

    result = [...result].sort((a, b) => {
      const left = String(a[sortKey] ?? '');
      const right = String(b[sortKey] ?? '');
      const cmp = left.localeCompare(right);
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [items, query, sortKey, sortAsc]);

  const toggleSort = (key: keyof Entity) => {
    if (sortKey === key) {
      setSortAsc((value) => !value);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return {
    allItems: items,
    items: filteredItems,
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
  };
}
`;
}

function listFieldSnippet(field: string): string {
  const snippets: Record<string, string> = {
    recordType: '              {item.recordType ? <span className="list-meta">{item.recordType}</span> : null}',
    amount: '              {typeof item.amount === "number" ? <span className="list-meta">{item.amount.toFixed(2)}</span> : null}',
    category: '              {item.category ? <span className="list-meta">{item.category}</span> : null}',
    date: '              {item.date ? <span className="list-meta">{item.date}</span> : null}',
    status: '              <StatusBadge label={item.status} />',
    company: '              {item.company ? <span className="list-meta">{item.company}</span> : null}',
    stage: '              {item.stage ? <span className="list-meta">{item.stage}</span> : null}',
    sku: '              {item.sku ? <span className="list-meta">{item.sku}</span> : null}',
    quantity: '              {typeof item.quantity === "number" ? <span className="list-meta">Qty: {item.quantity}</span> : null}',
    cookingTime: '              {item.cookingTime ? <span className="list-meta">{item.cookingTime}</span> : null}',
    ingredients: '              {item.ingredients ? <span className="list-meta">{item.ingredients}</span> : null}',
    priority: '              {item.priority ? <span className="list-meta">{item.priority}</span> : null}',
    notes: '              {item.notes ? <span className="list-meta">{item.notes}</span> : null}',
    reorderLevel: '              {typeof item.reorderLevel === "number" ? <span className="list-meta">Reorder: {item.reorderLevel}</span> : null}',
  };
  return snippets[field] ?? '';
}

function cardFieldSnippet(field: string): string {
  const labels: Record<string, string> = {
    recordType: 'Type',
    amount: 'Amount',
    category: 'Category',
    date: 'Date',
    status: 'Status',
    company: 'Company',
    stage: 'Stage',
    sku: 'SKU',
    quantity: 'Quantity',
    cookingTime: 'Cooking time',
    ingredients: 'Ingredients',
    priority: 'Priority',
    notes: 'Notes',
    reorderLevel: 'Reorder level',
    tags: 'Tags',
  };
  const label = labels[field] ?? field;
  if (field === 'tags') {
    return `        <p><strong>${label}:</strong> {(item.tags ?? []).join(', ')}</p>`;
  }
  if (field === 'amount') {
    return `        {typeof item.amount === 'number' ? <p><strong>${label}:</strong> {item.amount.toFixed(2)}</p> : null}`;
  }
  if (field === 'quantity' || field === 'reorderLevel') {
    return `        {typeof item.${field} === 'number' ? <p><strong>${label}:</strong> {item.${field}}</p> : null}`;
  }
  return `        {item.${field} ? <p><strong>${label}:</strong> {item.${field}}</p> : null}`;
}

function buildNavigationHeader(appName: string): string {
  return `interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
}

export function NavigationHeader({ title, subtitle }: NavigationHeaderProps) {
  return (
    <header className="page-header section-header" data-layout="header" data-design-component="section-header" data-accessibility="semantic-html">
      <h1>{title}</h1>
      {subtitle ? <p className="nav-subtitle">{subtitle}</p> : null}
      <p className="app-label">${appName}</p>
    </header>
  );
}
`;
}

function buildSearchBar(): string {
  return `interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search and filter items...' }: SearchBarProps) {
  return (
    <div className="search-bar" data-ui-pattern="search-bar" data-design-component="search-bar" data-quality-list="search" data-crud-action="search">
      <label className="field-group" data-quality-form="field-group">
        <span className="field-label">Search</span>
        <input
          className="ds-input"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search and filter items"
          data-design-component="input"
          data-accessibility="keyboard-nav focus-visible"
        />
        <span className="field-hint" data-quality-form="validation-hint">Type to filter the list instantly.</span>
      </label>
    </div>
  );
}
`;
}

function buildToolbar(creation: DomainCreationProfile): string {
  return `interface ToolbarProps {
  onCreate: () => void;
  onSort: () => void;
  sortLabel: string;
}

export function Toolbar({ onCreate, onSort, sortLabel }: ToolbarProps) {
  return (
    <div className="toolbar" data-ui-pattern="toolbar" role="toolbar" data-accessibility="keyboard-nav">
      <button type="button" className="ds-button" onClick={onCreate} data-design-component="button" data-crud-action="create" data-crud-ux="create" data-accessibility="focus-visible" ${SOFTWARE_CREATION_MARKER}="create-action">
        ${creation.createActionLabel}
      </button>
      <button type="button" className="ds-button secondary" onClick={onSort} data-design-component="button" data-crud-action="sort" data-quality-list="sort" data-accessibility="focus-visible">
        {sortLabel}
      </button>
    </div>
  );
}
`;
}

function buildStatusBadge(): string {
  return `interface StatusBadgeProps {
  label: string;
}

export function StatusBadge({ label }: StatusBadgeProps) {
  return (
    <span className="status-badge ds-card" data-ui-pattern="status-badge" data-design-component="status-badge" data-data-pattern="status">
      {label}
    </span>
  );
}
`;
}

function buildEmptyState(): string {
  return `interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <section className="empty-state empty-state-panel ds-card" data-ui-pattern="empty-state" data-design-component="empty-state" data-layout="empty-state" data-data-pattern="collection" data-accessibility="semantic-html">
      <p>{message}</p>
    </section>
  );
}
`;
}

function buildConfirmationDialog(creation: DomainCreationProfile): string {
  return `interface ConfirmationDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({ open, message, onConfirm, onCancel }: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" data-ui-pattern="confirmation-dialog" data-design-component="dialog" data-crud-ux="delete-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="dialog-panel ds-card">
        <h2 id="confirm-dialog-title">Confirm action</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button type="button" className="ds-button secondary" onClick={onCancel} data-design-component="button" data-crud-ux="cancel" data-accessibility="focus-visible">Cancel</button>
          <button type="button" className="ds-button danger" onClick={onConfirm} data-design-component="button" data-crud-action="delete" data-crud-ux="delete-confirm" data-accessibility="focus-visible" ${SOFTWARE_CREATION_MARKER}="delete-action">
            ${creation.deleteActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
`;
}

function buildEntityListView(creation: DomainCreationProfile): string {
  const extraLines = creation.listExtraDisplay
    .map((field) => listFieldSnippet(field))
    .filter(Boolean)
    .join('\n');
  const needsStatusBadge = creation.listExtraDisplay.includes('status');

  return `import type { Entity } from '../types/entity';
${needsStatusBadge ? "import { StatusBadge } from './StatusBadge';\n" : ''}
interface EntityListViewProps {
  items: Entity[];
  selectedId: string | null;
  onSelect: (item: Entity) => void;
  onEdit: (item: Entity) => void;
}

export function EntityListView({ items, selectedId, onSelect, onEdit }: EntityListViewProps) {
  return (
    <ul className="entity-list scroll-panel" data-ui-pattern="list-view" data-design-component="card" data-data-pattern="collection" data-crud-action="view" data-quality-list="scrollable" data-accessibility="keyboard-nav" ${SOFTWARE_CREATION_MARKER}="entity-list">
      {items.map((item) => (
        <li key={item.id} className={selectedId === item.id ? 'selected list-item-selected' : ''} data-quality-list="selection" aria-selected={selectedId === item.id}>
          <button type="button" className="list-item-button ds-button secondary" onClick={() => onSelect(item)} data-design-component="button" data-accessibility="focus-visible">
            <strong>{item.title}</strong>
            <span>{item.description}</span>
            <div className="list-meta-row">
${extraLines}
            </div>
          </button>
          <button type="button" className="edit-link ds-button secondary" onClick={() => onEdit(item)} data-design-component="button" data-crud-action="edit" data-crud-ux="edit" data-accessibility="focus-visible" ${SOFTWARE_CREATION_MARKER}="edit-action">
            ${creation.editActionLabel}
          </button>
        </li>
      ))}
    </ul>
  );
}
`;
}

function buildEntityCardView(creation: DomainCreationProfile): string {
  const extraFields = creation.cardExtraDisplay.map((field) => cardFieldSnippet(field));

  return `import type { Entity } from '../types/entity';

interface EntityCardViewProps {
  item: Entity | null;
}

export function EntityCardView({ item }: EntityCardViewProps) {
  if (!item) {
    return (
      <div className="entity-card empty-card ds-card" data-ui-pattern="card-view" data-design-component="card" data-data-pattern="entity">
        <p>Select an item to view details.</p>
      </div>
    );
  }

  return (
    <article className="entity-card ds-card" data-ui-pattern="card-view" data-design-component="card" data-data-pattern="entity" data-crud-action="view" data-accessibility="semantic-html">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
${extraFields.join('\n')}
    </article>
  );
}
`;
}

function buildEntityFormView(creation: DomainCreationProfile): string {
  const domainFields = creation.formExtraFields.join('\n');
  const hasGenericTitle = !creation.formExtraFields.some((block) => block.includes("onChange('title'"));

  return `import type { EntityInput } from '../types/entity';

interface EntityFormViewProps {
  values: Partial<EntityInput>;
  onChange: (field: keyof EntityInput, value: unknown) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

export function EntityFormView({ values, onChange, onSubmit, onCancel, submitLabel }: EntityFormViewProps) {
  const canSubmit = Boolean(values.title?.trim());

  return (
    <form
      className="entity-form ds-card"
      data-ui-pattern="form-view"
      data-design-component="input"
      data-data-pattern="entity"
      data-crud-action="create"
      data-quality-form="field-group"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <fieldset className="field-group" data-quality-form="field-group" ${SOFTWARE_CREATION_MARKER}="domain-form">
        <legend>{submitLabel}</legend>
${hasGenericTitle ? `        <label>
          ${creation.titleFieldLabel}
          <input className="ds-input" value={values.title ?? ''} onChange={(e) => onChange('title', e.target.value)} required aria-label="${creation.titleFieldLabel}" data-design-component="input" data-accessibility="focus-visible" />
        </label>
        <label>
          ${creation.descriptionFieldLabel}
          <textarea className="ds-textarea" value={values.description ?? ''} onChange={(e) => onChange('description', e.target.value)} aria-label="${creation.descriptionFieldLabel}" data-design-component="input" data-accessibility="aria-label" />
        </label>` : ''}
${domainFields}
      </fieldset>
      <div className="form-actions">
        <button type="button" className="ds-button secondary" onClick={onCancel} data-design-component="button" data-crud-ux="cancel" data-accessibility="focus-visible">Cancel</button>
        <button type="submit" className="ds-button" disabled={!canSubmit} data-design-component="button" data-quality-form="disabled-submit" data-accessibility="focus-visible">{submitLabel}</button>
      </div>
    </form>
  );
}
`;
}

function buildAppComponent(buildPlan: BuildPlan, description: string): string {
  return `import Home from './pages/Home';

const APP_NAME = ${JSON.stringify(buildPlan.appName)};
const DESCRIPTION = ${JSON.stringify(description)};

export default function App() {
  return (
    <div className="page-layout app" data-layout="responsive-page">
      <Home />
    </div>
  );
}
`;
}

function buildIndexCss(layoutCss = ''): string {
  return wrapIndexCss(`.app {
  width: min(1120px, 96vw);
  margin: 0 auto;
  padding: var(--ds-space-lg);
}

.nav-subtitle { color: var(--ds-color-text-muted); margin: 0.25rem 0; }
.app-label { font-size: 0.85rem; color: var(--ds-color-text-muted); }

.search-bar { margin-bottom: var(--ds-space-md); }

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-sm);
  margin-bottom: var(--ds-space-md);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ds-space-md);
}

.entity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.entity-list li {
  display: flex;
  gap: var(--ds-space-sm);
  align-items: center;
  margin-bottom: var(--ds-space-sm);
}

.list-item-button {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-xs);
}

.edit-link { font-size: 0.85rem; }

.entity-form {
  margin-bottom: var(--ds-space-md);
}

.form-actions, .detail-actions, .dialog-actions {
  display: flex;
  gap: var(--ds-space-sm);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  z-index: 100;
}

.dialog-panel h2 {
  margin: 0 0 var(--ds-space-sm);
  font-size: 1.1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}
${domainLayoutCss()}
${layoutCss}
`);
}

export function buildGenericCrudWorkspace(input: GenericCrudWorkspaceInput): GenericCrudWorkspaceResult {
  const { understanding, buildPlan, architecturePlan, projectName, experiencePlan } = input;
  const guidedInput: ArchitectureGuidedInput = {
    buildPlan,
    architecturePlan,
    projectName,
  };

  const {
    domainProfile,
    creationProfile,
    uiStrategySelection,
    workflowModel,
    productExperienceModel,
    productArchitectureModel,
  } = experiencePlan;

  let layoutResult = buildUiLayoutHomePage({
    appName: buildPlan.appName,
    profile: domainProfile,
    creation: creationProfile,
    strategy: uiStrategySelection.strategy,
  });

  layoutResult = applyWorkflowToLayout(layoutResult, workflowModel, creationProfile);
  layoutResult = applyProductExperienceToLayout(layoutResult, productExperienceModel, creationProfile);
  layoutResult = applyProductArchitectureToLayout(layoutResult, productArchitectureModel);

  const uiStrategy: UiStrategyReport = {
    ...uiStrategySelection.report,
    generatedLayoutComponents: layoutResult.layoutComponents,
  };

  const files: GeneratedFile[] = [
    ...baseProjectFiles(guidedInput),
    productQualityStylesFile(),
    { relativePath: 'src/types/entity.ts', content: buildEntityInterface(creationProfile) },
    {
      relativePath: 'src/services/EntityService.ts',
      content: buildEntityService('Entity', creationProfile),
    },
    { relativePath: 'src/hooks/useEntityCollection.ts', content: buildUseEntityCollection() },
    { relativePath: 'src/hooks/useDomainMetrics.ts', content: buildDomainMetricsHook(creationProfile) },
    { relativePath: 'src/components/NavigationHeader.tsx', content: buildNavigationHeader(buildPlan.appName) },
    {
      relativePath: 'src/components/DashboardSummary.tsx',
      content: buildDashboardSummary(domainProfile, creationProfile),
    },
    {
      relativePath: 'src/components/ChartPlaceholder.tsx',
      content: buildChartPlaceholder(domainProfile, creationProfile),
    },
    {
      relativePath: 'src/components/RecentActivityPanel.tsx',
      content: buildRecentActivityPanel(domainProfile, domainProfile.entityLabel),
    },
    {
      relativePath: 'src/components/FilterBar.tsx',
      content: buildFilterBar(creationProfile, domainProfile.entityLabelPlural),
    },
    { relativePath: 'src/components/SearchBar.tsx', content: buildSearchBar() },
    { relativePath: 'src/components/Toolbar.tsx', content: buildToolbar(creationProfile) },
    { relativePath: 'src/components/StatusBadge.tsx', content: buildStatusBadge() },
    { relativePath: 'src/components/EmptyState.tsx', content: buildEmptyState() },
    {
      relativePath: 'src/components/ConfirmationDialog.tsx',
      content: buildConfirmationDialog(creationProfile),
    },
    { relativePath: 'src/components/EntityListView.tsx', content: buildEntityListView(creationProfile) },
    { relativePath: 'src/components/EntityCardView.tsx', content: buildEntityCardView(creationProfile) },
    { relativePath: 'src/components/EntityFormView.tsx', content: buildEntityFormView(creationProfile) },
    {
      relativePath: 'src/pages/Home.tsx',
      content: layoutResult.homePage,
    },
    {
      relativePath: 'src/App.tsx',
      content: buildAppComponent(buildPlan, understanding.detectedIntent),
    },
    { relativePath: 'src/index.css', content: buildIndexCss(layoutResult.layoutCss) },
  ];

  return {
    files,
    uiStrategy,
    workflowIntelligence: buildWorkflowReport(workflowModel),
    productExperience: buildProductExperienceReport(productExperienceModel),
    productArchitecture: buildProductArchitectureReport(productArchitectureModel),
  };
}
