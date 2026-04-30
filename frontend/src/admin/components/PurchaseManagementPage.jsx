import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, Download, FileArchive, PackageCheck, RefreshCcw, XCircle } from 'lucide-react';
import BuyerSummaryCards from './BuyerSummaryCards.jsx';
import ToastStack from './ToastStack.jsx';
import BulkActionToolbar from './BulkActionToolbar.jsx';
import PurchaseFilters from './PurchaseFilters.jsx';
import PurchaseTable from './PurchaseTable.jsx';
import PurchasePagination from './PurchasePagination.jsx';
import PurchaseDetailDrawer from './PurchaseDetailDrawer.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateDummyPurchases } from '../purchases/mockPurchases.js';
import { filterPurchases, formatMoney, getPaginationMeta, paginateRows, sortPurchases } from '../purchases/purchaseUtils.js';

const initialFilters = {
  search: '',
  purchaseStatus: 'all',
  paymentStatus: 'all',
  supplier: 'all',
  dateFrom: '',
  dateTo: '',
  deliveryStatus: 'all',
  costMin: '',
  costMax: ''
};

const topActions = [
  { key: 'generate', label: 'Generate Purchase Management', icon: RefreshCcw, tone: 'primary' },
  { key: 'csv', label: 'Download CSV', icon: Download },
  { key: 'zip', label: 'Download ZIP', icon: FileArchive }
];

export default function PurchaseManagementPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activePurchase, setActivePurchase] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPurchases(generateDummyPurchases(1000));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const supplierOptions = useMemo(() => [...new Set(purchases.map((purchase) => purchase.supplierName))].sort(), [purchases]);
  const filteredPurchases = useMemo(() => filterPurchases(purchases, filters), [purchases, filters]);
  const normalizedSort = sortBy === 'date' ? 'updatedAt' : sortBy;
  const sortedPurchases = useMemo(() => sortPurchases(filteredPurchases, normalizedSort, sortDirection), [filteredPurchases, normalizedSort, sortDirection]);
  const pagedPurchases = useMemo(() => paginateRows(sortedPurchases, currentPage, rowsPerPage), [sortedPurchases, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getPaginationMeta(sortedPurchases.length, currentPage, rowsPerPage), [sortedPurchases.length, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const metrics = useMemo(() => {
    const totalValue = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const pendingApprovals = purchases.filter((purchase) => purchase.purchaseStatus === 'Pending Approval').length;
    const unpaidBills = purchases.filter((purchase) => ['Unpaid', 'Overdue', 'Invoice Missing'].includes(purchase.paymentStatus)).length;
    const overdueDeliveries = purchases.filter((purchase) => purchase.riskFlags.includes('Overdue delivery')).length;
    const receivedThisMonth = purchases.filter((purchase) => purchase.receivedDate && new Date(purchase.receivedDate).getMonth() === new Date().getMonth()).length;
    return [
      { label: 'Total Purchase Value', value: formatMoney(totalValue), helper: 'Current seeded supplier-side PO value' },
      { label: 'Pending Approvals', value: pendingApprovals.toLocaleString('en-IN'), helper: 'High-value or manual-review purchase orders' },
      { label: 'Unpaid Bills', value: unpaidBills.toLocaleString('en-IN'), helper: 'Bills blocked by invoice, finance, or payment state' },
      { label: 'Overdue Deliveries', value: overdueDeliveries.toLocaleString('en-IN'), helper: 'Supplier deliveries requiring follow-up' },
      { label: 'Received This Month', value: receivedThisMonth.toLocaleString('en-IN'), helper: 'Purchases completed in the current month' }
    ];
  }, [purchases]);

  const updatePurchases = (predicate, updater) => {
    setPurchases((current) =>
      current.map((purchase) => {
        if (!predicate(purchase)) return purchase;
        const next = updater(purchase);
        return {
          ...next,
          updatedAt: new Date().toISOString(),
          auditLog: [
            {
              id: `${next.id}-audit-${Date.now()}-${Math.random()}`,
              actor: 'Admin Console',
              action: 'Purchase updated',
              detail: `Status: ${next.purchaseStatus} · Payment: ${next.paymentStatus} · Bill: ${next.billStatus}`,
              timestamp: new Date().toISOString()
            },
            ...next.auditLog
          ]
        };
      })
    );
  };

  const performAction = (action, purchase) => {
    if (action === 'cancel') {
      setConfirmState({
        title: `Cancel ${purchase.purchaseId}?`,
        message: 'This is a risky workflow action, so I’m keeping it behind an explicit confirmation.',
        onConfirm: () => {
          updatePurchases((item) => item.id === purchase.id, (item) => ({
            ...item,
            purchaseStatus: 'Cancelled',
            deliveryStatus: 'Cancelled'
          }));
          setConfirmState(null);
          pushToast('Purchase cancelled', `${purchase.purchaseId} moved to cancelled state.`);
        }
      });
      return;
    }

    const patch =
      action === 'approve' ? { purchaseStatus: 'Ordered' } :
      action === 'ordered' ? { purchaseStatus: 'Ordered', deliveryStatus: 'In Transit' } :
      action === 'received' ? { purchaseStatus: 'Received', deliveryStatus: 'Delivered', quantityReceived: purchase.quantityOrdered, quantityPending: 0, receivedDate: new Date().toISOString(), billReady: purchase.invoiceUploaded && purchase.invoiceMatched } :
      action === 'partial' ? { purchaseStatus: 'Partially Received', deliveryStatus: 'Partially Received', quantityReceived: Math.max(purchase.quantityReceived, Math.floor(purchase.quantityOrdered * 0.6)), quantityPending: purchase.quantityOrdered - Math.max(purchase.quantityReceived, Math.floor(purchase.quantityOrdered * 0.6)) } :
      action === 'quality' ? { purchaseStatus: 'Quality Check', billReady: false } :
      action === 'bill_paid' ? { paymentStatus: 'Paid', billStatus: 'Bill Approved' } :
      action === 'bill_unpaid' ? { paymentStatus: 'Unpaid', billStatus: purchase.invoiceUploaded ? 'Bill Review' : 'Invoice Missing' } :
      action === 'invoice' ? { invoiceUploaded: true, invoiceNumber: purchase.invoiceNumber === 'Not uploaded' ? `INV-P-${purchase.purchaseId.split('-')[1]}` : purchase.invoiceNumber, billStatus: purchase.invoiceMatched ? 'Bill Ready' : 'Bill Review' } :
      action === 'note' ? { adminNote: `${purchase.adminNote} Admin follow-up note added.` } :
      null;

    if (action === 'export') {
      downloadCsv(`${purchase.purchaseId}-purchase`, [purchase]);
      pushToast('Purchase exported', `${purchase.purchaseId} exported as CSV.`);
      return;
    }

    if (patch) {
      updatePurchases((item) => item.id === purchase.id, (item) => ({ ...item, ...patch }));
      pushToast('Purchase action completed', `${purchase.purchaseId}: ${action.replace(/_/g, ' ')} applied.`);
    }
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'export') {
      downloadCsv('selected-purchases', purchases.filter((purchase) => selectedIds.has(purchase.id)));
      pushToast('Bulk export ready', `${ids.length} purchases exported.`);
      return;
    }

    const applyBulk = () => {
      updatePurchases(
        (purchase) => selectedIds.has(purchase.id),
        (purchase) => ({
          ...purchase,
          purchaseStatus:
            action === 'approve' ? 'Ordered' :
            action === 'cancel' ? 'Cancelled' :
            action === 'received' ? 'Received' :
            purchase.purchaseStatus,
          deliveryStatus:
            action === 'cancel' ? 'Cancelled' :
            action === 'received' ? 'Delivered' :
            purchase.deliveryStatus,
          paymentStatus:
            action === 'mark_paid' ? 'Paid' :
            purchase.paymentStatus,
          quantityReceived: action === 'received' ? purchase.quantityOrdered : purchase.quantityReceived,
          quantityPending: action === 'received' ? 0 : purchase.quantityPending
        })
      );
      pushToast('Bulk purchase update completed', `${ids.length} purchase orders updated.`);
    };

    if (action === 'cancel') {
      setConfirmState({
        title: `Cancel ${ids.length} purchase orders?`,
        message: 'Bulk cancellation is intentionally confirmed to avoid accidental supplier disruption.',
        onConfirm: () => {
          applyBulk();
          setConfirmState(null);
        }
      });
      return;
    }

    applyBulk();
  };

  const handleTopAction = (key) => {
    if (key === 'generate') {
      setLoading(true);
      setTimeout(() => {
        setPurchases(generateDummyPurchases(1000));
        setLoading(false);
        pushToast('Purchase management regenerated', '1000 seeded purchase orders were refreshed.');
      }, 350);
      return;
    }
    if (key === 'csv') {
      downloadCsv('purchase-management', sortedPurchases);
      pushToast('CSV downloaded', 'Filtered purchase dataset exported.');
      return;
    }
    downloadZip(
      'purchase-management',
      sortedPurchases.slice(0, 50).map((purchase) => ({
        name: purchase.purchaseId,
        extension: 'txt',
        content: JSON.stringify(purchase, null, 2)
      }))
    );
    pushToast('ZIP downloaded', 'Purchase report bundle generated.');
  };

  const toggleSelect = (purchaseId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(purchaseId)) next.delete(purchaseId);
      else next.add(purchaseId);
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
          {['all', 'Pending Approval', 'Ordered', 'Received', 'Closed'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilters((current) => ({ ...current, purchaseStatus: status }))}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                filters.purchaseStatus === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {status === 'all' ? 'All purchases' : status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date">Date</option>
            <option value="supplier">Supplier</option>
            <option value="totalCost">Total cost</option>
            <option value="status">Status</option>
            <option value="paymentStatus">Payment status</option>
          </select>
          <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      <PurchaseFilters filters={filters} supplierOptions={supplierOptions} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
      <BulkActionToolbar
        selectedCount={selectedIds.size}
        title="Bulk purchase operations"
        entityLabel="purchase orders"
        actions={[
          { key: 'approve', label: 'Approve selected', icon: CheckCircle2 },
          { key: 'cancel', label: 'Cancel selected', icon: XCircle },
          { key: 'received', label: 'Mark received', icon: PackageCheck },
          { key: 'mark_paid', label: 'Mark bills paid', icon: CreditCard },
          { key: 'export', label: 'Export selected', icon: Download }
        ]}
        onAction={handleBulkAction}
      />

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Purchase operations</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading purchase orders...' : `Showing ${start}-${end} of ${sortedPurchases.length.toLocaleString('en-IN')} purchase orders`}</p>
          </div>
          <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            {purchases.filter((purchase) => purchase.riskFlags.length > 0).length} purchase orders with risk flags
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
      ) : !sortedPurchases.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">No purchase orders match the current filters.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try widening the supplier, status, or total-cost range.</p>
        </div>
      ) : (
        <>
          <PurchaseTable
            rows={pagedPurchases}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectPage={toggleSelectPage}
            onOpenPurchase={setActivePurchase}
            onAction={performAction}
            activeId={activePurchase?.id}
          />
          <PurchasePagination
            start={start}
            end={end}
            total={sortedPurchases.length}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onRowsPerPageChange={setRowsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <PurchaseDetailDrawer purchase={activePurchase} open={Boolean(activePurchase)} onClose={() => setActivePurchase(null)} onAction={performAction} />

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
