import { useEffect, useMemo, useState } from 'react';
import BillsToolbar from './BillsToolbar.jsx';
import BillsStatsCards from './BillsStatsCards.jsx';
import BillsFilters from './BillsFilters.jsx';
import BillsTable from './BillsTable.jsx';
import BillsPagination from './BillsPagination.jsx';
import BillsDetailsDrawer from './BillsDetailsDrawer.jsx';
import BillsActivityPanel from './BillsActivityPanel.jsx';
import BillsBulkActionsBar from './BillsBulkActionsBar.jsx';
import PayBillModal from './PayBillModal.jsx';
import ToastStack from './ToastStack.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateDummyBills } from '../bills/generateDummyBills.js';
import { filterBills, formatBillMoney, getBillsPaginationMeta, paginateBills, sortBills } from '../bills/billsUtils.js';

const initialFilters = {
  search: '',
  status: 'all',
  paymentMode: 'all',
  supplier: 'all',
  priority: 'all',
  billFrom: '',
  billTo: '',
  dueFrom: '',
  dueTo: '',
  overdueOnly: false,
  unpaidOnly: false,
  amountMin: '',
  amountMax: '',
  taxMin: '',
  taxMax: ''
};

const buildActivity = (bill, action, actor = 'Admin Console', detail) => ({
  id: `${bill.id}-${Date.now()}-${Math.random()}`,
  billId: bill.billId,
  actor,
  action,
  detail: detail || `${bill.supplierName} - ${bill.linkedInvoiceId}`,
  timestamp: new Date().toISOString()
});

export default function BillsModule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeBill, setActiveBill] = useState(null);
  const [payState, setPayState] = useState({ open: false, bill: null, amount: '', mode: 'UPI', reference: '' });
  const [activity, setActivity] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const seeded = generateDummyBills(1000);
      setRows(seeded);
      setActivity(
        seeded.slice(0, 10).map((row, index) => ({
          id: `bill-activity-${index + 1}`,
          billId: row.billId,
          actor: row.assignedAdmin,
          action: index % 2 === 0 ? 'Bill approved' : 'Reminder scheduled',
          detail: `${row.supplierName} - ${row.status}`,
          timestamp: row.updatedAt
        }))
      );
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const options = useMemo(
    () => ({
      suppliers: [...new Set(rows.map((row) => row.supplierName))].sort(),
      priorities: [...new Set(rows.map((row) => row.priority))].sort()
    }),
    [rows]
  );

  const filteredRows = useMemo(() => filterBills(rows, filters), [rows, filters]);
  const sortedRows = useMemo(() => sortBills(filteredRows, sortBy, sortDirection), [filteredRows, sortBy, sortDirection]);
  const pagedRows = useMemo(() => paginateBills(sortedRows, currentPage, rowsPerPage), [sortedRows, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(
    () => getBillsPaginationMeta(sortedRows.length, currentPage, rowsPerPage),
    [sortedRows.length, currentPage, rowsPerPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const statsCards = useMemo(() => {
    const pending = rows.filter((row) => row.status === 'Pending').length;
    const paid = rows.filter((row) => row.status === 'Paid').length;
    const overdue = rows.filter((row) => row.status === 'Overdue').length;
    const totalPayable = rows.reduce((sum, row) => sum + row.grandTotal, 0);
    const paidAmount = rows.reduce((sum, row) => sum + row.paidAmount, 0);
    const balanceDue = rows.reduce((sum, row) => sum + row.balanceDue, 0);
    const taxPayable = rows.reduce((sum, row) => sum + row.taxAmount, 0);
    return [
      { label: 'Total Bills', value: rows.length.toLocaleString('en-IN'), helper: 'Tracked supplier and seller payable records', tone: 'cyan' },
      { label: 'Pending Bills', value: pending.toLocaleString('en-IN'), helper: 'Bills awaiting payment action', tone: 'amber' },
      { label: 'Paid Bills', value: paid.toLocaleString('en-IN'), helper: 'Bills closed with full payment', tone: 'emerald' },
      { label: 'Overdue Bills', value: overdue.toLocaleString('en-IN'), helper: 'Bills past due with balance due', tone: 'rose' },
      { label: 'Total Payable', value: formatBillMoney(totalPayable), helper: 'Grand payable amount across bills', tone: 'violet' },
      { label: 'Paid Amount', value: formatBillMoney(paidAmount), helper: 'Recorded payments against payable ledger', tone: 'emerald' },
      { label: 'Balance Due', value: formatBillMoney(balanceDue), helper: 'Remaining amount still to be paid', tone: 'rose' },
      { label: 'Tax Payable', value: formatBillMoney(taxPayable), helper: 'GST payable amount across open bills', tone: 'amber' }
    ];
  }, [rows]);

  const updateRows = (predicate, updater, activityBuilder) => {
    const activityEntries = [];
    setRows((current) =>
      current.map((row) => {
        if (!predicate(row)) return row;
        const next = { ...updater(row), updatedAt: new Date().toISOString() };
        if (activityBuilder) activityEntries.push(activityBuilder(next));
        return next;
      })
    );
    if (activityEntries.length) {
      setActivity((current) => [...activityEntries.reverse(), ...current].slice(0, 30));
    }
  };

  const openPayModal = (bill, partial = false) => {
    setPayState({
      open: true,
      bill,
      amount: partial ? String(Math.min(Math.max(bill.balanceDue / 2, 1), bill.balanceDue).toFixed(2)) : String(bill.balanceDue || ''),
      mode: bill.paymentMode || 'UPI',
      reference: bill.paymentReference || ''
    });
  };

  const handleRowAction = (action, bill) => {
    if (action === 'view') {
      setActiveBill(bill);
      return;
    }
    if (action === 'pay') {
      openPayModal(bill, false);
      return;
    }
    if (action === 'partial') {
      openPayModal(bill, true);
      return;
    }
    if (action === 'download') {
      downloadZip('bill-receipt-placeholder', [{ name: bill.billId, extension: 'txt', content: JSON.stringify(bill, null, 2) }]);
      setActivity((current) => [buildActivity(bill, 'Receipt placeholder downloaded'), ...current].slice(0, 30));
      pushToast('Receipt placeholder downloaded', `${bill.billId} receipt bundle was generated.`);
      return;
    }
    if (action === 'duplicate') {
      const duplicate = {
        ...bill,
        id: `${bill.id}-copy-${Date.now()}`,
        billId: `${bill.billId}-COPY`,
        status: 'Draft',
        paidAmount: 0,
        balanceDue: bill.grandTotal,
        paymentDate: null,
        paymentHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRows((current) => [duplicate, ...current]);
      setActivity((current) => [buildActivity(duplicate, 'Bill duplicated'), ...current].slice(0, 30));
      pushToast('Bill duplicated', `${bill.billId} was copied into a draft bill.`);
      return;
    }
    if (action === 'reminder') {
      updateRows(
        (row) => row.id === bill.id,
        (row) => ({ ...row, lastReminderAt: new Date().toISOString() }),
        (row) => buildActivity(row, 'Payment reminder sent', 'Accounts Team')
      );
      pushToast('Reminder sent', `${bill.billId} reminder activity was logged.`);
      return;
    }
    if (action === 'edit') {
      updateRows(
        (row) => row.id === bill.id,
        (row) => ({ ...row, notes: `${row.notes} Bill opened for admin edit.` }),
        (row) => buildActivity(row, 'Bill edit workflow opened')
      );
      pushToast('Bill edit opened', `${bill.billId} was flagged for edit flow.`);
      return;
    }
    if (action === 'paid') {
      updateRows(
        (row) => row.id === bill.id,
        (row) => ({
          ...row,
          status: 'Paid',
          paidAmount: row.grandTotal,
          balanceDue: 0,
          paymentDate: new Date().toISOString()
        }),
        (row) => buildActivity(row, 'Bill marked as paid', 'Finance Desk')
      );
      pushToast('Bill marked paid', `${bill.billId} moved to paid status.`);
      return;
    }
    if (action === 'cancel' || action === 'archive') {
      setConfirmState({
        title: `${action === 'cancel' ? 'Cancel' : 'Archive'} ${bill.billId}?`,
        message: 'This changes the payable record state and is intentionally confirmed before applying.',
        onConfirm: () => {
          updateRows(
            (row) => row.id === bill.id,
            (row) => ({
              ...row,
              status: action === 'cancel' ? 'Cancelled' : row.status,
              notes: `${row.notes} ${action === 'archive' ? 'Bill archived.' : 'Bill cancelled.'}`
            }),
            (row) => buildActivity(row, action === 'cancel' ? 'Bill cancelled' : 'Bill archived')
          );
          setConfirmState(null);
          pushToast(action === 'cancel' ? 'Bill cancelled' : 'Bill archived', `${bill.billId} updated successfully.`);
        }
      });
    }
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'export') {
      downloadCsv('selected-bills', rows.filter((row) => selectedIds.has(row.id)));
      pushToast('Bulk export ready', `${selectedIds.size} bills exported.`);
      return;
    }
    if (action === 'pay') {
      const target = rows.find((row) => selectedIds.has(row.id));
      if (target) {
        openPayModal(target, false);
        if (selectedIds.size > 1) pushToast('Selected first bill', `Opened payment modal for ${target.billId}.`);
      }
      return;
    }

    updateRows(
      (row) => selectedIds.has(row.id),
      (row) => ({
        ...row,
        status:
          action === 'paid' ? 'Paid' :
          action === 'pending' ? 'Pending' :
          action === 'cancel' ? 'Cancelled' :
          row.status,
        paidAmount: action === 'paid' ? row.grandTotal : action === 'pending' ? 0 : row.paidAmount,
        balanceDue: action === 'paid' ? 0 : action === 'pending' ? row.grandTotal : row.balanceDue,
        paymentDate: action === 'paid' ? new Date().toISOString() : row.paymentDate,
        lastReminderAt: action === 'reminder' ? new Date().toISOString() : row.lastReminderAt,
        assignedAdmin: action === 'assign' ? 'Treasury Ops' : row.assignedAdmin
      }),
      (row) => buildActivity(
        row,
        action === 'paid' ? 'Bill marked as paid' :
        action === 'pending' ? 'Bill marked as pending' :
        action === 'reminder' ? 'Payment reminder sent' :
        action === 'assign' ? 'Bill reassigned' :
        'Bill cancelled'
      )
    );
    pushToast('Bulk bills action completed', `${ids.length} bills updated.`);
  };

  const handleToolbarAction = (action) => {
    if (action === 'generate') {
      setLoading(true);
      setTimeout(() => {
        const additions = generateDummyBills(5).map((row, index) => ({
          ...row,
          id: `generated-bill-${Date.now()}-${index}`,
          billId: `BILL-GEN-${String(index + 1).padStart(2, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setRows((current) => [...additions, ...current]);
        setActivity((current) => [...additions.map((row) => buildActivity(row, 'Generated E-Pay bill', 'Billing Generator')), ...current].slice(0, 30));
        setLoading(false);
        pushToast('E-pay bills generated', `${additions.length} new bills were appended.`);
      }, 450);
      return;
    }
    if (action === 'pay_selected') {
      const target = rows.find((row) => selectedIds.has(row.id)) || rows[0];
      if (target) openPayModal(target, false);
      return;
    }
    if (action === 'csv') {
      downloadCsv('bills-workspace', sortedRows);
      pushToast('CSV downloaded', 'Filtered bills dataset exported.');
      return;
    }
    downloadZip(
      'bills-workspace',
      sortedRows.slice(0, 50).map((row) => ({
        name: row.billId,
        extension: 'txt',
        content: JSON.stringify(row, null, 2)
      }))
    );
    setActivity((current) => [{
      id: `zip-${Date.now()}`,
      billId: 'ZIP',
      actor: 'Admin Console',
      action: 'ZIP export generated',
      detail: 'Bills placeholder ZIP export prepared.',
      timestamp: new Date().toISOString()
    }, ...current].slice(0, 30));
    pushToast('ZIP downloaded', 'Bills ZIP placeholder generated.');
  };

  const confirmPayment = () => {
    const { bill, amount, mode, reference } = payState;
    if (!bill) return;
    const delta = Number(amount || 0);

    updateRows(
      (row) => row.id === bill.id,
      (row) => {
        const paidAmount = Number((row.paidAmount + delta).toFixed(2));
        const balanceDue = Number(Math.max(row.grandTotal - paidAmount, 0).toFixed(2));
        const status =
          balanceDue === 0 ? 'Paid' :
          paidAmount > 0 ? 'Partially Paid' :
          new Date(row.dueDate).getTime() < Date.now() ? 'Overdue' :
          'Pending';

        return {
          ...row,
          paidAmount,
          balanceDue,
          status,
          paymentDate: new Date().toISOString(),
          paymentMode: mode,
          paymentReference: reference,
          paymentHistory: [
            ...row.paymentHistory,
            {
              id: `${row.id}-payment-${Date.now()}`,
              amount: delta,
              mode,
              reference: reference || 'Manual register',
              adminName: 'Finance Desk',
              date: new Date().toISOString()
            }
          ]
        };
      },
      (row) => buildActivity(row, 'Payment recorded', 'Finance Desk', `${formatBillMoney(delta)} recorded against bill.`)
    );

    setPayState({ open: false, bill: null, amount: '', mode: 'UPI', reference: '' });
    pushToast('Payment recorded', `${bill.billId} payment entry was updated.`);
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = (pageRows) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = pageRows.every((row) => next.has(row.id));
      pageRows.forEach((row) => {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <BillsStatsCards cards={statsCards} />
      <BillsToolbar onAction={handleToolbarAction} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {['all', 'Pending', 'Paid', 'Overdue', 'Partially Paid'].map((status) => (
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
                  {status === 'all' ? 'All statuses' : status}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="dueDate">Due date</option>
                <option value="billDate">Bill date</option>
                <option value="amount">Amount</option>
                <option value="balanceDue">Balance due</option>
                <option value="supplierName">Supplier name</option>
                <option value="paymentMode">Payment mode</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
              </select>
              <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <BillsFilters filters={filters} options={options} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
          <BillsBulkActionsBar selectedCount={selectedIds.size} onAction={handleBulkAction} />

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Bills payable workspace</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading bills...' : `Showing ${start}-${end} of ${sortedRows.length.toLocaleString('en-IN')} bills`}</p>
              </div>
              <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {rows.filter((row) => row.dueRisk !== 'Normal').length} bills in the due-risk queue
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
          ) : !sortedRows.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">No bills match the current filters.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try widening the status, supplier, payment mode, or amount filters.</p>
            </div>
          ) : (
            <>
              <BillsTable rows={pagedRows} selectedIds={selectedIds} activeId={activeBill?.id} onToggleSelect={toggleSelect} onToggleSelectPage={toggleSelectPage} onOpen={setActiveBill} onAction={handleRowAction} />
              <BillsPagination currentPage={currentPage} totalPages={totalPages} total={sortedRows.length} start={start} end={end} rowsPerPage={rowsPerPage} onRowsPerPageChange={setRowsPerPage} onPageChange={setCurrentPage} />
            </>
          )}
        </div>

        <BillsActivityPanel items={activity} />
      </div>

      <BillsDetailsDrawer bill={activeBill} open={Boolean(activeBill)} onClose={() => setActiveBill(null)} onAction={handleRowAction} />
      <PayBillModal
        open={payState.open}
        bill={payState.bill}
        amount={payState.amount}
        paymentMode={payState.mode}
        reference={payState.reference}
        onAmountChange={(value) => setPayState((current) => ({ ...current, amount: value }))}
        onModeChange={(value) => setPayState((current) => ({ ...current, mode: value }))}
        onReferenceChange={(value) => setPayState((current) => ({ ...current, reference: value }))}
        onClose={() => setPayState({ open: false, bill: null, amount: '', mode: 'UPI', reference: '' })}
        onConfirm={confirmPayment}
      />

      {confirmState ? (
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
      ) : null}
    </div>
  );
}
