import { X } from 'lucide-react';
import { formatInvoiceDate, formatInvoiceMoney } from '../invoices/invoiceUtils.js';
import TaxBreakdownBadge from './TaxBreakdownBadge.jsx';
import AuditLogPanel from './AuditLogPanel.jsx';

const StatusPill = ({ value }) => {
  const tone =
    value === 'Paid'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'Partially Paid'
        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
        : value === 'Overdue'
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
          : value === 'Cancelled'
            ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            : value === 'Draft'
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

export default function InvoiceDetailsDrawer({ invoice, open, onClose, onAction }) {
  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/45">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Invoice details</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{invoice.invoiceId}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill value={invoice.status} />
              {invoice.isOverdueRisk ? (
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  Overdue risk
                </span>
              ) : null}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Invoice overview</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow label="Type" value={invoice.type} />
                <InfoRow label="Linked record" value={`${invoice.linkedRecordType} ${invoice.linkedRecordId}`} />
                <InfoRow label="Party" value={invoice.partyName} />
                <InfoRow label="Party type" value={invoice.partyType} />
                <InfoRow label="GSTIN" value={invoice.partyGstin} />
                <InfoRow label="Owner" value={invoice.invoiceOwner} />
                <InfoRow label="Issue date" value={formatInvoiceDate(invoice.issueDate)} />
                <InfoRow label="Due date" value={formatInvoiceDate(invoice.dueDate)} />
                <InfoRow label="Payment method" value={invoice.paymentMethod} />
                <InfoRow label="Billing address" value={invoice.billingAddress} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['preview', 'Preview'],
                  ['payment', 'Record payment'],
                  ['reminder', 'Send reminder'],
                  ['duplicate', 'Duplicate'],
                  ['download', 'Download PDF'],
                  ['cancel', 'Cancel']
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onAction(key, invoice)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Notes</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{invoice.notes}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Tax breakdown</p>
              <div className="mt-4">
                <TaxBreakdownBadge invoice={invoice} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Taxable amount</span><span className="font-bold">{formatInvoiceMoney(invoice.taxableAmount)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span className="font-bold">{formatInvoiceMoney(invoice.discount)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="font-bold">{formatInvoiceMoney(invoice.shippingCharge)}</span></div>
                <div className="flex justify-between"><span>Grand total</span><span className="font-bold">{formatInvoiceMoney(invoice.grandTotal)}</span></div>
                <div className="flex justify-between"><span>Paid amount</span><span className="font-bold">{formatInvoiceMoney(invoice.paidAmount)}</span></div>
                <div className="flex justify-between"><span>Balance due</span><span className="font-bold">{formatInvoiceMoney(invoice.balanceDue)}</span></div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Payment history</p>
              <div className="mt-4 space-y-3">
                {invoice.paymentHistory.length ? invoice.paymentHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatInvoiceMoney(entry.amount)}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.method} - {entry.note}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{formatInvoiceDate(entry.date)}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No payment recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Invoice timeline</p>
            <div className="mt-4 space-y-4">
              {invoice.timeline.map((entry) => (
                <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.action}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.detail}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{entry.actor} - {formatInvoiceDate(entry.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>

          <AuditLogPanel title="Invoice activity log" entries={invoice.timeline.map((entry) => ({ ...entry }))} />
        </div>
      </div>
    </div>
  );
}
