import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, Download, FileArchive, FileText, Filter, Search, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { adminSections } from '../admin/mockData.js';
import { downloadCsv, downloadZip, printInvoicePreview } from '../admin/exportUtils.js';
import AdminSidebar from '../admin/components/AdminSidebar.jsx';
import MetricCard from '../admin/components/MetricCard.jsx';
import AdminTable from '../admin/components/AdminTable.jsx';
import StatusBadge from '../admin/components/StatusBadge.jsx';
import BuyerManagementSection from '../admin/components/BuyerManagementSection.jsx';
import SellerManagementSection from '../admin/components/SellerManagementSection.jsx';
import ActiveSessionsManagementSection from '../admin/components/ActiveSessionsManagementSection.jsx';
import OrderManagementSection from '../admin/components/OrderManagementSection.jsx';
import TransactionManagementSection from '../admin/components/TransactionManagementSection.jsx';
import ProductGovernancePage from '../admin/components/ProductGovernancePage.jsx';
import PurchaseManagementPage from '../admin/components/PurchaseManagementPage.jsx';
import ProcurementModule from '../admin/components/ProcurementModule.jsx';
import QualityCheckModule from '../admin/components/QualityCheckModule.jsx';
import InventoryModule from '../admin/components/InventoryModule.jsx';
import InvoiceModule from '../admin/components/InvoiceModule.jsx';
import BillsModule from '../admin/components/BillsModule.jsx';
import ReportsModule from '../admin/components/ReportsModule.jsx';
import SafetySupportModule from '../admin/components/SafetySupportModule.jsx';
import AdminHeaderActions from '../admin/components/AdminHeaderActions.jsx';
import AdminOverviewModule from '../admin/components/AdminOverviewModule.jsx';
import AdminPaymentStatusSection from '../admin/components/AdminPaymentStatusSection.jsx';
import ToastStack from '../admin/components/ToastStack.jsx';
import useAdminHeaderActions from '../admin/hooks/useAdminHeaderActions.js';

const sectionMeta = {
  overview: { title: 'Marketplace Overview', subtitle: 'Live health of buyers, sellers, sales, inventory, procurement, invoices, and risk signals.' },
  paymentStatus: { title: 'Payment Status', subtitle: 'Track payment links, gateway health, and live payment state changes from one admin module.' },
  buyers: { title: 'Buyer Management', subtitle: 'Search, inspect, and control buyer accounts, spend, wishlist trends, and account actions.' },
  sellers: { title: 'Seller Management', subtitle: 'Review verification, performance, revenue, listed products, payouts, and marketplace quality.' },
  active: { title: 'Active User Monitoring', subtitle: 'Track online state, session history, recent activity, and profile audit changes.' },
  orders: { title: 'Order Operations', subtitle: 'Track purchase lifecycle, disputes, delivery state, and order-level payment health.' },
  transactions: { title: 'Transaction Management', subtitle: 'Review transaction outcomes, payment methods, refunds, and settlement history.' },
  products: { title: 'Product Governance', subtitle: 'Moderate produce quality, seller listings, unit types, stock health, and featured products.' },
  purchases: { title: 'Purchase Module', subtitle: 'Monitor supplier-side buys, invoice state, goods received, and bill readiness.' },
  procurement: { title: 'Procurement Planning', subtitle: 'Seasonal sourcing, supplier comparison, quantity planning, and receiving performance.' },
  quality: { title: 'Quality Check', subtitle: 'Green, orange, and red grading for freshness, ripeness, and receiving decisions.' },
  inventory: { title: 'Inventory Control', subtitle: 'Batch tracking, low stock, near expiry alerts, stock movement, and valuation signals.' },
  invoices: { title: 'E-Invoices', subtitle: 'Generate, preview, print, and export customer, supplier, and purchase invoices.' },
  bills: { title: 'E-Pay Bills', subtitle: 'Track pending, overdue, partial, and paid bills with digital payment readiness.' },
  reports: { title: 'Reports & Exports', subtitle: 'Generate CSV, PDF-print, and ZIP bundles across finance, quality, and stock modules.' },
  safety: { title: 'Safety, Complaints & Notifications', subtitle: 'Blocked users, suspicious activity, support tickets, disputes, and alert center.' }
};

const moderationStatuses = ['all', 'active', 'deactivated', 'kyc_pending', 'inactive'];

const miniBarChart = (series, colorClass) => (
  <div className="mt-4 flex h-32 items-end gap-2">
    {series.map((value, index) => (
      <div key={`${value}-${index}`} className="flex-1 rounded-t-2xl bg-slate-100 dark:bg-slate-800">
        <div
          className={`w-full rounded-t-2xl ${colorClass}`}
          style={{ height: `${Math.max((value / Math.max(...series)) * 100, 8)}%` }}
          title={String(value)}
        />
      </div>
    ))}
  </div>
);

const summaryWidget = (title, items) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
    <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
          <span className="font-black text-slate-900 dark:text-slate-100">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, tone = 'default' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
      tone === 'primary'
        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
        : tone === 'danger'
          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const SearchFilterBar = ({ search, setSearch, helper }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
    <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
      <Search size={16} className="text-slate-400" />
      <input
        className="w-full bg-transparent text-sm outline-none"
        placeholder="Search this admin module..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </div>
    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <Filter size={15} />
      {helper}
    </div>
  </div>
);

const emptyWorkspace = {
  kpis: [],
  charts: { daily: [0], weekly: [0], monthly: [0] },
  topSelling: [],
  activity: [],
  widgets: { procurement: [], billing: [], inventory: [] },
  buyers: [],
  sellers: [],
  activeUsers: [],
  auditLogs: [],
  transactions: [],
  orders: [],
  wishlistAnalytics: [],
  products: [],
  purchases: [],
  procurement: [],
  qualityChecks: [],
  inventory: [],
  stockMovements: [],
  invoices: [],
  bills: [],
  reports: [],
  notifications: [],
  complaints: [],
  blockedUsers: [],
  adminRoles: []
};

const QuickActions = ({ title, onCsv, onPdf, onZip, extra }) => (
  <div className="flex flex-wrap items-center gap-3">
    <ActionButton icon={FileText} label={`Generate ${title}`} tone="primary" onClick={onPdf} />
    <ActionButton icon={Download} label="Download CSV" onClick={onCsv} />
    <ActionButton icon={FileArchive} label="Download ZIP" onClick={onZip} />
    {extra}
  </div>
);

export default function Admin() {
  const { user } = useAuth();
  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isAdmin = userRoles.includes('admin');
  const [activeSection, setActiveSection] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [savingStatusId, setSavingStatusId] = useState('');
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    let ignore = false;

    const load = async () => {
      setLoading(true);
      try {
        const workspaceRes = await api.get('/admin/workspace').catch(() => null);
        if (!ignore && workspaceRes?.data?.workspace) {
          setWorkspace(workspaceRes.data.workspace);
          return;
        }

        const [statsRes, usersRes, productsRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ data: {} })),
          api.get('/admin/users').catch(() => ({ data: { users: [] } })),
          api.get('/products', { params: { status: 'available' } }).catch(() => ({ data: { products: [] } }))
        ]);

        if (!ignore) {
          const stats = statsRes.data?.stats || {};
          const users = usersRes.data?.users || [];
          const products = productsRes.data?.products || [];
          setWorkspace({
            ...emptyWorkspace,
            kpis: [
              { key: 'buyers', label: 'Total buyers', value: stats.buyers || 0, tone: 'emerald' },
              { key: 'sellers', label: 'Total sellers', value: stats.sellers || 0, tone: 'cyan' },
              { key: 'orders', label: 'Total orders', value: stats.totalOrders || 0, tone: 'violet' },
              { key: 'sales', label: 'Total sales', value: `Rs. ${Number(stats.totalSales || 0).toLocaleString('en-IN')}`, tone: 'amber' }
            ],
            buyers: users.filter((entry) => entry.roles?.includes('buyer')),
            sellers: users.filter((entry) => entry.roles?.includes('seller')),
            products
          });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const currentMeta = sectionMeta[activeSection];

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const appendHeaderActivity = (item) => {
    setWorkspace((current) => ({
      ...current,
      activity: [item, ...current.activity].slice(0, 10)
    }));
  };

  const headerControls = useAdminHeaderActions(appendHeaderActivity, pushToast);

  useEffect(() => {
    if (activeSection !== 'buyers' && activeSection !== 'sellers') {
      setStatusFilter('all');
      setSortBy('name');
    }
  }, [activeSection]);

  const exportRows = useMemo(() => {
    const source =
      activeSection === 'buyers' ? workspace.buyers :
      activeSection === 'sellers' ? workspace.sellers :
      activeSection === 'orders' ? workspace.orders :
      activeSection === 'transactions' ? workspace.transactions :
      activeSection === 'products' ? workspace.products :
      activeSection === 'purchases' ? workspace.purchases :
      activeSection === 'procurement' ? workspace.procurement :
      activeSection === 'quality' ? workspace.qualityChecks :
      activeSection === 'inventory' ? workspace.inventory :
      activeSection === 'invoices' ? workspace.invoices :
      activeSection === 'bills' ? workspace.bills :
      activeSection === 'reports' ? workspace.reports :
      activeSection === 'safety' ? workspace.complaints :
      [];

    if (!search.trim()) return source;
    const query = search.toLowerCase();
    return source.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
  }, [activeSection, search, workspace]);

  const runCsvExport = () => downloadCsv(`${activeSection}-export`, exportRows);

  const runZipExport = () => {
    const files = exportRows.slice(0, 12).map((row, index) => ({
      name: `${activeSection}-${row.id || index + 1}`,
      extension: 'txt',
      content: Object.entries(row).map(([key, value]) => `${key}: ${value}`).join('\n')
    }));
    downloadZip(`${activeSection}-documents`, files);
  };

  const runPdfPreview = () => {
    const previewRows = exportRows.slice(0, 12).map((row) => Object.fromEntries(Object.entries(row).slice(0, 5)));
    if (!previewRows.length) return;
    printInvoicePreview({
      title: `${currentMeta.title} Preview`,
      rows: previewRows,
      summary: `Generated for ${currentMeta.subtitle}`
    });
  };

  if (!isAdmin) {
    return <p className="card">Only admins can access this page.</p>;
  }

  const applyUserFilterSort = (rows) => {
    const filtered = statusFilter === 'all' ? rows : rows.filter((row) => row.status === statusFilter);
    const nextRows = [...filtered];

    nextRows.sort((left, right) => {
      if (sortBy === 'newest') return new Date(right.registeredAt) - new Date(left.registeredAt);
      if (sortBy === 'status') return String(left.status).localeCompare(String(right.status));
      if (sortBy === 'orders') return Number(right.orders || right.totalOrders || 0) - Number(left.orders || left.totalOrders || 0);
      return String(left.name || left.storeName || '').localeCompare(String(right.name || right.storeName || ''));
    });

    return nextRows;
  };

  const updateModerationStatus = async (userId, accountStatus) => {
    setSavingStatusId(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/status`, { accountStatus });
      const nextStatus = data.user.accountStatus;
      setWorkspace((current) => ({
        ...current,
        buyers: current.buyers.map((row) => (String(row.id) === String(userId) ? { ...row, status: nextStatus } : row)),
        sellers: current.sellers.map((row) => (String(row.id) === String(userId) ? { ...row, status: nextStatus } : row)),
        blockedUsers: nextStatus === 'deactivated'
          ? [
              ...current.blockedUsers.filter((row) => String(row.id) !== String(userId)),
              { id: userId, name: data.user.name, reason: 'Admin moderation', status: 'deactivated' }
            ]
          : current.blockedUsers.filter((row) => String(row.id) !== String(userId))
      }));
    } finally {
      setSavingStatusId('');
    }
  };

  const renderStatusManager = (value, row) => (
    <select
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      value={value}
      disabled={savingStatusId === row.id}
      onChange={(event) => updateModerationStatus(row.id, event.target.value)}
    >
      {moderationStatuses.filter((status) => status !== 'all').map((status) => (
        <option key={status} value={status}>{status.replace('_', ' ')}</option>
      ))}
    </select>
  );

  const buyersColumns = [
    {
      key: 'userLabel',
      label: 'Buyer ID',
      render: (value, row) => (
        <Link className="font-black text-brand-700 hover:underline" to={row.detailPath}>
          {value}
        </Link>
      )
    },
    { key: 'name', label: 'Buyer' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'orders', label: 'Orders' },
    { key: 'spent', label: 'Total spent' },
    { key: 'wishlistCount', label: 'Wishlist' },
    { key: 'moderation', label: 'Moderate', render: (_value, row) => renderStatusManager(row.status, row) }
  ];
  const sellerColumns = [
    {
      key: 'userLabel',
      label: 'Seller ID',
      render: (value, row) => (
        <Link className="font-black text-brand-700 hover:underline" to={row.detailPath}>
          {value}
        </Link>
      )
    },
    { key: 'storeName', label: 'Store' },
    { key: 'email', label: 'Email' },
    { key: 'location', label: 'Location' },
    { key: 'verificationStatus', label: 'Verification', type: 'status' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'totalProducts', label: 'Products' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'rating', label: 'Rating' },
    { key: 'moderation', label: 'Moderate', render: (_value, row) => renderStatusManager(row.status, row) }
  ];

  const moderatedBuyerRows = applyUserFilterSort(exportRows);
  const moderatedSellerRows = applyUserFilterSort(exportRows);

  const renderTableSection = (title, subtitle, columns, rows, extraAction) => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {extraAction}
      </div>
      <AdminTable columns={columns} rows={rows} />
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverviewModule onNavigateSection={setActiveSection} onToast={pushToast} />;
      case 'paymentStatus':
        return <AdminPaymentStatusSection />;
      case 'buyers':
        return <BuyerManagementSection />;
      case 'sellers':
        return <SellerManagementSection />;
      case 'active':
        return <ActiveSessionsManagementSection />;
      case 'orders':
        return <OrderManagementSection />;
      case 'transactions':
        return <TransactionManagementSection />;
      case 'products':
        return <ProductGovernancePage />;
      case 'purchases':
        return <PurchaseManagementPage />;
      case 'procurement':
        return <ProcurementModule />;
      case 'quality':
        return <QualityCheckModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'invoices':
        return <InvoiceModule />;
      case 'bills':
        return <BillsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'safety':
        return <SafetySupportModule />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">Admin control center</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{currentMeta.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{currentMeta.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminHeaderActions controls={headerControls} onNavigateSection={setActiveSection} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <AdminSidebar sections={adminSections} activeSection={activeSection} onSelect={setActiveSection} />

        <div className="space-y-6">
          <SearchFilterBar
            search={search}
            setSearch={setSearch}
            helper={loading ? 'Loading live admin data...' : 'Search, filter, sort, export, and drill into mock/live-backed modules.'}
          />

          {false && (activeSection === 'sellers') && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap gap-2">
                {moderationStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                      statusFilter === status
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {status === 'all' ? 'All statuses' : status.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
                  <option value="status">Status</option>
                  <option value="orders">Orders</option>
                </select>
              </div>
            </div>
          )}

          {(activeSection === 'orders' || activeSection === 'transactions') && (
            <QuickActions title={currentMeta.title} onCsv={runCsvExport} onPdf={runPdfPreview} onZip={runZipExport} />
          )}

          {renderSection()}
        </div>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}
