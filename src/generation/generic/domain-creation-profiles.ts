import type { ApplicationDomainProfile } from './domain-profiles.js';
import { inferApplicationDomain } from './domain-profiles.js';
import type { BuildPlan, UnderstandingReport } from '../../types.js';

export interface DomainSeedRecord {
  title: string;
  description?: string;
  category?: string;
  status?: string;
  date?: string;
  amount?: number;
  notes?: string;
  recordType?: string;
  quantity?: number;
  stage?: string;
  company?: string;
  sku?: string;
  reorderLevel?: number;
  cookingTime?: string;
  ingredients?: string;
  priority?: string;
  tags?: string[];
}

export interface DomainCreationProfile {
  domainId: string;
  createActionLabel: string;
  editActionLabel: string;
  deleteActionLabel: string;
  filterOptions: readonly string[];
  filterLogic: string;
  chartSegments: readonly { label: string; value: number }[];
  seedData: readonly DomainSeedRecord[];
  entityExtraFields: readonly string[];
  formExtraFields: readonly string[];
  listExtraDisplay: readonly string[];
  cardExtraDisplay: readonly string[];
  metricsComputation: string;
  titleFieldLabel: string;
  descriptionFieldLabel: string;
}

const BASE_ENTITY_FIELDS = [
  '  id: string;',
  '  title: string;',
  '  description: string;',
  '  category: string;',
  "  status: 'active' | 'completed' | 'archived' | 'pending' | 'confirmed' | 'cancelled';",
  '  date: string;',
  '  amount: number;',
  '  notes: string;',
  '  recordType?: string;',
  '  quantity?: number;',
  '  stage?: string;',
  '  company?: string;',
  '  sku?: string;',
  '  reorderLevel?: number;',
  '  cookingTime?: string;',
  '  ingredients?: string;',
  "  priority?: 'low' | 'medium' | 'high';",
  '  tags?: string[];',
];

const COMMON_FORM_FIELDS = `      <label>
        Category
        <select className="ds-input" value={values.category ?? 'General'} onChange={(e) => onChange('category', e.target.value)} data-data-pattern="category">
          <option value="General">General</option>
          <option value="Priority">Priority</option>
          <option value="Archived">Archived</option>
        </select>
      </label>
      <label>
        Status
        <select className="ds-input" value={values.status ?? 'active'} onChange={(e) => onChange('status', e.target.value)} data-data-pattern="status">
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label>
        Date
        <input className="ds-input" type="date" value={values.date ?? ''} onChange={(e) => onChange('date', e.target.value)} data-data-pattern="date" />
      </label>
      <label>
        Amount / Value
        <input className="ds-input" type="number" step="0.01" value={values.amount ?? 0} onChange={(e) => onChange('amount', Number(e.target.value))} data-data-pattern="amount" />
      </label>
      <label>
        Notes
        <textarea className="ds-textarea" value={values.notes ?? ''} onChange={(e) => onChange('notes', e.target.value)} data-data-pattern="notes" />
      </label>`;

function expenseFormFields(): string {
  return `      <label>
        Type
        <select className="ds-input" value={values.recordType ?? 'expense'} onChange={(e) => onChange('recordType', e.target.value)} data-domain-field="record-type">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>
      <label>
        Description
        <input className="ds-input" value={values.title ?? ''} onChange={(e) => onChange('title', e.target.value)} required aria-label="Transaction description" />
      </label>
      <label>
        Amount
        <input className="ds-input" type="number" step="0.01" value={values.amount ?? 0} onChange={(e) => onChange('amount', Number(e.target.value))} data-data-pattern="amount" />
      </label>
      <label>
        Category
        <select className="ds-input" value={values.category ?? 'Food'} onChange={(e) => onChange('category', e.target.value)}>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Bills">Bills</option>
          <option value="Income">Income</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label>
        Date
        <input className="ds-input" type="date" value={values.date ?? ''} onChange={(e) => onChange('date', e.target.value)} />
      </label>`;
}

function crmFormFields(): string {
  return `      <label>
        Customer name
        <input className="ds-input" value={values.title ?? ''} onChange={(e) => onChange('title', e.target.value)} required aria-label="Customer name" />
      </label>
      <label>
        Company
        <input className="ds-input" value={values.company ?? ''} onChange={(e) => onChange('company', e.target.value)} data-domain-field="company" />
      </label>
      <label>
        Stage
        <select className="ds-input" value={values.stage ?? 'Lead'} onChange={(e) => onChange('stage', e.target.value)} data-domain-field="stage">
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </label>
      <label>
        Deal value
        <input className="ds-input" type="number" step="0.01" value={values.amount ?? 0} onChange={(e) => onChange('amount', Number(e.target.value))} />
      </label>
      <label>
        Last contact
        <input className="ds-input" type="date" value={values.date ?? ''} onChange={(e) => onChange('date', e.target.value)} />
      </label>
      <label>
        Notes
        <textarea className="ds-textarea" value={values.notes ?? ''} onChange={(e) => onChange('notes', e.target.value)} />
      </label>`;
}

function bookingFormFields(): string {
  return `      <label>
        Customer name
        <input className="ds-input" value={values.title ?? ''} onChange={(e) => onChange('title', e.target.value)} required />
      </label>
      <label>
        Service / type
        <input className="ds-input" value={values.category ?? ''} onChange={(e) => onChange('category', e.target.value)} />
      </label>
      <label>
        Date
        <input className="ds-input" type="date" value={values.date ?? ''} onChange={(e) => onChange('date', e.target.value)} />
      </label>
      <label>
        Time
        <input className="ds-input" value={values.notes ?? ''} onChange={(e) => onChange('notes', e.target.value)} placeholder="e.g. 10:30 AM" />
      </label>
      <label>
        Status
        <select className="ds-input" value={values.status ?? 'pending'} onChange={(e) => onChange('status', e.target.value)}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>`;
}

function recipeFormFields(): string {
  return `      <label>
        Recipe name
        <input className="ds-input" value={values.title ?? ''} onChange={(e) => onChange('title', e.target.value)} required />
      </label>
      <label>
        Category
        <select className="ds-input" value={values.category ?? 'Dinner'} onChange={(e) => onChange('category', e.target.value)}>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Dessert">Dessert</option>
        </select>
      </label>
      <label>
        Ingredients
        <textarea className="ds-textarea" value={values.ingredients ?? ''} onChange={(e) => onChange('ingredients', e.target.value)} data-domain-field="ingredients" />
      </label>
      <label>
        Cooking time
        <input className="ds-input" value={values.cookingTime ?? ''} onChange={(e) => onChange('cookingTime', e.target.value)} data-domain-field="cooking-time" placeholder="e.g. 45 min" />
      </label>
      <label>
        Difficulty
        <select className="ds-input" value={values.priority ?? 'medium'} onChange={(e) => onChange('priority', e.target.value)}>
          <option value="low">Easy</option>
          <option value="medium">Medium</option>
          <option value="high">Hard</option>
        </select>
      </label>`;
}

function inventoryFormFields(): string {
  return `      <label>
        Product name
        <input className="ds-input" value={values.title ?? ''} onChange={(e) => onChange('title', e.target.value)} required />
      </label>
      <label>
        SKU
        <input className="ds-input" value={values.sku ?? ''} onChange={(e) => onChange('sku', e.target.value)} data-domain-field="sku" />
      </label>
      <label>
        Category
        <input className="ds-input" value={values.category ?? ''} onChange={(e) => onChange('category', e.target.value)} />
      </label>
      <label>
        Stock quantity
        <input className="ds-input" type="number" value={values.quantity ?? 0} onChange={(e) => onChange('quantity', Number(e.target.value))} data-domain-field="quantity" />
      </label>
      <label>
        Reorder level
        <input className="ds-input" type="number" value={values.reorderLevel ?? 0} onChange={(e) => onChange('reorderLevel', Number(e.target.value))} data-domain-field="reorder-level" />
      </label>
      <label>
        Unit price
        <input className="ds-input" type="number" step="0.01" value={values.amount ?? 0} onChange={(e) => onChange('amount', Number(e.target.value))} />
      </label>`;
}

const CREATION_PROFILES: Record<string, DomainCreationProfile> = {
  'expense-tracker': {
    domainId: 'expense-tracker',
    createActionLabel: 'Add transaction',
    editActionLabel: 'Edit transaction',
    deleteActionLabel: 'Delete transaction',
    filterOptions: ['All', 'Income', 'Expense', 'Food', 'Transport', 'Bills'],
    filterLogic: `if (filterCategory === 'All') return items;
    if (filterCategory === 'Income' || filterCategory === 'Expense') {
      return items.filter((item) => item.recordType === filterCategory.toLowerCase());
    }
    return items.filter((item) => item.category === filterCategory);`,
    chartSegments: [
      { label: 'Food', value: 35 },
      { label: 'Transport', value: 20 },
      { label: 'Bills', value: 25 },
      { label: 'Other', value: 20 },
    ],
    seedData: [
      { title: 'Salary deposit', description: 'Monthly salary', category: 'Income', recordType: 'income', amount: 5200, date: '2026-07-01', status: 'confirmed', notes: 'Payroll' },
      { title: 'Freelance payment', description: 'Design project', category: 'Income', recordType: 'income', amount: 850, date: '2026-07-03', status: 'confirmed', notes: 'Client invoice' },
      { title: 'Grocery shopping', description: 'Weekly groceries', category: 'Food', recordType: 'expense', amount: 86.4, date: '2026-07-02', status: 'active', notes: 'Supermarket' },
      { title: 'Metro pass', description: 'Monthly transit', category: 'Transport', recordType: 'expense', amount: 45, date: '2026-07-01', status: 'active', notes: 'Commute' },
      { title: 'Electric bill', description: 'Utilities', category: 'Bills', recordType: 'expense', amount: 112.5, date: '2026-06-28', status: 'active', notes: 'Paid' },
    ],
    entityExtraFields: [],
    formExtraFields: [expenseFormFields()],
    listExtraDisplay: ['recordType', 'amount', 'category', 'date'],
    cardExtraDisplay: ['recordType', 'amount', 'category', 'date', 'notes'],
    titleFieldLabel: 'Description',
    descriptionFieldLabel: 'Details',
    metricsComputation: `const income = items.filter((i) => i.recordType === 'income').reduce((s, i) => s + (i.amount ?? 0), 0);
    const expenses = items.filter((i) => i.recordType === 'expense').reduce((s, i) => s + (i.amount ?? 0), 0);
    const balance = income - expenses;
    const topCategory = items.filter((i) => i.recordType === 'expense').reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + (i.amount ?? 0);
      return acc;
    }, {});
    const biggest = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    return [
      income.toFixed(2),
      expenses.toFixed(2),
      balance.toFixed(2),
      biggest,
    ];`,
  },
  crm: {
    domainId: 'crm',
    createActionLabel: 'Add customer',
    editActionLabel: 'Edit customer',
    deleteActionLabel: 'Delete customer',
    filterOptions: ['All', 'Lead', 'Active', 'Won', 'Lost'],
    filterLogic: `if (filterCategory === 'All') return items;
    return items.filter((item) => item.stage === filterCategory);`,
    chartSegments: [
      { label: 'Lead', value: 30 },
      { label: 'Active', value: 40 },
      { label: 'Won', value: 20 },
      { label: 'Lost', value: 10 },
    ],
    seedData: [
      { title: 'Sarah Chen', description: 'Enterprise prospect', company: 'Acme Corp', stage: 'Active', amount: 12000, date: '2026-07-04', status: 'active', notes: 'Follow up Friday' },
      { title: 'Marcus Lee', description: 'Inbound lead', company: 'Beta LLC', stage: 'Lead', amount: 4500, date: '2026-07-03', status: 'pending', notes: 'Demo scheduled' },
      { title: 'Elena Rossi', description: 'Renewal discussion', company: 'Northwind', stage: 'Won', amount: 8900, date: '2026-06-30', status: 'completed', notes: 'Signed contract' },
      { title: 'James Ortiz', description: 'Lost to competitor', company: 'Globex', stage: 'Lost', amount: 3200, date: '2026-06-25', status: 'archived', notes: 'Price sensitive' },
    ],
    entityExtraFields: [],
    formExtraFields: [crmFormFields()],
    listExtraDisplay: ['company', 'stage', 'amount', 'date'],
    cardExtraDisplay: ['company', 'stage', 'amount', 'date', 'notes'],
    titleFieldLabel: 'Customer name',
    descriptionFieldLabel: 'Summary',
    metricsComputation: `const customers = items.length;
    const activeDeals = items.filter((i) => i.stage === 'Active' || i.stage === 'Lead').length;
    const pipelineValue = items.filter((i) => i.stage !== 'Lost').reduce((s, i) => s + (i.amount ?? 0), 0);
    const followUps = items.filter((i) => i.status === 'pending').length;
    return [String(customers), String(activeDeals), pipelineValue.toFixed(0), String(followUps)];`,
  },
  'booking-system': {
    domainId: 'booking-system',
    createActionLabel: 'Create booking',
    editActionLabel: 'Edit booking',
    deleteActionLabel: 'Delete booking',
    filterOptions: ['All', 'Confirmed', 'Pending', 'Cancelled'],
    filterLogic: `if (filterCategory === 'All') return items;
    return items.filter((item) => item.status === filterCategory.toLowerCase());`,
    chartSegments: [
      { label: 'Confirmed', value: 55 },
      { label: 'Pending', value: 30 },
      { label: 'Cancelled', value: 15 },
    ],
    seedData: [
      { title: 'Alex Morgan', description: 'Consultation session', category: 'Consultation', date: '2026-07-05', status: 'confirmed', notes: '10:30 AM' },
      { title: 'Jamie Park', description: 'Studio rental', category: 'Studio', date: '2026-07-05', status: 'confirmed', notes: '2:00 PM' },
      { title: 'Taylor Brooks', description: 'Intro call', category: 'Call', date: '2026-07-06', status: 'pending', notes: '9:00 AM' },
      { title: 'Riley Stone', description: 'Workshop seat', category: 'Workshop', date: '2026-07-08', status: 'pending', notes: '11:00 AM' },
    ],
    entityExtraFields: [],
    formExtraFields: [bookingFormFields()],
    listExtraDisplay: ['category', 'date', 'status', 'notes'],
    cardExtraDisplay: ['category', 'date', 'status', 'notes'],
    titleFieldLabel: 'Customer name',
    descriptionFieldLabel: 'Booking details',
    metricsComputation: `const today = new Date().toISOString().slice(0, 10);
    const total = items.length;
    const todayCount = items.filter((i) => i.date === today).length;
    const confirmed = items.filter((i) => i.status === 'confirmed').length;
    const upcoming = items.filter((i) => i.date >= today && i.status !== 'cancelled').length;
    return [String(total), String(todayCount), String(Math.max(0, 8 - todayCount)), String(upcoming)];`,
  },
  'recipe-manager': {
    domainId: 'recipe-manager',
    createActionLabel: 'Add recipe',
    editActionLabel: 'Edit recipe',
    deleteActionLabel: 'Delete recipe',
    filterOptions: ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'],
    filterLogic: `if (filterCategory === 'All') return items;
    return items.filter((item) => item.category === filterCategory);`,
    chartSegments: [
      { label: 'Breakfast', value: 25 },
      { label: 'Lunch', value: 30 },
      { label: 'Dinner', value: 35 },
      { label: 'Dessert', value: 10 },
    ],
    seedData: [
      { title: 'Avocado toast', description: 'Quick breakfast favorite', category: 'Breakfast', cookingTime: '10 min', ingredients: 'Bread, avocado, lemon, salt', status: 'active', date: '2026-07-01', priority: 'low' },
      { title: 'Chicken stir fry', description: 'Weeknight dinner', category: 'Dinner', cookingTime: '25 min', ingredients: 'Chicken, peppers, soy sauce, rice', status: 'active', date: '2026-07-02', priority: 'medium' },
      { title: 'Berry parfait', description: 'Light dessert', category: 'Dessert', cookingTime: '15 min', ingredients: 'Yogurt, berries, granola', status: 'active', date: '2026-07-03', priority: 'low' },
    ],
    entityExtraFields: [],
    formExtraFields: [recipeFormFields()],
    listExtraDisplay: ['category', 'cookingTime', 'ingredients'],
    cardExtraDisplay: ['category', 'cookingTime', 'ingredients', 'priority'],
    titleFieldLabel: 'Recipe name',
    descriptionFieldLabel: 'Summary',
    metricsComputation: `const recipes = items.length;
    const categories = new Set(items.map((i) => i.category)).size;
    const favorites = items.filter((i) => i.priority === 'low').length;
    return [String(recipes), String(categories), String(favorites), String(recipes)];`,
  },
  'inventory-system': {
    domainId: 'inventory-system',
    createActionLabel: 'Add product',
    editActionLabel: 'Edit product',
    deleteActionLabel: 'Delete product',
    filterOptions: ['All', 'In Stock', 'Low Stock', 'Out of Stock'],
    filterLogic: `if (filterCategory === 'All') return items;
    if (filterCategory === 'In Stock') return items.filter((i) => (i.quantity ?? 0) > (i.reorderLevel ?? 0));
    if (filterCategory === 'Low Stock') return items.filter((i) => (i.quantity ?? 0) > 0 && (i.quantity ?? 0) <= (i.reorderLevel ?? 0));
    return items.filter((i) => (i.quantity ?? 0) === 0);`,
    chartSegments: [
      { label: 'Electronics', value: 40 },
      { label: 'Office', value: 25 },
      { label: 'Supplies', value: 35 },
    ],
    seedData: [
      { title: 'Wireless mouse', description: 'Ergonomic mouse', category: 'Electronics', sku: 'WM-001', quantity: 45, reorderLevel: 10, amount: 24.99, status: 'active', date: '2026-07-01' },
      { title: 'Notebook pack', description: 'A5 ruled notebooks', category: 'Office', sku: 'NB-220', quantity: 8, reorderLevel: 15, amount: 12.5, status: 'active', date: '2026-07-02' },
      { title: 'Printer toner', description: 'Black toner cartridge', category: 'Supplies', sku: 'TN-880', quantity: 3, reorderLevel: 5, amount: 49.99, status: 'pending', date: '2026-07-03' },
      { title: 'USB-C hub', description: '7-port hub', category: 'Electronics', sku: 'HB-107', quantity: 0, reorderLevel: 5, amount: 34.99, status: 'archived', date: '2026-06-20' },
    ],
    entityExtraFields: [],
    formExtraFields: [inventoryFormFields()],
    listExtraDisplay: ['sku', 'quantity', 'category', 'amount'],
    cardExtraDisplay: ['sku', 'quantity', 'reorderLevel', 'category', 'amount'],
    titleFieldLabel: 'Product name',
    descriptionFieldLabel: 'Description',
    metricsComputation: `const products = items.length;
    const lowStock = items.filter((i) => (i.quantity ?? 0) <= (i.reorderLevel ?? 0) && (i.quantity ?? 0) > 0).length;
    const stockValue = items.reduce((s, i) => s + (i.quantity ?? 0) * (i.amount ?? 0), 0);
    const categories = new Set(items.map((i) => i.category)).size;
    return [String(products), String(lowStock), stockValue.toFixed(0), String(categories)];`,
  },
  'habit-tracker': {
    domainId: 'habit-tracker',
    createActionLabel: 'Add habit',
    editActionLabel: 'Edit habit',
    deleteActionLabel: 'Delete habit',
    filterOptions: ['All', 'Completed', 'Pending', 'Archived'],
    filterLogic: `if (filterCategory === 'All') return items;
    if (filterCategory === 'Completed') return items.filter((i) => i.status === 'completed');
    if (filterCategory === 'Pending') return items.filter((i) => i.status === 'pending' || i.status === 'active');
    return items.filter((i) => i.status === 'archived');`,
    chartSegments: [
      { label: 'Mon', value: 80 },
      { label: 'Tue', value: 65 },
      { label: 'Wed', value: 90 },
      { label: 'Thu', value: 70 },
    ],
    seedData: [
      { title: 'Morning pages', description: '10 minutes journaling', category: 'Wellness', status: 'completed', date: '2026-07-05', notes: 'Done today' },
      { title: 'Drink water', description: '8 glasses daily', category: 'Health', status: 'completed', date: '2026-07-05', notes: '6/8 so far' },
      { title: 'Read 20 pages', description: 'Evening reading', category: 'Learning', status: 'pending', date: '2026-07-05', notes: 'Scheduled tonight' },
      { title: 'Evening walk', description: '30 minute walk', category: 'Fitness', status: 'active', date: '2026-07-05', notes: 'After dinner' },
    ],
    entityExtraFields: [],
    formExtraFields: [COMMON_FORM_FIELDS],
    listExtraDisplay: ['category', 'status', 'date'],
    cardExtraDisplay: ['category', 'status', 'date', 'notes'],
    titleFieldLabel: 'Habit name',
    descriptionFieldLabel: 'Description',
    metricsComputation: `const today = items.filter((i) => i.date === new Date().toISOString().slice(0, 10));
    const completed = today.filter((i) => i.status === 'completed').length;
    const rate = today.length ? Math.round((completed / today.length) * 100) : 0;
    const streak = completed > 0 ? completed + 2 : 0;
    return [String(today.length), \`\${rate}%\`, String(streak), \`\${Math.min(100, rate + 10)}%\`];`,
  },
  'fitness-tracker': {
    domainId: 'fitness-tracker',
    createActionLabel: 'Add workout',
    editActionLabel: 'Edit workout',
    deleteActionLabel: 'Delete workout',
    filterOptions: ['All', 'Cardio', 'Strength', 'Flexibility'],
    filterLogic: `if (filterCategory === 'All') return items;
    return items.filter((item) => item.category === filterCategory);`,
    chartSegments: [
      { label: 'Cardio', value: 40 },
      { label: 'Strength', value: 35 },
      { label: 'Flexibility', value: 25 },
    ],
    seedData: [
      { title: 'Morning run', description: '5 km easy pace', category: 'Cardio', amount: 35, date: '2026-07-04', status: 'completed', notes: '32 min' },
      { title: 'Upper body', description: 'Bench, rows, curls', category: 'Strength', amount: 50, date: '2026-07-03', status: 'completed', notes: '45 min' },
      { title: 'Yoga flow', description: 'Recovery session', category: 'Flexibility', amount: 25, date: '2026-07-02', status: 'completed', notes: '30 min' },
    ],
    entityExtraFields: [],
    formExtraFields: [COMMON_FORM_FIELDS],
    listExtraDisplay: ['category', 'amount', 'date'],
    cardExtraDisplay: ['category', 'amount', 'date', 'notes'],
    titleFieldLabel: 'Workout name',
    descriptionFieldLabel: 'Details',
    metricsComputation: `const workouts = items.length;
    const weekMinutes = items.reduce((s, i) => s + (i.amount ?? 0), 0);
    const goals = 3;
    return [String(workouts), String(goals), \`\${weekMinutes} min\`, String(Math.round(weekMinutes / 7))];`,
  },
  'notes-app': {
    domainId: 'notes-app',
    createActionLabel: 'Add note',
    editActionLabel: 'Edit note',
    deleteActionLabel: 'Delete note',
    filterOptions: ['All', 'Work', 'Personal', 'Ideas', 'Pinned'],
    filterLogic: `if (filterCategory === 'All') return items;
    if (filterCategory === 'Pinned') return items.filter((i) => i.priority === 'high');
    return items.filter((item) => item.category === filterCategory);`,
    chartSegments: [
      { label: 'Work', value: 45 },
      { label: 'Personal', value: 30 },
      { label: 'Ideas', value: 25 },
    ],
    seedData: [
      { title: 'Sprint planning', description: 'Finalize Q3 priorities', category: 'Work', status: 'active', date: '2026-07-05', priority: 'high', tags: ['planning'] },
      { title: 'Grocery list', description: 'Milk, eggs, spinach', category: 'Personal', status: 'active', date: '2026-07-04', priority: 'medium', tags: [' errands'] },
      { title: 'App idea sketch', description: 'Habit tracker with streaks UI', category: 'Ideas', status: 'active', date: '2026-07-03', priority: 'low', tags: ['product'] },
    ],
    entityExtraFields: [],
    formExtraFields: [COMMON_FORM_FIELDS],
    listExtraDisplay: ['category', 'date', 'priority'],
    cardExtraDisplay: ['category', 'date', 'tags', 'notes'],
    titleFieldLabel: 'Note title',
    descriptionFieldLabel: 'Content',
    metricsComputation: `const notes = items.length;
    const pinned = items.filter((i) => i.priority === 'high').length;
    const today = items.filter((i) => i.date === new Date().toISOString().slice(0, 10)).length;
    return [String(notes), String(pinned), String(today), String(notes)];`,
  },
  'invoice-system': {
    domainId: 'invoice-system',
    createActionLabel: 'Create invoice',
    editActionLabel: 'Edit invoice',
    deleteActionLabel: 'Delete invoice',
    filterOptions: ['All', 'Paid', 'Unpaid', 'Overdue'],
    filterLogic: `if (filterCategory === 'All') return items;
    if (filterCategory === 'Paid') return items.filter((i) => i.status === 'completed');
    if (filterCategory === 'Overdue') return items.filter((i) => i.status === 'archived');
    return items.filter((i) => i.status === 'pending' || i.status === 'active');`,
    chartSegments: [
      { label: 'Paid', value: 60 },
      { label: 'Unpaid', value: 30 },
      { label: 'Overdue', value: 10 },
    ],
    seedData: [
      { title: 'INV-1042', description: 'Website redesign', company: 'Acme Corp', amount: 2400, status: 'pending', date: '2026-07-01', category: 'Unpaid' },
      { title: 'INV-1041', description: 'Monthly retainer', company: 'Beta LLC', amount: 1800, status: 'completed', date: '2026-06-28', category: 'Paid' },
      { title: 'INV-1039', description: 'Consulting block', company: 'Northwind', amount: 950, status: 'archived', date: '2026-06-15', category: 'Overdue' },
    ],
    entityExtraFields: [],
    formExtraFields: [crmFormFields()],
    listExtraDisplay: ['company', 'amount', 'status', 'date'],
    cardExtraDisplay: ['company', 'amount', 'status', 'date', 'notes'],
    titleFieldLabel: 'Invoice number',
    descriptionFieldLabel: 'Description',
    metricsComputation: `const outstanding = items.filter((i) => i.status !== 'completed').reduce((s, i) => s + (i.amount ?? 0), 0);
    const paid = items.filter((i) => i.status === 'completed').reduce((s, i) => s + (i.amount ?? 0), 0);
    const due = items.filter((i) => i.status === 'archived').length;
    return [String(items.length), paid.toFixed(0), String(due), outstanding.toFixed(0)];`,
  },
  'project-manager': {
    domainId: 'project-manager',
    createActionLabel: 'Add task',
    editActionLabel: 'Edit task',
    deleteActionLabel: 'Delete task',
    filterOptions: ['All', 'High', 'Medium', 'Low', 'Completed'],
    filterLogic: `if (filterCategory === 'All') return items;
    if (filterCategory === 'Completed') return items.filter((i) => i.status === 'completed');
    return items.filter((i) => i.priority === filterCategory.toLowerCase());`,
    chartSegments: [
      { label: 'Planning', value: 25 },
      { label: 'In Progress', value: 45 },
      { label: 'Done', value: 30 },
    ],
    seedData: [
      { title: 'Launch landing page', description: 'Marketing site v1', category: 'Marketing', priority: 'high', status: 'active', date: '2026-07-06' },
      { title: 'API integration', description: 'Connect billing provider', category: 'Engineering', priority: 'high', status: 'pending', date: '2026-07-08' },
      { title: 'User interviews', description: 'Schedule 5 sessions', category: 'Research', priority: 'medium', status: 'completed', date: '2026-07-02' },
    ],
    entityExtraFields: [],
    formExtraFields: [COMMON_FORM_FIELDS],
    listExtraDisplay: ['priority', 'category', 'status', 'date'],
    cardExtraDisplay: ['priority', 'category', 'status', 'date', 'notes'],
    titleFieldLabel: 'Task name',
    descriptionFieldLabel: 'Details',
    metricsComputation: `const tasks = items.length;
    const dueToday = items.filter((i) => i.date === new Date().toISOString().slice(0, 10)).length;
    const completed = items.filter((i) => i.status === 'completed').length;
    return [String(tasks), String(dueToday), String(completed), \`\${tasks ? Math.round((completed / tasks) * 100) : 0}%\`];`,
  },
};

function genericCreationProfile(domain: ApplicationDomainProfile): DomainCreationProfile {
  return {
    domainId: domain.domainId,
    createActionLabel: `Add ${domain.entityLabel.toLowerCase()}`,
    editActionLabel: `Edit ${domain.entityLabel.toLowerCase()}`,
    deleteActionLabel: `Delete ${domain.entityLabel.toLowerCase()}`,
    filterOptions: ['All', 'General', 'Priority', 'Archived'],
    filterLogic: `if (filterCategory === 'All') return items;
    return items.filter((item) => item.category === filterCategory);`,
    chartSegments: [
      { label: 'General', value: 50 },
      { label: 'Priority', value: 30 },
      { label: 'Archived', value: 20 },
    ],
    seedData: [
      { title: `Sample ${domain.entityLabel}`, description: `Starter ${domain.entityLabel.toLowerCase()} record`, category: 'General', status: 'active', date: '2026-07-01', amount: 0, notes: 'Sample data' },
      { title: `Example ${domain.entityLabel} 2`, description: 'Another starter record', category: 'Priority', status: 'active', date: '2026-07-02', amount: 0, notes: 'Sample data' },
    ],
    entityExtraFields: [],
    formExtraFields: [COMMON_FORM_FIELDS],
    listExtraDisplay: ['category', 'status', 'date'],
    cardExtraDisplay: ['category', 'status', 'date', 'notes'],
    titleFieldLabel: 'Title',
    descriptionFieldLabel: 'Description',
    metricsComputation: `return [
      String(items.length),
      String(items.filter((i) => i.status === 'active').length),
      String(Math.max(0, items.length - 1)),
    ];`,
  };
}

export function resolveDomainCreationProfile(
  understanding: UnderstandingReport,
  buildPlan: BuildPlan,
): DomainCreationProfile {
  const domain = inferApplicationDomain(understanding, buildPlan);
  return CREATION_PROFILES[domain.domainId] ?? genericCreationProfile(domain);
}

export function buildEntityInterface(_profile: DomainCreationProfile): string {
  return `export interface Entity {
${BASE_ENTITY_FIELDS.join('\n')}
}

export type EntityInput = Omit<Entity, 'id'>;
`;
}

export function buildSeedInitializer(profile: DomainCreationProfile): string {
  const defaults: DomainSeedRecord = {
    title: '',
    description: '',
    category: 'General',
    status: 'active',
    date: '2026-07-01',
    amount: 0,
    notes: '',
  };

  const records = profile.seedData.map((record) => {
    const merged = { ...defaults, ...record };
    const fields = Object.entries(merged)
      .map(([key, value]) => {
        if (typeof value === 'string') return `      ${key}: ${JSON.stringify(value)},`;
        if (typeof value === 'number') return `      ${key}: ${value},`;
        if (Array.isArray(value)) return `      ${key}: ${JSON.stringify(value)},`;
        return `      ${key}: ${JSON.stringify(value)},`;
      })
      .join('\n');
    return `    {
      id: crypto.randomUUID(),
${fields}
    }`;
  });

  return records.join(',\n');
}

export const SOFTWARE_CREATION_MARKER = 'data-software-creation-quality';
