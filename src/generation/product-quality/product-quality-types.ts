export const DESIGN_COMPONENTS = [
  'Button',
  'Card',
  'Input',
  'Search Bar',
  'Section Header',
  'Dialog',
  'Status Badge',
  'Empty State',
  'Loading Indicator',
] as const;

export type DesignComponent = (typeof DESIGN_COMPONENTS)[number];

export const ACCESSIBILITY_FEATURES = [
  'ARIA labels',
  'Keyboard navigation',
  'Focus indicators',
  'Semantic HTML',
] as const;

export type AccessibilityFeature = (typeof ACCESSIBILITY_FEATURES)[number];

export const CRUD_UX_FEATURES = [
  'Create flow',
  'Edit flow',
  'Delete confirmation',
  'Success feedback',
  'Cancel flow',
] as const;

export type CrudUxFeature = (typeof CRUD_UX_FEATURES)[number];

export const LAYOUT_FEATURES = [
  'Responsive layout',
  'Header',
  'Main content',
  'Empty state',
  'Loading state',
  'Error state',
] as const;

export type LayoutFeature = (typeof LAYOUT_FEATURES)[number];

export interface ProductQualityReport {
  designComponents: DesignComponent[];
  accessibilityFeatures: AccessibilityFeature[];
  crudUxFeatures: CrudUxFeature[];
  layoutFeatures: LayoutFeature[];
  responsiveLayout: boolean;
  qualityScore: number;
}

export const DESIGN_COMPONENT_MARKERS: Record<DesignComponent, string> = {
  Button: 'data-design-component="button"',
  Card: 'data-design-component="card"',
  Input: 'data-design-component="input"',
  'Search Bar': 'data-design-component="search-bar"',
  'Section Header': 'data-design-component="section-header"',
  Dialog: 'data-design-component="dialog"',
  'Status Badge': 'data-design-component="status-badge"',
  'Empty State': 'data-design-component="empty-state"',
  'Loading Indicator': 'data-design-component="loading-indicator"',
};

export const ACCESSIBILITY_MARKERS: Record<AccessibilityFeature, string> = {
  'ARIA labels': 'aria-label',
  'Keyboard navigation': 'keyboard-nav',
  'Focus indicators': 'focus-visible',
  'Semantic HTML': 'semantic-html',
};

export const CRUD_UX_MARKERS: Record<CrudUxFeature, string> = {
  'Create flow': 'data-crud-ux="create"',
  'Edit flow': 'data-crud-ux="edit"',
  'Delete confirmation': 'data-crud-ux="delete-confirm"',
  'Success feedback': 'data-crud-ux="success-feedback"',
  'Cancel flow': 'data-crud-ux="cancel"',
};

export const LAYOUT_MARKERS: Record<LayoutFeature, string> = {
  'Responsive layout': 'data-layout="responsive-page"',
  Header: 'data-layout="header"',
  'Main content': 'data-layout="main-content"',
  'Empty state': 'data-layout="empty-state"',
  'Loading state': 'data-layout="loading-state"',
  'Error state': 'data-layout="error-state"',
};

export const FORM_QUALITY_MARKERS = {
  fieldGroup: 'data-quality-form="field-group"',
  validationHint: 'data-quality-form="validation-hint"',
  disabledSubmit: 'data-quality-form="disabled-submit"',
} as const;

export const LIST_QUALITY_MARKERS = {
  search: 'data-quality-list="search"',
  sort: 'data-quality-list="sort"',
  scrollable: 'data-quality-list="scrollable"',
  selection: 'data-quality-list="selection"',
} as const;
