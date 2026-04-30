import { generateMockBuyers } from '../buyers/mockBuyers.js';
import { generateMockSellers } from '../sellers/mockSellers.js';
import { generateMockOrders } from '../orders/mockOrders.js';
import { generateDummyPurchases } from '../purchases/mockPurchases.js';
import { generateDummyProcurements } from '../procurement/generateDummyProcurements.js';
import { generateDummyInventory } from '../inventory/generateDummyInventory.js';
import { generateDummyInvoices } from '../invoices/generateDummyInvoices.js';
import { generateDummyBills } from '../bills/generateDummyBills.js';
import { generateDummyQualityChecks } from '../quality/generateDummyQualityChecks.js';
import { generateSafetyData } from '../safety/generateSafetyData.js';
import { generateDummyReports } from '../reports/generateDummyReports.js';
import { generateMockActiveUsers } from '../active/mockActiveUsers.js';

const formatCurrency = (value) => `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
const toDate = (value) => new Date(value);

const includesQuery = (value, query) => String(value || '').toLowerCase().includes(query);

const matchesDateRange = (dateValue, from, to) => {
  if (!dateValue) return true;
  const date = toDate(dateValue);
  if (from && date < new Date(from)) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
};

const recordRisk = {
  buyers: (row) => (row.riskScore >= 75 ? 'high' : row.riskScore >= 45 ? 'medium' : 'low'),
  sellers: (row) => (row.riskScore >= 70 ? 'high' : row.riskScore >= 40 ? 'medium' : 'low'),
  activeUsers: (row) => (row.riskBand?.includes('high') || row.state === 'Locked' ? 'high' : row.riskBand?.includes('medium') ? 'medium' : 'low'),
  orders: (row) => (row.riskBand === 'high_risk' ? 'high' : row.riskBand === 'medium_risk' ? 'medium' : 'low'),
  purchases: (row) => (row.supplierRiskLevel === 'High Risk' ? 'high' : row.supplierRiskLevel === 'Medium Risk' ? 'medium' : 'low'),
  procurement: (row) => (Number(row.rejectionRate) > 8 || row.qualityScore < 3.8 ? 'high' : row.qualityScore < 4.2 ? 'medium' : 'low'),
  inventory: (row) => (row.riskFlags?.some((flag) => ['Expired', 'Blocked from sale', 'High damaged quantity'].includes(flag)) ? 'high' : row.riskFlags?.length ? 'medium' : 'low'),
  invoices: (row) => (row.status === 'Overdue' ? 'high' : row.status === 'Pending' || row.status === 'Partially Paid' ? 'medium' : 'low'),
  bills: (row) => (row.status === 'Overdue' || row.priority === 'Urgent' ? 'high' : row.status === 'Pending' || row.status === 'Partially Paid' ? 'medium' : 'low'),
  quality: (row) => (row.grade === 'Red' ? 'high' : row.grade === 'Orange' ? 'medium' : 'low'),
  safetyAlerts: (row) => (['Critical', 'Danger'].includes(row.level) ? 'high' : row.level === 'Warning' ? 'medium' : 'low'),
  reports: (row) => (row.status === 'Failed' ? 'high' : row.status === 'Queued' || row.status === 'Running' ? 'medium' : 'low')
};

const datasetConfig = {
  buyers: {
    module: 'buyers',
    dateField: 'joinDate',
    search: (row, query) => [row.id, row.name, row.email, row.location].some((value) => includesQuery(value, query))
  },
  sellers: {
    module: 'sellers',
    dateField: 'createdAt',
    search: (row, query) => [row.id, row.storeName, row.email, row.location].some((value) => includesQuery(value, query))
  },
  activeUsers: {
    module: 'active',
    dateField: 'lastSeenAt',
    search: (row, query) => [row.userId, row.fullName, row.email, row.device, row.ipAddress].some((value) => includesQuery(value, query))
  },
  orders: {
    module: 'orders',
    dateField: 'createdAt',
    search: (row, query) => [row.orderId, row.buyerId, row.buyerName, row.sellerId, row.sellerName, row.transactionId, row.trackingId].some((value) => includesQuery(value, query))
  },
  purchases: {
    module: 'purchases',
    dateField: 'createdAt',
    search: (row, query) => [row.purchaseId, row.supplierName, row.productName, row.invoiceNumber].some((value) => includesQuery(value, query))
  },
  procurement: {
    module: 'procurement',
    dateField: 'createdAt',
    search: (row, query) => [row.procurementId || row.id, row.supplier, row.requestTitle, row.category, row.region].some((value) => includesQuery(value, query))
  },
  inventory: {
    module: 'inventory',
    dateField: 'updatedAt',
    search: (row, query) => [row.sku, row.product, row.warehouse, row.supplier, row.batchCode].some((value) => includesQuery(value, query))
  },
  invoices: {
    module: 'invoices',
    dateField: 'issueDate',
    search: (row, query) => [row.invoiceId, row.linkedRecordId, row.partyName, row.partyGstin, row.invoiceOwner].some((value) => includesQuery(value, query))
  },
  bills: {
    module: 'bills',
    dateField: 'billDate',
    search: (row, query) => [row.billId, row.linkedInvoiceId, row.linkedPurchaseOrderId, row.supplierName, row.paymentReference].some((value) => includesQuery(value, query))
  },
  quality: {
    module: 'quality',
    dateField: 'inspectedAt',
    search: (row, query) => [row.inspectionId, row.product, row.supplier, row.batchCode, row.inspectorName].some((value) => includesQuery(value, query))
  },
  safetyAlerts: {
    module: 'safety',
    dateField: 'createdAt',
    search: (row, query) => [row.alertId, row.alertTitle, row.details, row.sourceModule].some((value) => includesQuery(value, query))
  },
  reports: {
    module: 'reports',
    dateField: 'lastRunAt',
    search: (row, query) => [row.reportId, row.reportName, row.reportCategory, row.ownerAdmin].some((value) => includesQuery(value, query))
  }
};

export const createOverviewDatasets = () => {
  const activeUsers = generateMockActiveUsers(1000).map((row) => ({
    ...row,
    fullName: row.fullName || row.user || row.name,
    lastSeenAt: row.lastSeenAt || row.lastSeen || row.updatedAt
  }));
  const purchases = generateDummyPurchases(1000).map((row) => ({
    ...row,
    purchaseId: row.purchaseId || row.id
  }));
  const procurement = generateDummyProcurements(1000).map((row) => ({
    ...row,
    procurementId: row.procurementId || row.id
  }));
  const inventoryBundle = generateDummyInventory(1000);
  const safetyBundle = generateSafetyData(1000);

  return {
    buyers: generateMockBuyers(1000),
    sellers: generateMockSellers(1000),
    activeUsers,
    orders: generateMockOrders(1000),
    purchases,
    procurement,
    inventory: inventoryBundle.batches,
    movementLogs: inventoryBundle.movements,
    invoices: generateDummyInvoices(1000),
    bills: generateDummyBills(1000),
    quality: generateDummyQualityChecks(1000),
    safetyAlerts: safetyBundle.alerts,
    safetyComplaints: safetyBundle.complaints,
    reports: generateDummyReports(500)
  };
};

export const filterOverviewDatasets = (datasets, filters) => {
  const query = filters.search.trim().toLowerCase();

  return Object.fromEntries(
    Object.entries(datasetConfig).map(([key, config]) => {
      const rows = datasets[key] || [];
      const filtered = rows.filter((row) => {
        const matchesModule = filters.module === 'all' || filters.module === config.module;
        const matchesSearch = !query || config.search(row, query);
        const matchesDate = matchesDateRange(row[config.dateField], filters.dateFrom, filters.dateTo);
        const risk = recordRisk[key]?.(row) || 'low';
        const matchesRisk = filters.riskLevel === 'all' || filters.riskLevel === risk;
        return matchesModule && matchesSearch && matchesDate && matchesRisk;
      });

      return [key, filtered];
    })
  );
};

export const buildOverviewStats = (filtered) => {
  const totalSales = filtered.orders.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
  const revenue = filtered.orders.reduce((sum, row) => sum + Math.round((row.totalAmount || 0) * 0.12), 0);
  const inventoryValue = filtered.inventory.reduce((sum, row) => sum + (row.availableQty || 0) * (row.sellingPrice || 0), 0);
  const refundedOrders = filtered.orders.filter((row) => ['Refunded', 'Partially Refunded'].includes(row.paymentStatus)).length;
  const lowStock = filtered.inventory.filter((row) => (row.availableQty || 0) <= (row.reorderLevel || 0)).length;
  const pendingProcurement = filtered.procurement.filter((row) => ['Draft', 'Requested', 'Approved'].includes(row.status)).length;
  const rejectedQuality = filtered.quality.filter((row) => row.grade === 'Red').length;
  const pendingInvoices = filtered.invoices.filter((row) => ['Pending', 'Overdue', 'Partially Paid'].includes(row.status)).length;
  const paidBills = filtered.bills.filter((row) => row.status === 'Paid').length;
  const unpaidBills = filtered.bills.filter((row) => ['Pending', 'Overdue', 'Partially Paid'].includes(row.status)).length;

  return [
    { key: 'buyers', label: 'Total Buyers', value: filtered.buyers.length.toLocaleString('en-IN'), module: 'buyers', records: filtered.buyers.slice(0, 12), tone: 'emerald' },
    { key: 'sellers', label: 'Total Sellers', value: filtered.sellers.length.toLocaleString('en-IN'), module: 'sellers', records: filtered.sellers.slice(0, 12), tone: 'cyan' },
    { key: 'activeUsers', label: 'Active Users', value: filtered.activeUsers.filter((row) => ['Online', 'Idle'].includes(row.state)).length.toLocaleString('en-IN'), module: 'active', records: filtered.activeUsers.filter((row) => ['Online', 'Idle'].includes(row.state)).slice(0, 12), tone: 'violet' },
    { key: 'newRegistrations', label: 'New Registrations', value: [...filtered.buyers, ...filtered.sellers].filter((row) => matchesDateRange(row.joinDate || row.createdAt, '2026-04-01', '2026-04-24')).length.toLocaleString('en-IN'), module: 'buyers', records: [...filtered.buyers, ...filtered.sellers].slice(0, 12), tone: 'amber' },
    { key: 'orders', label: 'Total Orders', value: filtered.orders.length.toLocaleString('en-IN'), module: 'orders', records: filtered.orders.slice(0, 12), tone: 'emerald' },
    { key: 'pendingOrders', label: 'Pending Orders', value: filtered.orders.filter((row) => ['Pending', 'Confirmed', 'On Hold'].includes(row.orderStatus)).length.toLocaleString('en-IN'), module: 'orders', records: filtered.orders.filter((row) => ['Pending', 'Confirmed', 'On Hold'].includes(row.orderStatus)).slice(0, 12), tone: 'amber' },
    { key: 'completedOrders', label: 'Completed Orders', value: filtered.orders.filter((row) => row.orderStatus === 'Delivered').length.toLocaleString('en-IN'), module: 'orders', records: filtered.orders.filter((row) => row.orderStatus === 'Delivered').slice(0, 12), tone: 'emerald' },
    { key: 'cancelledOrders', label: 'Cancelled Orders', value: filtered.orders.filter((row) => row.orderStatus === 'Cancelled').length.toLocaleString('en-IN'), module: 'orders', records: filtered.orders.filter((row) => row.orderStatus === 'Cancelled').slice(0, 12), tone: 'rose' },
    { key: 'sales', label: 'Total Sales', value: formatCurrency(totalSales), module: 'orders', records: filtered.orders.slice(0, 12), tone: 'cyan' },
    { key: 'revenue', label: 'Revenue', value: formatCurrency(revenue), module: 'orders', records: filtered.orders.slice(0, 12), tone: 'violet' },
    { key: 'refunds', label: 'Refund Requests', value: refundedOrders.toLocaleString('en-IN'), module: 'orders', records: filtered.orders.filter((row) => ['Refunded', 'Partially Refunded'].includes(row.paymentStatus)).slice(0, 12), tone: 'rose' },
    { key: 'lowStock', label: 'Low Stock Products', value: lowStock.toLocaleString('en-IN'), module: 'inventory', records: filtered.inventory.filter((row) => (row.availableQty || 0) <= (row.reorderLevel || 0)).slice(0, 12), tone: 'amber' },
    { key: 'purchases', label: 'Total Purchases', value: filtered.purchases.length.toLocaleString('en-IN'), module: 'purchases', records: filtered.purchases.slice(0, 12), tone: 'cyan' },
    { key: 'procurementPending', label: 'Procurement Pending', value: pendingProcurement.toLocaleString('en-IN'), module: 'procurement', records: filtered.procurement.filter((row) => ['Draft', 'Requested', 'Approved'].includes(row.status)).slice(0, 12), tone: 'amber' },
    { key: 'inventoryValue', label: 'Inventory Value', value: formatCurrency(inventoryValue), module: 'inventory', records: filtered.inventory.slice(0, 12), tone: 'emerald' },
    { key: 'rejectedQuality', label: 'Rejected Quality Items', value: rejectedQuality.toLocaleString('en-IN'), module: 'quality', records: filtered.quality.filter((row) => row.grade === 'Red').slice(0, 12), tone: 'rose' },
    { key: 'pendingInvoices', label: 'Pending Invoices', value: pendingInvoices.toLocaleString('en-IN'), module: 'invoices', records: filtered.invoices.filter((row) => ['Pending', 'Overdue', 'Partially Paid'].includes(row.status)).slice(0, 12), tone: 'amber' },
    { key: 'paidBills', label: 'Paid Bills', value: paidBills.toLocaleString('en-IN'), module: 'bills', records: filtered.bills.filter((row) => row.status === 'Paid').slice(0, 12), tone: 'emerald' },
    { key: 'unpaidBills', label: 'Unpaid Bills', value: unpaidBills.toLocaleString('en-IN'), module: 'bills', records: filtered.bills.filter((row) => ['Pending', 'Overdue', 'Partially Paid'].includes(row.status)).slice(0, 12), tone: 'rose' }
  ];
};

export const buildOverviewInsights = (filtered) => {
  const topProducts = Object.values(
    filtered.orders.flatMap((order) => order.lineItems || []).reduce((acc, item) => {
      const existing = acc[item.productName] || { name: item.productName, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity || 0;
      existing.revenue += item.subtotal || 0;
      acc[item.productName] = existing;
      return acc;
    }, {})
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockAlerts = filtered.inventory
    .filter((row) => (row.availableQty || 0) <= (row.reorderLevel || 0))
    .slice(0, 6)
    .map((row) => ({
      title: row.product,
      meta: `${row.warehouse} · ${row.availableQty} ${row.unit} available`,
      risk: row.riskFlags?.[0] || 'Reorder needed'
    }));

  const approvals = [
    ...filtered.sellers.filter((row) => row.kycStatus === 'pending').slice(0, 4).map((row) => ({ title: row.storeName, meta: 'Seller KYC pending', module: 'sellers' })),
    ...filtered.procurement.filter((row) => row.status === 'Requested').slice(0, 4).map((row) => ({ title: row.requestTitle, meta: 'Procurement approval pending', module: 'procurement' }))
  ].slice(0, 6);

  const overdue = [
    ...filtered.invoices.filter((row) => row.status === 'Overdue').slice(0, 3).map((row) => ({ title: row.invoiceId, meta: `${row.partyName} · invoice overdue`, module: 'invoices' })),
    ...filtered.bills.filter((row) => row.status === 'Overdue').slice(0, 3).map((row) => ({ title: row.billId, meta: `${row.supplierName} · bill overdue`, module: 'bills' }))
  ];

  const registrations = [
    ...filtered.buyers.slice(0, 3).map((row) => ({ title: row.name, meta: `Buyer · ${row.location}`, module: 'buyers' })),
    ...filtered.sellers.slice(0, 3).map((row) => ({ title: row.storeName, meta: `Seller · ${row.location}`, module: 'sellers' }))
  ];

  return { topProducts, lowStockAlerts, approvals, overdue, registrations };
};

export const buildOverviewTrends = (filtered) => {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const orderTrend = months.map((label, index) => ({
    label,
    value: filtered.orders.filter((_, rowIndex) => rowIndex % months.length === index).length
  }));
  const revenueTrend = months.map((label, index) => ({
    label,
    value: filtered.orders.filter((_, rowIndex) => rowIndex % months.length === index).reduce((sum, row) => sum + (row.totalAmount || 0), 0)
  }));
  return { orderTrend, revenueTrend };
};

export const buildOverviewHealth = (filtered) => {
  const checks = [
    filtered.bills.filter((row) => row.status === 'Overdue').length < 120,
    filtered.invoices.filter((row) => row.status === 'Overdue').length < 120,
    filtered.inventory.filter((row) => row.riskFlags?.includes('Expired')).length < 40,
    filtered.quality.filter((row) => row.grade === 'Red').length < 160,
    filtered.safetyAlerts.filter((row) => ['Danger', 'Critical'].includes(row.level) && !['Resolved', 'Dismissed'].includes(row.status)).length < 90
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return {
    score,
    band: score >= 85 ? 'Excellent' : score >= 70 ? 'Stable' : score >= 55 ? 'Watch' : 'At Risk'
  };
};

export const buildOverviewActivity = (filtered) => {
  const items = [
    ...filtered.safetyAlerts.slice(0, 6).map((row) => ({
      id: row.alertId,
      title: row.alertTitle,
      meta: `${row.sourceModule} · ${row.status}`,
      time: row.createdAt,
      type: ['Critical', 'Danger'].includes(row.level) ? 'danger' : row.level === 'Warning' ? 'warning' : 'info'
    })),
    ...filtered.orders.slice(0, 6).map((row) => ({
      id: row.orderId,
      title: row.orderStatus,
      meta: `${row.orderId} · ${row.buyerName} · ${row.sellerName}`,
      time: row.createdAt,
      type: row.riskBand === 'high_risk' ? 'danger' : 'success'
    })),
    ...filtered.procurement.slice(0, 6).map((row) => ({
      id: row.procurementId || row.id,
      title: row.requestTitle,
      meta: `${row.supplier} · ${row.status}`,
      time: row.createdAt,
      type: row.status === 'Requested' ? 'warning' : 'info'
    }))
  ];

  return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 12);
};

export const buildOverviewRisks = (filtered) => {
  return [
    ...filtered.safetyAlerts.filter((row) => ['Critical', 'Danger'].includes(row.level) && !['Resolved', 'Dismissed'].includes(row.status)).slice(0, 4).map((row) => ({
      id: row.alertId,
      title: row.alertTitle,
      detail: `${row.sourceModule} · ${row.status}`,
      level: 'high',
      module: 'safety'
    })),
    ...filtered.bills.filter((row) => row.status === 'Overdue').slice(0, 3).map((row) => ({
      id: row.billId,
      title: 'Overdue bill',
      detail: `${row.supplierName} · ${formatCurrency(row.balanceDue)}`,
      level: 'high',
      module: 'bills'
    })),
    ...filtered.inventory.filter((row) => row.riskFlags?.some((flag) => ['Low stock', 'Near expiry', 'Expired'].includes(flag))).slice(0, 4).map((row) => ({
      id: row.sku,
      title: row.product,
      detail: `${row.warehouse} · ${(row.riskFlags || []).join(', ')}`,
      level: row.riskFlags?.includes('Expired') ? 'high' : 'medium',
      module: 'inventory'
    }))
  ].slice(0, 10);
};

export const buildOverviewRecentRecords = (filtered) => ({
  buyers: filtered.buyers.slice(0, 5),
  sellers: filtered.sellers.slice(0, 5),
  orders: filtered.orders.slice(0, 5),
  invoices: filtered.invoices.slice(0, 5)
});
