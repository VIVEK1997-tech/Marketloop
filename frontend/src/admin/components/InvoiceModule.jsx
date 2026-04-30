import { useEffect, useMemo, useState } from 'react';
import InvoiceToolbar from './InvoiceToolbar.jsx';
import InvoiceStatsCards from './InvoiceStatsCards.jsx';
import InvoiceFilters from './InvoiceFilters.jsx';
import InvoiceTable from './InvoiceTable.jsx';
import InvoicePagination from './InvoicePagination.jsx';
import InvoiceDetailsDrawer from './InvoiceDetailsDrawer.jsx';
import InvoiceActivityPanel from './InvoiceActivityPanel.jsx';
import InvoiceBulkActionsBar from './InvoiceBulkActionsBar.jsx';
import InvoicePreviewModal from './InvoicePreviewModal.jsx';
import PaymentUpdateModal from './PaymentUpdateModal.jsx';
import ToastStack from './ToastStack.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateDummyInvoices } from '../invoices/generateDummyInvoices.js';
import {
  filterInvoices,
  formatInvoiceMoney,
  getInvoicePaginationMeta,
  paginateInvoices,
  sortInvoices
} from '../invoices/invoiceUtils.js';

const initialFilters = {
  search: '',
  type: 'all',
  status: 'all',
  partyType: 'all',
  paymentMethod: 'all',
  issueFrom: '',
  issueTo: '',
  dueFrom: '',
  dueTo: '',
  overdueOnly: false,
  unpaidOnly: false,
  taxType: 'all',
  amountMin: '',
  amountMax: ''
};

const buildActivity = (invoice, action, actor = 'Admin Console', detail) => ({
  id: `${invoice.id}-${Date.now()}-${Math.random()}`,
  invoiceId: invoice.invoiceId,
  actor,
  action,
  detail: detail || `${invoice.partyName} - ${invoice.linkedRecordId}`,
  timestamp: new Date().toISOString()
});

export default function InvoiceModule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [paymentState, setPaymentState] = useState({ open: false, invoice: null, amount: '' });
  const [activity, setActivity] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const seeded = generateDummyInvoices(1000);
      setRows(seeded);
      setActivity(
        seeded.slice(0, 10).map((row, index) => ({
          id: `invoice-activity-${index + 1}`,
          invoiceId: row.invoiceId,
          actor: row.invoiceOwner,
          action: index % 2 === 0 ? 'Invoice issued' : 'Reminder scheduled',
          detail: `${row.partyName} - ${row.status}`,
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
      partyTypes: [...new Set(rows.map((row) => row.partyType))].sort(),
      paymentMethods: [...new Set(rows.map((row) => row.paymentMethod))].sort(),
      taxTypes: [...new Set(rows.map((row) => row.taxType))].sort()
    }),
    [rows]
  );

  const filteredRows = useMemo(() => filterInvoices(rows, filters), [rows, filters]);
  const sortedRows = useMemo(() => sortInvoices(filteredRows, sortBy, sortDirection), [filteredRows, sortBy, sortDirection]);
  const pagedRows = useMemo(() => paginateInvoices(sortedRows, currentPage, rowsPerPage), [sortedRows, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(
    () => getInvoicePaginationMeta(sortedRows.length, currentPage, rowsPerPage),
    [sortedRows.length, currentPage, rowsPerPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const statsCards = useMemo(() => {
    const paid = rows.filter((row) => row.status === 'Paid').length;
    const pending = rows.filter((row) => row.status === 'Pending').length;
    const overdue = rows.filter((row) => row.status === 'Overdue').length;
    const receivables = rows
      .filter((row) => ['customer', 'sales'].includes(row.type))
      .reduce((sum, row) => sum + row.balanceDue, 0);
    const payables = rows
      .filter((row) => ['purchase', 'supplier'].includes(row.type))
      .reduce((sum, row) => sum + row.balanceDue, 0);
    const taxCollected = rows.reduce((sum, row) => sum + row.cgst + row.sgst + row.igst, 0);
    const balanceDue = rows.reduce((sum, row) => sum + row.balanceDue, 0);

    return [
      { label: 'Total Invoices', value: rows.length.toLocaleString('en-IN'), helper: 'Tracked invoice workspace records', tone: 'cyan' },
      { label: 'Paid Invoices', value: paid.toLocaleString('en-IN'), helper: 'Invoices with zero balance due', tone: 'emerald' },
      { label: 'Pending Invoices', value: pending.toLocaleString('en-IN'), helper: 'Awaiting payment or action', tone: 'amber' },
      { label: 'Overdue Invoices', value: overdue.toLocaleString('en-IN'), helper: 'Past due with unpaid balance', tone: 'rose' },
      { label: 'Total Receivables', value: formatInvoiceMoney(receivables), helper: 'Open incoming money from customers', tone: 'violet' },
      { label: 'Total Payables', value: formatInvoiceMoney(payables), helper: 'Outstanding outgoing invoice payments', tone: 'amber' },
      { label: 'Tax Collected', value: formatInvoiceMoney(taxCollected), helper: 'Combined GST totals across invoices', tone: 'emerald' },
      { label: 'Balance Due', value: formatInvoiceMoney(balanceDue), helper: 'Remaining unpaid amount across workspace', tone: 'rose' }
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

  const handleRowAction = (action, invoice) => {
    if (action === 'view') {
      setActiveInvoice(invoice);
      return;
    }

    if (action === 'preview' || action === 'download') {
      setPreviewInvoice(invoice);
      setActivity((current) => [
        buildActivity(invoice, action === 'preview' ? 'Invoice preview opened' : 'PDF placeholder requested'),
        ...current
      ].slice(0, 30));
      if (action === 'download') {
        pushToast('Invoice PDF placeholder', `${invoice.invoiceId} preview opened as a PDF placeholder.`);
      }
      return;
    }

    if (action === 'payment') {
      setPaymentState({ open: true, invoice, amount: String(invoice.balanceDue || '') });
      return;
    }

    if (action === 'duplicate') {
      const duplicate = {
        ...invoice,
        id: `${invoice.id}-copy-${Date.now()}`,
        invoiceId: `${invoice.invoiceId}-COPY`,
        status: 'Draft',
        paidAmount: 0,
        balanceDue: invoice.grandTotal,
        paymentDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRows((current) => [duplicate, ...current]);
      setActivity((current) => [buildActivity(duplicate, 'Invoice duplicated'), ...current].slice(0, 30));
      pushToast('Invoice duplicated', `${invoice.invoiceId} was copied into a draft.`);
      return;
    }

    if (action === 'cancel' || action === 'archive') {
      setConfirmState({
        title: `${action === 'cancel' ? 'Cancel' : 'Archive'} ${invoice.invoiceId}?`,
        message: 'This changes the billing record state and is intentionally confirmed before applying.',
        onConfirm: () => {
          updateRows(
            (row) => row.id === invoice.id,
            (row) => ({
              ...row,
              status: action === 'cancel' ? 'Cancelled' : row.status,
              notes: `${row.notes} ${action === 'archive' ? 'Invoice archived.' : 'Invoice cancelled.'}`
            }),
            (row) => buildActivity(row, action === 'cancel' ? 'Invoice cancelled' : 'Invoice archived')
          );
          setConfirmState(null);
          pushToast(action === 'cancel' ? 'Invoice cancelled' : 'Invoice archived', `${invoice.invoiceId} updated successfully.`);
        }
      });
      return;
    }

    if (action === 'reminder') {
      updateRows(
        (row) => row.id === invoice.id,
        (row) => ({ ...row, lastReminderAt: new Date().toISOString() }),
        (row) => buildActivity(row, 'Reminder sent', 'Accounts Team')
      );
      pushToast('Reminder sent', `${invoice.invoiceId} reminder activity was logged.`);
      return;
    }

    if (action === 'edit') {
      updateRows(
        (row) => row.id === invoice.id,
        (row) => ({ ...row, notes: `${row.notes} Invoice opened for admin edit.` }),
        (row) => buildActivity(row, 'Invoice edit workflow opened')
      );
      pushToast('Invoice edit opened', `${invoice.invoiceId} was flagged for edit flow.`);
    }
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length && action !== 'preview') return;

    if (action === 'export') {
      downloadCsv('selected-invoices', rows.filter((row) => selectedIds.has(row.id)));
      pushToast('Bulk export ready', `${selectedIds.size} invoices exported.`);
      return;
    }

    if (action === 'download') {
      downloadZip(
        'invoice-downloads',
        rows.filter((row) => selectedIds.has(row.id)).map((row) => ({
          name: row.invoiceId,
          extension: 'txt',
          content: JSON.stringify(row, null, 2)
        }))
      );
      pushToast('ZIP downloaded', `${selectedIds.size} invoice placeholders downloaded.`);
      return;
    }

    if (action === 'preview') {
      const selected = rows.find((row) => selectedIds.has(row.id)) || rows[0];
      if (selected) setPreviewInvoice(selected);
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
        lastReminderAt: action === 'reminder' ? new Date().toISOString() : row.lastReminderAt
      }),
      (row) =>
        buildActivity(
          row,
          action === 'paid' ? 'Marked paid' :
          action === 'pending' ? 'Marked pending' :
          action === 'reminder' ? 'Reminder sent' :
          'Invoice cancelled'
        )
    );
    pushToast('Bulk invoice action completed', `${ids.length} invoices updated.`);
  };

  const handleToolbarAction = (action) => {
    if (action === 'generate') {
      setLoading(true);
      setTimeout(() => {
        const additions = generateDummyInvoices(5).map((row, index) => ({
          ...row,
          id: `generated-invoice-${Date.now()}-${index}`,
          invoiceId: `INV-GEN-${String(index + 1).padStart(2, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setRows((current) => [...additions, ...current]);
        setActivity((current) => [
          ...additions.map((row) => buildActivity(row, 'Generated E-Invoice', 'Invoice Generator')),
          ...current
        ].slice(0, 30));
        setLoading(false);
        pushToast('E-invoices generated', `${additions.length} new invoice records were appended.`);
      }, 450);
      return;
    }

    if (action === 'preview') {
      const target = rows.find((row) => selectedIds.has(row.id)) || rows[0];
      if (target) setPreviewInvoice(target);
      return;
    }

    if (action === 'csv') {
      downloadCsv('invoice-workspace', sortedRows);
      pushToast('CSV downloaded', 'Filtered invoice dataset exported.');
      return;
    }

    downloadZip(
      'invoice-workspace',
      sortedRows.slice(0, 50).map((row) => ({
        name: row.invoiceId,
        extension: 'txt',
        content: JSON.stringify(row, null, 2)
      }))
    );
    setActivity((current) => [{
      id: `zip-${Date.now()}`,
      invoiceId: 'ZIP',
      actor: 'Admin Console',
      action: 'ZIP export generated',
      detail: 'Invoice placeholder ZIP export prepared.',
      timestamp: new Date().toISOString()
    }, ...current].slice(0, 30));
    pushToast('ZIP downloaded', 'Invoice ZIP placeholder generated.');
  };

  const recordPayment = () => {
    const { invoice, amount } = paymentState;
    if (!invoice) return;

    const delta = Number(amount || 0);
    updateRows(
      (row) => row.id === invoice.id,
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
          paymentHistory: [
            ...row.paymentHistory,
            {
              id: `${row.id}-payment-${Date.now()}`,
              amount: delta,
              method: row.paymentMethod,
              date: new Date().toISOString(),
              note: 'Admin payment entry recorded.'
            }
          ]
        };
      },
      (row) => buildActivity(row, 'Payment recorded', 'Finance Desk', `${formatInvoiceMoney(delta)} recorded against invoice.`)
    );

    setPaymentState({ open: false, invoice: null, amount: '' });
    pushToast('Payment recorded', `${invoice.invoiceId} payment entry was updated.`);
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
      <InvoiceStatsCards cards={statsCards} />
      <InvoiceToolbar onAction={handleToolbarAction} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {['all', 'Paid', 'Pending', 'Overdue', 'Partially Paid'].map((status) => (
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
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="issueDate">Issue date</option>
                <option value="dueDate">Due date</option>
                <option value="totalAmount">Total amount</option>
                <option value="balanceDue">Balance due</option>
                <option value="status">Status</option>
                <option value="partyName">Party name</option>
                <option value="type">Invoice type</option>
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

          <InvoiceFilters
            filters={filters}
            options={options}
            onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
            onReset={() => setFilters(initialFilters)}
          />

          <InvoiceBulkActionsBar selectedCount={selectedIds.size} onAction={handleBulkAction} />

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Invoice workspace</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {loading ? 'Loading invoices...' : `Showing ${start}-${end} of ${sortedRows.length.toLocaleString('en-IN')} invoices`}
                </p>
              </div>
              <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {rows.filter((row) => row.isOverdueRisk).length} invoices in the overdue queue
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
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">No invoices match the current filters.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try widening invoice type, payment, amount, or date filters.</p>
            </div>
          ) : (
            <>
              <InvoiceTable
                rows={pagedRows}
                selectedIds={selectedIds}
                activeId={activeInvoice?.id}
                onToggleSelect={toggleSelect}
                onToggleSelectPage={toggleSelectPage}
                onOpen={setActiveInvoice}
                onAction={handleRowAction}
              />
              <InvoicePagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={sortedRows.length}
                start={start}
                end={end}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={setRowsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        <InvoiceActivityPanel items={activity} />
      </div>

      <InvoiceDetailsDrawer invoice={activeInvoice} open={Boolean(activeInvoice)} onClose={() => setActiveInvoice(null)} onAction={handleRowAction} />
      <InvoicePreviewModal open={Boolean(previewInvoice)} invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
      <PaymentUpdateModal
        open={paymentState.open}
        invoice={paymentState.invoice}
        amount={paymentState.amount}
        onAmountChange={(value) => setPaymentState((current) => ({ ...current, amount: value }))}
        onClose={() => setPaymentState({ open: false, invoice: null, amount: '' })}
        onConfirm={recordPayment}
      />

      {confirmState ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{confirmState.title}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmState(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                Cancel
              </button>
              <button type="button" onClick={confirmState.onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
