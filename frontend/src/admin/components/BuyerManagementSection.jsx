import { useEffect, useMemo, useState } from 'react';
import { Download, FileArchive, Plus, RefreshCcw, Users } from 'lucide-react';
import { api } from '../../services/api.js';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { filterBuyers, formatMoney, getPaginationMeta, paginateRows, rowsPerPageOptions, sortBuyers } from '../buyers/buyerUtils.js';
import BuyerSummaryCards from './BuyerSummaryCards.jsx';
import BuyerFilters from './BuyerFilters.jsx';
import BuyerBulkActions from './BuyerBulkActions.jsx';
import BuyerTable from './BuyerTable.jsx';
import BuyerDetailDrawer from './BuyerDetailDrawer.jsx';
import ToastStack from './ToastStack.jsx';

const initialFilters = {
  search: '',
  status: 'all',
  city: 'all',
  verification: 'all',
  vipOnly: false,
  highSpendersOnly: false,
  wishlistOnly: false,
  segment: 'all'
};

const topActions = [
  { key: 'generate', label: 'Refresh Buyer Data', icon: RefreshCcw, tone: 'primary' },
  { key: 'csv', label: 'Download CSV', icon: Download },
  { key: 'zip', label: 'Download ZIP', icon: FileArchive },
  { key: 'filtered', label: 'Export filtered data', icon: Download },
  { key: 'add', label: 'Add New Buyer', icon: Plus }
];

const normaliseForExport = (buyer) => ({
  id: buyer.id,
  name: buyer.name,
  email: buyer.email,
  phone: buyer.phone,
  location: buyer.location,
  status: buyer.status,
  verificationStatus: buyer.verificationStatus,
  segment: buyer.segment,
  totalOrders: buyer.totalOrders,
  totalSpent: buyer.totalSpent,
  wishlistCount: buyer.wishlistCount,
  riskScore: buyer.riskScore
});

export default function BuyerManagementSection() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeBuyer, setActiveBuyer] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/workspace');
      setBuyers(data?.workspace?.buyers || []);
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
          setBuyers(data?.workspace?.buyers || []);
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
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const filteredBuyers = useMemo(() => filterBuyers(buyers, filters), [buyers, filters]);
  const sortedBuyers = useMemo(() => sortBuyers(filteredBuyers, sortBy, sortDirection), [filteredBuyers, sortBy, sortDirection]);
  const pagedBuyers = useMemo(() => paginateRows(sortedBuyers, currentPage, rowsPerPage), [sortedBuyers, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getPaginationMeta(sortedBuyers.length, currentPage, rowsPerPage), [sortedBuyers.length, currentPage, rowsPerPage]);
  const cityOptions = useMemo(() => [...new Set(buyers.map((buyer) => buyer.city))].sort(), [buyers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const summaryMetrics = useMemo(() => {
    const active = buyers.filter((buyer) => buyer.status === 'active').length;
    const blocked = buyers.filter((buyer) => buyer.status === 'blocked').length;
    const verified = buyers.filter((buyer) => buyer.isVerified).length;
    const revenue = buyers.reduce((sum, buyer) => sum + buyer.totalSpent, 0);
    const wishlist = buyers.filter((buyer) => buyer.wishlistCount > 0).length;
    return [
      { label: 'Total Buyers', value: buyers.length.toLocaleString('en-IN'), helper: 'All buyer accounts in this workspace' },
      { label: 'Active Buyers', value: active.toLocaleString('en-IN'), helper: 'Healthy, open, transacting accounts' },
      { label: 'Blocked Buyers', value: blocked.toLocaleString('en-IN'), helper: 'Fraud or manual moderation cases' },
      { label: 'Verified Buyers', value: verified.toLocaleString('en-IN'), helper: 'KYC or trusted account status' },
      { label: 'Revenue from Buyers', value: formatMoney(revenue), helper: 'Aggregate spend across all buyers' },
      { label: 'Buyers with Wishlist Activity', value: wishlist.toLocaleString('en-IN'), helper: 'Saved products and recurring intent' }
    ];
  }, [buyers]);

  const handleFilterChange = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortDirection(column === 'name' ? 'asc' : 'desc');
  };

  const handleToggleSelect = (buyerId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(buyerId)) next.delete(buyerId);
      else next.add(buyerId);
      return next;
    });
  };

  const handleToggleSelectPage = (rows) => {
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

  const updateBuyers = (predicate, updater) => {
    setBuyers((current) => current.map((buyer) => (predicate(buyer) ? updater(buyer) : buyer)));
  };

  const deleteBuyers = (ids) => {
    setBuyers((current) => current.filter((buyer) => !ids.includes(buyer.id)));
    setSelectedIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (activeBuyer && ids.includes(activeBuyer.id)) setActiveBuyer(null);
  };

  const runAction = (actionKey, buyer) => {
    if (actionKey === 'view-profile') {
      setActiveBuyer(buyer);
      return;
    }
    if (actionKey === 'delete') {
      setConfirmState({
        title: `Delete ${buyer.name}?`,
        message: 'Buyer deletion is not enabled in the live admin sync yet. Use moderation controls instead so app and admin data stay aligned.',
        onConfirm: () => {
          pushToast('Deletion blocked', 'Live buyer records stay read-only until a backend delete/archive flow is added.', 'error');
          setConfirmState(null);
        }
      });
      return;
    }
    if (actionKey === 'toggle-block') {
      const nextStatus = buyer.status === 'blocked' ? 'active' : 'deactivated';
      api.patch(`/admin/users/${buyer.id}/status`, { accountStatus: nextStatus }).then(() => loadBuyers());
      pushToast('Buyer status queued', `${buyer.name} is being synced to ${nextStatus === 'deactivated' ? 'blocked' : 'active'}.`);
      return;
    }
    if (actionKey === 'toggle-active') {
      const nextStatus = buyer.status === 'active' ? 'inactive' : 'active';
      api.patch(`/admin/users/${buyer.id}/status`, { accountStatus: nextStatus }).then(() => loadBuyers());
      pushToast('Buyer status queued', `${buyer.name} account state is being synced to ${nextStatus}.`);
      return;
    }
    if (actionKey === 'verify') {
      pushToast('Verification unchanged', 'Buyer verification is read from the live account record. Update it from the backend profile workflow.', 'warning');
      return;
    }
    if (actionKey === 'export') {
      downloadCsv(`${buyer.name}-buyer-export`, [normaliseForExport(buyer)]);
      pushToast('Buyer exported', `${buyer.name} data was exported as CSV.`);
      return;
    }
    pushToast('Action completed', `${buyer.name}: ${actionKey.replace('-', ' ')} is ready for API integration.`);
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'delete') {
      setConfirmState({
        title: `Delete ${ids.length} buyers?`,
        message: 'Bulk delete is disabled for live buyer sync. Use moderation actions so all surfaces stay aligned.',
        onConfirm: () => {
          pushToast('Bulk delete blocked', 'Live buyer records were not removed.', 'error');
          setConfirmState(null);
        }
      });
      return;
    }

    if (action === 'export') {
      const rows = buyers.filter((buyer) => selectedIds.has(buyer.id)).map(normaliseForExport);
      downloadCsv('selected-buyers', rows);
      pushToast('Bulk export ready', `${rows.length} buyers exported to CSV.`);
      return;
    }

    if (['activate', 'deactivate', 'block'].includes(action)) {
      const nextStatus = action === 'activate' ? 'active' : action === 'deactivate' ? 'inactive' : 'deactivated';
      Promise.all(ids.map((id) => api.patch(`/admin/users/${id}/status`, { accountStatus: nextStatus })))
        .then(() => loadBuyers())
        .catch(() => undefined);
      pushToast('Bulk sync started', `${ids.length} buyers are being synced to ${nextStatus}.`);
      return;
    }

    pushToast('Bulk action limited', `Action "${action}" is not wired to the live backend yet.`, 'warning');
  };

  const handleTopAction = (key) => {
    if (key === 'generate') {
      loadBuyers().then(() => pushToast('Buyer management refreshed', 'Live buyer data reloaded from the admin workspace.'));
      return;
    }
    if (key === 'csv') {
      downloadCsv('buyer-management', sortedBuyers.map(normaliseForExport));
      pushToast('CSV downloaded', 'All current buyer rows were exported.');
      return;
    }
    if (key === 'zip') {
      downloadZip(
        'buyer-management',
        sortedBuyers.slice(0, 50).map((buyer) => ({
          name: buyer.id,
          extension: 'txt',
          content: JSON.stringify(buyer, null, 2)
        }))
      );
      pushToast('ZIP downloaded', 'A ZIP archive for current buyer records is ready.');
      return;
    }
    if (key === 'filtered') {
      downloadCsv('buyer-management-filtered', sortedBuyers.map(normaliseForExport));
      pushToast('Filtered export ready', `${sortedBuyers.length} filtered buyers exported.`);
      return;
    }
    pushToast('Mock action complete', 'Add New Buyer is clickable and ready for form integration.');
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
      <BuyerSummaryCards metrics={summaryMetrics} />

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

      <BuyerFilters filters={filters} cityOptions={cityOptions} onChange={handleFilterChange} onReset={() => setFilters(initialFilters)} />
      <BuyerBulkActions selectedCount={selectedIds.size} onAction={handleBulkAction} />

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Buyer control panel</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {loading ? 'Loading buyer records...' : `Showing ${start}-${end} of ${sortedBuyers.length.toLocaleString('en-IN')} buyers`}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Users size={16} />
            Live buyer records synced from the shared admin workspace
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
      ) : !sortedBuyers.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">No buyers match the current filters.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try resetting filters or broadening the search query.</p>
        </div>
      ) : (
        <>
          <BuyerTable
            rows={pagedBuyers}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectPage={handleToggleSelectPage}
            onOpenBuyer={setActiveBuyer}
            onAction={runAction}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {start}-{end} of {sortedBuyers.length.toLocaleString('en-IN')} buyers</p>
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

      <BuyerDetailDrawer buyer={activeBuyer} open={Boolean(activeBuyer)} onClose={() => setActiveBuyer(null)} onAction={runAction} />

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
