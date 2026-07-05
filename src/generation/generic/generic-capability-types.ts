export const UI_PATTERNS = [
  'List View',
  'Card View',
  'Detail View',
  'Form View',
  'Search Bar',
  'Toolbar',
  'Navigation Header',
  'Empty State',
  'Confirmation Dialog',
  'Status Badge',
  'Loading State',
  'Error State',
] as const;

export type UiPattern = (typeof UI_PATTERNS)[number];

export const DATA_PATTERNS = [
  'Entity',
  'Collection',
  'Category',
  'Tag',
  'Date',
  'Priority',
  'Status',
  'Notes',
  'Amount',
  'Contact Information',
] as const;

export type DataPattern = (typeof DATA_PATTERNS)[number];

export const CRUD_CAPABILITIES = [
  'Create item',
  'View item',
  'Edit item',
  'Delete item',
  'Search/filter',
  'Sort',
] as const;

export type CrudCapability = (typeof CRUD_CAPABILITIES)[number];

export interface GenericApplicationCapabilities {
  uiPatterns: UiPattern[];
  dataPatterns: DataPattern[];
  crudCapabilities: CrudCapability[];
  capabilityScore: number;
}

export const UI_PATTERN_MARKERS: Record<UiPattern, string> = {
  'List View': 'data-ui-pattern="list-view"',
  'Card View': 'data-ui-pattern="card-view"',
  'Detail View': 'data-ui-pattern="detail-view"',
  'Form View': 'data-ui-pattern="form-view"',
  'Search Bar': 'data-ui-pattern="search-bar"',
  Toolbar: 'data-ui-pattern="toolbar"',
  'Navigation Header': 'data-ui-pattern="navigation-header"',
  'Empty State': 'data-ui-pattern="empty-state"',
  'Confirmation Dialog': 'data-ui-pattern="confirmation-dialog"',
  'Status Badge': 'data-ui-pattern="status-badge"',
  'Loading State': 'data-ui-pattern="loading-state"',
  'Error State': 'data-ui-pattern="error-state"',
};

export const DATA_PATTERN_MARKERS: Record<DataPattern, string> = {
  Entity: 'data-data-pattern="entity"',
  Collection: 'data-data-pattern="collection"',
  Category: 'data-data-pattern="category"',
  Tag: 'data-data-pattern="tag"',
  Date: 'data-data-pattern="date"',
  Priority: 'data-data-pattern="priority"',
  Status: 'data-data-pattern="status"',
  Notes: 'data-data-pattern="notes"',
  Amount: 'data-data-pattern="amount"',
  'Contact Information': 'data-data-pattern="contact-information"',
};

export const CRUD_CAPABILITY_MARKERS: Record<CrudCapability, string> = {
  'Create item': 'data-crud-action="create"',
  'View item': 'data-crud-action="view"',
  'Edit item': 'data-crud-action="edit"',
  'Delete item': 'data-crud-action="delete"',
  'Search/filter': 'data-crud-action="search"',
  Sort: 'data-crud-action="sort"',
};
