import { useEffect, useMemo, useState } from 'react';
import { Download, FileArchive, RefreshCcw } from 'lucide-react';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import BuyerSummaryCards from './BuyerSummaryCards.jsx';
import ToastStack from './ToastStack.jsx';
import TransactionFilters from './TransactionFilters.jsx';
import TransactionActions from './TransactionActions.jsx';
import TransactionTable from './TransactionTable.jsx';
import TransactionPagination from './TransactionPagination.jsx';
import TransactionDetailDrawer from './TransactionDetailDrawer.jsx';
import { generateMockTransactions } from '../transactions/mockTransactions.js';
import { filterTransactions, formatMoney, getPaginationMeta, sortTransactions } from '../transactions/transactionUtils.js';

const initialFilters = {
  search: '',
  status: 'all',
  method: 'all',
  refundStatus: 'all',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: ''
};

const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' }
];

export default function TransactionManagementSection() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(generateMockTransactions(1000));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const filteredTransactions = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const sortedTransactions = useMemo(() => sortTransactions(filteredTransactions, sortBy, sortDirection), [filteredTransactions, sortBy, sortDirection]);
  const { start, end, totalPages } = useMemo(() => getPaginationMeta(sortedTransactions.length, currentPage, rowsPerPage), [sortedTransactions.length, currentPage, rowsPerPage]);
  const pagedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedTransactions, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const metrics = useMemo(() => {
    const successful = transactions.filter((item) => item.status === 'successful').length;
    const pending = transactions.filter((item) => item.status === 'pending').length;
    const failed = transactions.filter((item) => item.status === 'failed' || item.status === 'gateway_timeout').length;
    const refunded = transactions.filter((item) => item.refundStatus !== 'none').length;
    const highValue = transactions.filter((item) => item.amount > 12000).length;
    const revenue = transactions.filter((item) => item.status === 'successful').reduce((sum, item) => sum + item.amount, 0);
    return [
      { label: 'Total Transactions', value: transactions.length.toLocaleString('en-IN'), helper: 'Seeded finance and settlement records' },
      { label: 'Successful', value: successful.toLocaleString('en-IN'), helper: 'Captured and completed payments' },
      { label: 'Pending / In Review', value: pending.toLocaleString('en-IN'), helper: 'Transactions waiting for final state' },
      { label: 'Failed / Timeout', value: failed.toLocaleString('en-IN'), helper: 'Gateway or retry problem transactions' },
      { label: 'Refund Activity', value: refunded.toLocaleString('en-IN'), helper: 'Transactions with refund workflow' },
      { label: 'Successful Revenue', value: formatMoney(revenue), helper: `${highValue.toLocaleString('en-IN')} high-value transactions tracked` }
    ];
  }, [transactions]);

  const updateTransactions = (predicate, updater) => {
    setTransactions((current) => current.map((item) => (predicate(item) ? updater(item) : item)));
  };

  const handleAction = (action, transaction) => {
    if (action === 'export') {
      downloadCsv(`${transaction.id}-transaction`, [transaction]);
      pushToast('Transaction exported', `${transaction.id} exported as CSV.`);
      return;
    }

    if (action === 'reject_refund') {
      setConfirmState({
        title: `Reject refund for ${transaction.id}?`,
        message: 'This simulates a risky admin action and keeps the review flow explicit.',
        onConfirm: () => {
          updateTransactions((item) => item.id === transaction.id, (item) => ({ ...item, refundStatus: 'rejected', reviewed: true }));
          setConfirmState(null);
          pushToast('Refund rejected', `${transaction.id} refund request was rejected.`);
        }
      });
      return;
    }

    const patch =
      action === 'review' ? { reviewed: true } :
      action === 'approve_refund' ? { refundStatus: 'approved', status: transaction.status === 'successful' ? 'partially_refunded' : transaction.status, reviewed: true } :
      action === 'retry' ? { status: 'pending', failureReason: '' } :
      action === 'flag' ? { riskLevel: 'high', reviewed: false, adminNote: `${transaction.adminNote} Flagged for suspicious review.` } :
      action === 'note' ? { adminNote: `${transaction.adminNote} Admin added follow-up note.` } :
      null;

    if (patch) {
      updateTransactions((item) => item.id === transaction.id, (item) => ({ ...item, ...patch }));
    }
    pushToast('Transaction updated', `${transaction.id}: ${action.replace(/_/g, ' ')} applied.`);
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'export') {
      downloadCsv('selected-transactions', transactions.filter((item) => selectedIds.has(item.id)));
      pushToast('Bulk export ready', `${ids.length} transactions exported.`);
      return;
    }

    updateTransactions(
      (item) => selectedIds.has(item.id),
      (item) => ({
        ...item,
        reviewed: action === 'review' ? true : item.reviewed,
        refundStatus: action === 'approve_refund' ? 'approved' : item.refundStatus,
        status: action === 'retry' ? 'pending' : item.status,
        riskLevel: action === 'flag' ? 'high' : item.riskLevel,
        adminNote: action === 'note' ? `${item.adminNote} Bulk admin note added.` : item.adminNote
      })
    );
    pushToast('Bulk action completed', `${ids.length} transactions updated.`);
  };

  const handleTopAction = (key) => {
    if (key === 'generate') {
      setLoading(true);
      setTimeout(() => {
        setTransactions(generateMockTransactions(1000));
        setLoading(false);
        pushToast('Transactions regenerated', 'Fresh transaction records were seeded.');
      }, 300);
      return;
    }
    if (key === 'csv') {
      downloadCsv('transactions', sortedTransactions);
      pushToast('CSV downloaded', 'Filtered transaction dataset exported.');
      return;
    }
    downloadZip(
      'transactions',
      sortedTransactions.slice(0, 50).map((item) => ({
        name: item.id,
        extension: 'txt',
        content: JSON.stringify(item, null, 2)
      }))
    );
    pushToast('ZIP downloaded', 'Transaction archive bundle generated.');
  };

  const toggleSelect = (transactionId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(transactionId)) next.delete(transactionId);
      else next.add(transactionId);
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
        {[
          ['generate', 'Generate Transaction Management', RefreshCcw, 'primary'],
          ['csv', 'Download CSV', Download],
          ['zip', 'Download ZIP', FileArchive]
        ].map(([key, label, Icon, tone]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTopAction(key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tone === 'primary'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Transaction management</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review gateway outcomes, refunds, disputes, notes, and suspicious payment activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      <TransactionFilters filters={filters} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
      <TransactionActions selectedCount={selectedIds.size} onAction={handleBulkAction} />

      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
          </div>
        </div>
      ) : !sortedTransactions.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">No transactions match the current filters.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try adjusting the status, method, or amount range.</p>
        </div>
      ) : (
        <>
          <TransactionTable
            rows={pagedTransactions}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectPage={toggleSelectPage}
            onOpenTransaction={setActiveTransaction}
            onAction={handleAction}
            activeId={activeTransaction?.id}
          />

          <TransactionPagination
            start={start}
            end={end}
            total={sortedTransactions.length}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onRowsPerPageChange={setRowsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <TransactionDetailDrawer transaction={activeTransaction} open={Boolean(activeTransaction)} onClose={() => setActiveTransaction(null)} onAction={handleAction} />

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
