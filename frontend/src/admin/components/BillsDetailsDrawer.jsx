import { X } from 'lucide-react';
import { formatBillDate, formatBillMoney } from '../bills/billsUtils.js';
import BillStatusBadge from './BillStatusBadge.jsx';
import PaymentModeBadge from './PaymentModeBadge.jsx';
import PaymentHistoryPanel from './PaymentHistoryPanel.jsx';
import AuditLogPanel from './AuditLogPanel.jsx';

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

export default function BillsDetailsDrawer({ bill, open, onClose, onAction }) {
  if (!open || !bill) return null;

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/45">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Bill details</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{bill.billId}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <BillStatusBadge value={bill.status} />
              <PaymentModeBadge value={bill.paymentMode} />
              {bill.dueRisk !== 'Normal' ? (
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {bill.dueRisk}
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
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Supplier and bill overview</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow label="Supplier" value={bill.supplierName} />
                <InfoRow label="GSTIN" value={bill.supplierGstin} />
                <InfoRow label="Phone" value={bill.supplierPhone} />
                <InfoRow label="Email" value={bill.supplierEmail} />
                <InfoRow label="Linked invoice" value={bill.linkedInvoiceId} />
                <InfoRow label="Linked purchase order" value={bill.linkedPurchaseOrderId} />
                <InfoRow label="Assigned admin" value={bill.assignedAdmin} />
                <InfoRow label="Priority" value={bill.priority} />
                <InfoRow label="Bill date" value={formatBillDate(bill.billDate)} />
                <InfoRow label="Due date" value={formatBillDate(bill.dueDate)} />
                <InfoRow label="Payment date" value={bill.paymentDate ? formatBillDate(bill.paymentDate) : 'Not paid yet'} />
                <InfoRow label="Billing address" value={bill.billingAddress} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['pay', 'Pay bill'],
                  ['partial', 'Partial payment'],
                  ['paid', 'Mark as paid'],
                  ['reminder', 'Send reminder'],
                  ['duplicate', 'Duplicate'],
                  ['download', 'Download receipt'],
                  ['cancel', 'Cancel']
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => onAction(key, bill)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950">
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Notes</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{bill.notes}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Tax and payable breakdown</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Taxable amount</span><span className="font-bold">{formatBillMoney(bill.taxableAmount)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span className="font-bold">{formatBillMoney(bill.discount)}</span></div>
                <div className="flex justify-between"><span>Late fee</span><span className="font-bold">{formatBillMoney(bill.lateFee)}</span></div>
                <div className="flex justify-between"><span>CGST</span><span className="font-bold">{formatBillMoney(bill.cgst)}</span></div>
                <div className="flex justify-between"><span>SGST</span><span className="font-bold">{formatBillMoney(bill.sgst)}</span></div>
                <div className="flex justify-between"><span>IGST</span><span className="font-bold">{formatBillMoney(bill.igst)}</span></div>
                <div className="flex justify-between"><span>Tax total</span><span className="font-bold">{formatBillMoney(bill.taxAmount)}</span></div>
                <div className="flex justify-between"><span>Paid amount</span><span className="font-bold">{formatBillMoney(bill.paidAmount)}</span></div>
                <div className="flex justify-between"><span>Balance due</span><span className="font-bold">{formatBillMoney(bill.balanceDue)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-black dark:border-slate-700"><span>Grand total</span><span>{formatBillMoney(bill.grandTotal)}</span></div>
              </div>
            </div>

            <PaymentHistoryPanel items={bill.paymentHistory} />
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Bill timeline</p>
            <div className="mt-4 space-y-4">
              {bill.timeline.map((entry) => (
                <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.action}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.detail}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{entry.actor} - {formatBillDate(entry.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>

          <AuditLogPanel title="Bills activity log" entries={bill.timeline.map((entry) => ({ ...entry }))} />
        </div>
      </div>
    </div>
  );
}
