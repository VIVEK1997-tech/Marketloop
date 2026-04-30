import { useEffect, useMemo, useState } from 'react';
import { Download, FileArchive, RefreshCcw } from 'lucide-react';
import { api } from '../../services/api.js';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import BuyerSummaryCards from './BuyerSummaryCards.jsx';
import SellerFilters from './SellerFilters.jsx';
import SellerBulkActions from './SellerBulkActions.jsx';
import SellerTable from './SellerTable.jsx';
import SellerDetailDrawer from './SellerDetailDrawer.jsx';
import ToastStack from './ToastStack.jsx';
import { filterSellers, formatMoney, getPaginationMeta, paginateRows, rowsPerPageOptions, sellerStatusTabs, sortSellers } from '../sellers/sellerUtils.js';

const initialFilters = {
  search: '',
  status: 'all',
  verification: 'all',
  rating: 'all',
  revenue: 'all',
  products: 'all',
  city: 'all',
  risk: 'all'
};

const topActions = [
  { key: 'generate', label: 'Refresh Seller Data', icon: RefreshCcw, tone: 'primary' },
  { key: 'csv', label: 'Download CSV', icon: Download },
  { key: 'zip', label: 'Download ZIP', icon: FileArchive }
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
  { value: 'products', label: 'Products count' },
  { value: 'status', label: 'Status' }
];

const normaliseForExport = (seller) => ({
  id: seller.id,
  storeName: seller.storeName,
  ownerName: seller.ownerName,
  email: seller.email,
  location: seller.location,
  verificationStatus: seller.verificationStatus,
  status: seller.status,
  productCount: seller.productCount,
  revenue: seller.revenue,
  rating: seller.rating,
  riskScore: seller.riskScore,
  riskBand: seller.riskBand,
  payoutStatus: seller.payoutStatus
});

export default function SellerManagementSection() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('revenue');
  const [sortDirection, setSortDirection] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeSeller, setActiveSeller] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/workspace');
      setSellers(data?.workspace?.sellers || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const { data } = await api.get('/admin/workspace');
        if (!cancelled) {
          setSellers(data?.workspace?.sellers || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    refresh();
    const interval = setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const filteredSellers = useMemo(() => filterSellers(sellers, filters), [sellers, filters]);
  const sortedSellers = useMemo(() => sortSellers(filteredSellers, sortBy, sortDirection), [filteredSellers, sortBy, sortDirection]);
  const pagedSellers = useMemo(() => paginateRows(sortedSellers, currentPage, rowsPerPage), [sortedSellers, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getPaginationMeta(sortedSellers.length, currentPage, rowsPerPage), [sortedSellers.length, currentPage, rowsPerPage]);
  const cityOptions = useMemo(() => [...new Set(sellers.map((seller) => seller.city))].sort(), [sellers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const metrics = useMemo(() => {
    const active = sellers.filter((seller) => seller.status === 'active').length;
    const blocked = sellers.filter((seller) => seller.status === 'blacklisted' || seller.status === 'suspended').length;
    const verified = sellers.filter((seller) => seller.verificationStatus === 'verified').length;
    const revenue = sellers.reduce((sum, seller) => sum + seller.revenue, 0);
    const mediumHighRisk = sellers.filter((seller) => seller.riskBand !== 'low_risk').length;
    const highRisk = sellers.filter((seller) => seller.riskBand === 'high_risk').length;

    return [
      { label: 'Total Sellers', value: sellers.length.toLocaleString('en-IN'), helper: 'All seller accounts in this workspace' },
      { label: 'Active Sellers', value: active.toLocaleString('en-IN'), helper: 'Healthy seller accounts available for sale' },
      { label: 'Blocked / Suspended', value: blocked.toLocaleString('en-IN'), helper: 'Escalated moderation or fraud controls' },
      { label: 'Verified Sellers', value: verified.toLocaleString('en-IN'), helper: 'KYC-cleared stores with approved docs' },
      { label: 'Seller Revenue', value: formatMoney(revenue), helper: 'Aggregate seller-side GMV in this dataset' },
      { label: 'Manual Review Queue', value: highRisk.toLocaleString('en-IN'), helper: `${mediumHighRisk.toLocaleString('en-IN')} sellers need closer review` }
    ];
  }, [sellers]);

  const updateSellers = (predicate, updater) => {
    setSellers((current) => current.map((seller) => (predicate(seller) ? updater(seller) : seller)));
  };

  const deleteSellers = (ids) => {
    setSellers((current) => current.filter((seller) => !ids.includes(seller.id)));
    setSelectedIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (activeSeller && ids.includes(activeSeller.id)) setActiveSeller(null);
  };

  const applyModeration = (action, seller) => {
    const statusMap = {
      activate: { status: 'active' },
      deactivate: { status: 'deactivated' },
      kyc_pending: { status: 'kyc_pending', verificationStatus: 'pending' },
      suspend: { status: 'suspended' },
      blacklist: { status: 'blacklisted' },
      approve_kyc: { verificationStatus: 'verified', status: seller.status === 'kyc_pending' ? 'active' : seller.status },
      reject_kyc: { verificationStatus: 'rejected', status: 'kyc_pending' },
      manual_review: { flaggedForReview: true, riskBand: 'high_risk', riskScore: Math.max(seller.riskScore, 80) }
    };

    const patch = statusMap[action];
    if (!patch) {
      pushToast('Seller action completed', `${seller.storeName}: ${action.replace(/_/g, ' ')} ready for API integration.`);
      return;
    }

    if (['activate', 'deactivate', 'kyc_pending'].includes(action)) {
      api.patch(`/admin/users/${seller.id}/status`, { accountStatus: patch.status }).then(() => loadSellers()).catch(() => undefined);
      pushToast('Seller status queued', `${seller.storeName} is being synced to ${patch.status}.`);
      return;
    }

    pushToast('Seller action limited', `${action.replace(/_/g, ' ')} is not wired to the live backend yet.`, 'warning');
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'delete') {
      setConfirmState({
        title: `Delete ${ids.length} sellers?`,
        message: 'Bulk delete is disabled for live seller sync. Use moderation actions so app, web, and admin stay aligned.',
        onConfirm: () => {
          pushToast('Bulk delete blocked', 'Live seller records were not removed.', 'error');
          setConfirmState(null);
        }
      });
      return;
    }

    if (action === 'export') {
      downloadCsv('selected-sellers', sellers.filter((seller) => selectedIds.has(seller.id)).map(normaliseForExport));
      pushToast('Bulk export ready', `${ids.length} sellers exported.`);
      return;
    }

    if (['activate', 'deactivate', 'kyc_pending'].includes(action)) {
      const nextStatus = action === 'activate' ? 'active' : action === 'deactivate' ? 'deactivated' : 'kyc_pending';
      Promise.all(ids.map((id) => api.patch(`/admin/users/${id}/status`, { accountStatus: nextStatus })))
        .then(() => loadSellers())
        .catch(() => undefined);
      pushToast('Bulk moderation started', `${ids.length} sellers are being synced to ${nextStatus}.`);
      return;
    }

    pushToast('Bulk action limited', `Action "${action}" is not wired to the live backend yet.`, 'warning');
  };

  const handleTopAction = (key) => {
    if (key === 'generate') {
      loadSellers().then(() => pushToast('Seller management refreshed', 'Live seller data reloaded from the admin workspace.'));
      return;
    }
    if (key === 'csv') {
      downloadCsv('seller-management', sortedSellers.map(normaliseForExport));
      pushToast('CSV downloaded', 'Filtered seller data exported successfully.');
      return;
    }
    downloadZip(
      'seller-management',
      sortedSellers.slice(0, 50).map((seller) => ({
        name: seller.id,
        extension: 'txt',
        content: JSON.stringify(seller, null, 2)
      }))
    );
    pushToast('ZIP downloaded', 'Seller report bundle is ready.');
  };

  const toggleSelect = (sellerId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(sellerId)) next.delete(sellerId);
      else next.add(sellerId);
      return next;
    });
  };

  const toggleSelectPage = (rows) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = rows.every((row) => next.has(row.id));
      rows.forEach((row) => {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      });
      return next;
    });
  };

  const openSection = (seller, section) => {
    setActiveSeller({ ...seller, highlightedSection: section });
    pushToast('Seller panel opened', `${seller.storeName} · ${section.replace(/_/g, ' ')}`);
  };

  const handleEmailAction = async (seller) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(seller.email);
        pushToast('Email copied', `${seller.email} copied to clipboard.`);
      } else {
        pushToast('Contact panel', `Email action ready for ${seller.email}.`);
      }
    } catch {
      pushToast('Email action', `Unable to copy automatically. Seller email: ${seller.email}`, 'error');
    }
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    for (let page = startPage; page <= endPage; page += 1) pages.push(page);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <BuyerSummaryCards metrics={metrics} />

      <div className="flex flex-wrap items-center gap-3">
        {topActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => handleTopAction(action.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                action.tone === 'primary'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {sellerStatusTabs.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilters((current) => ({ ...current, status }))}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                filters.status === status
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
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200"
          >
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      <SellerFilters filters={filters} cityOptions={cityOptions} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
      <SellerBulkActions selectedCount={selectedIds.size} onAction={handleBulkAction} />

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Seller control panel</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading seller records...' : `Showing ${start}-${end} of ${sortedSellers.length.toLocaleString('en-IN')} sellers`}</p>
          </div>
          <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
            {sellers.filter((seller) => seller.riskBand === 'high_risk').length} live high-risk sellers in manual review queue
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
          </div>
        </div>
      ) : !sortedSellers.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">No sellers match the current filters.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try resetting filters or adjusting the risk/revenue filters.</p>
        </div>
      ) : (
        <>
          <SellerTable
            rows={pagedSellers}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectPage={toggleSelectPage}
            onOpenSeller={setActiveSeller}
            onOpenSection={openSection}
            onEmailAction={handleEmailAction}
            onModerate={applyModeration}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={(column) => {
              if (sortBy === column) {
                setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
                return;
              }
              setSortBy(column);
              setSortDirection(column === 'name' ? 'asc' : 'desc');
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {start}-{end} of {sortedSellers.length.toLocaleString('en-IN')} sellers</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Rows per page
                <select className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={rowsPerPage} onChange={(event) => setRowsPerPage(Number(event.target.value))}>
                  {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Previous</button>
                {pageNumbers.map((page) => (
                  <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${page === currentPage ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>
                    {page}
                  </button>
                ))}
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      <SellerDetailDrawer seller={activeSeller} open={Boolean(activeSeller)} onClose={() => setActiveSeller(null)} onAction={applyModeration} />

      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{confirmState.title}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmState(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={confirmState.onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
