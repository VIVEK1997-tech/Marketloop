const today = new Date('2026-04-24T10:15:00+05:30').getTime();

const createRng = (seed = 9090) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const isoHoursAgo = (hours) => new Date(today - hours * 3600000).toISOString();

const alertTypes = [
  'Payment Failure',
  'Low Stock',
  'Near Expiry',
  'Procurement Delay',
  'Suspicious Activity',
  'Quality Risk',
  'Refund Issue',
  'Inventory Mismatch'
];

const alertLevels = ['Info', 'Warning', 'Danger', 'Critical'];
const alertStatuses = ['New', 'Acknowledged', 'Investigating', 'Resolved', 'Dismissed'];
const modules = ['Procurement', 'Quality Check', 'Inventory', 'Invoices', 'Bills', 'Reports', 'Safety & Support'];

export const generateHeaderAlerts = (count = 50) => {
  const rng = createRng(240424);
  return Array.from({ length: count }, (_, index) => {
    const level = pick(rng, alertLevels);
    const status = index < 3 ? 'New' : pick(rng, alertStatuses);
    const alertType = pick(rng, alertTypes);
    const sourceModule = pick(rng, modules);
    return {
      id: `header-alert-${index + 1}`,
      alertId: `HAL-${String(300100 + index).padStart(6, '0')}`,
      alertTitle: alertType,
      alertType,
      details: `${alertType} detected in ${sourceModule}. Review the linked admin module for remediation.`,
      level,
      status,
      sourceModule,
      linkedRecordType: sourceModule === 'Bills' ? 'Bill' : sourceModule === 'Invoices' ? 'Invoice' : 'Module record',
      linkedRecordId: `${sourceModule.slice(0, 3).toUpperCase()}-${String(8200 + index).padStart(5, '0')}`,
      timestamp: isoHoursAgo((index % 16) + 1)
    };
  });
};

const permissionSets = {
  procurement: ['procurement.read', 'procurement.write', 'procurement.approve'],
  quality: ['quality.read', 'quality.write', 'quality.approve'],
  inventory: ['inventory.read', 'inventory.write', 'inventory.adjust'],
  invoice: ['invoice.read', 'invoice.write', 'invoice.payment'],
  bills: ['bills.read', 'bills.write', 'bills.pay'],
  reports: ['reports.read', 'reports.export', 'reports.schedule'],
  safety: ['safety.read', 'safety.write', 'safety.block'],
  settings: ['settings.read', 'settings.write']
};

export const generateAdminRoles = () => [
  {
    roleId: 'ROLE-SUPER-001',
    roleName: 'Super Admin',
    description: 'Full platform access with cross-module governance and settings control.',
    permissions: [...permissionSets.procurement, ...permissionSets.quality, ...permissionSets.inventory, ...permissionSets.invoice, ...permissionSets.bills, ...permissionSets.reports, ...permissionSets.safety, ...permissionSets.settings],
    assignedUsersCount: 2,
    status: 'active',
    createdAt: '2026-01-03T09:30:00.000Z',
    updatedAt: '2026-04-21T13:30:00.000Z'
  },
  {
    roleId: 'ROLE-FIN-002',
    roleName: 'Finance Admin',
    description: 'Owns invoice, payable, reconciliation, and export controls.',
    permissions: [...permissionSets.invoice, ...permissionSets.bills, 'reports.read', 'reports.export'],
    assignedUsersCount: 3,
    status: 'active',
    createdAt: '2026-01-11T09:30:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z'
  },
  {
    roleId: 'ROLE-PROC-003',
    roleName: 'Procurement Admin',
    description: 'Approves supplier procurements and tracks inbound sourcing workflows.',
    permissions: [...permissionSets.procurement, 'inventory.read', 'reports.read'],
    assignedUsersCount: 4,
    status: 'active',
    createdAt: '2026-01-18T09:30:00.000Z',
    updatedAt: '2026-04-18T09:30:00.000Z'
  },
  {
    roleId: 'ROLE-INV-004',
    roleName: 'Inventory Admin',
    description: 'Manages stock, warehouse movements, adjustments, and reorder safety.',
    permissions: [...permissionSets.inventory, 'quality.read', 'reports.read'],
    assignedUsersCount: 5,
    status: 'active',
    createdAt: '2026-01-25T09:30:00.000Z',
    updatedAt: '2026-04-22T12:15:00.000Z'
  },
  {
    roleId: 'ROLE-QLT-005',
    roleName: 'Quality Admin',
    description: 'Controls quality grading, approvals, quarantines, and inspection actions.',
    permissions: [...permissionSets.quality, 'inventory.read', 'reports.read'],
    assignedUsersCount: 4,
    status: 'active',
    createdAt: '2026-02-04T09:30:00.000Z',
    updatedAt: '2026-04-19T08:45:00.000Z'
  },
  {
    roleId: 'ROLE-SUP-006',
    roleName: 'Support Admin',
    description: 'Handles alerts, complaints, suspensions, watchlists, and user restoration flows.',
    permissions: [...permissionSets.safety, 'reports.read'],
    assignedUsersCount: 6,
    status: 'active',
    createdAt: '2026-02-12T09:30:00.000Z',
    updatedAt: '2026-04-23T16:20:00.000Z'
  },
  {
    roleId: 'ROLE-RPT-007',
    roleName: 'Report Viewer',
    description: 'Read-only access to report generation outputs and export surfaces.',
    permissions: ['reports.read', 'reports.export'],
    assignedUsersCount: 9,
    status: 'inactive',
    createdAt: '2026-02-20T09:30:00.000Z',
    updatedAt: '2026-04-15T10:10:00.000Z'
  }
];

export const bulkExportModules = [
  { id: 'procurement', label: 'Procurement', recordEstimate: 1000 },
  { id: 'quality', label: 'Quality Check', recordEstimate: 1000 },
  { id: 'inventory', label: 'Inventory', recordEstimate: 1000 },
  { id: 'invoices', label: 'Invoices', recordEstimate: 1000 },
  { id: 'bills', label: 'Bills', recordEstimate: 1000 },
  { id: 'reports', label: 'Reports', recordEstimate: 500 },
  { id: 'safety', label: 'Safety & Support', recordEstimate: 2000 }
];

export const bulkExportOptions = [
  { id: 'csv', label: 'CSV data' },
  { id: 'pdf', label: 'PDF previews placeholder' },
  { id: 'logs', label: 'Activity logs' },
  { id: 'selectedOnly', label: 'Selected rows only' },
  { id: 'filteredOnly', label: 'Filtered rows only' }
];
