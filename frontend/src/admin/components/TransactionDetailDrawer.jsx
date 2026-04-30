import { Download, Flag, RefreshCcw, ShieldCheck, StickyNote, X } from 'lucide-react';
import { formatAdminDate, formatMoney } from '../transactions/transactionUtils.js';

const actionButtons = [
  ['review', 'Mark as reviewed', ShieldCheck],
  ['approve_refund', 'Approve refund', ShieldCheck],
  ['reject_refund', 'Reject refund', Flag],
  ['retry', 'Retry failed transaction', RefreshCcw],
  ['flag', 'Flag suspicious transaction', Flag],
  ['note', 'Add / edit admin note', StickyNote],
  ['export', 'Export this transaction', Download]
];

export default function TransactionDetailDrawer({ transaction, open, onClose, onAction }) {
  if (!open || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Transaction details</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{transaction.id}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{transaction.orderId} · {transaction.gateway} · {transaction.paymentReference}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Buyer', transaction.buyerName],
              ['Seller', transaction.sellerName],
              ['Order ID', transaction.orderId],
              ['Method', transaction.method],
              ['Status', transaction.status.replace(/_/g, ' ')],
              ['Amount', formatMoney(transaction.amount)],
              ['Refund status', transaction.refundStatus.replace(/_/g, ' ')],
              ['Created', formatAdminDate(transaction.createdAt, true)],
              ['Updated', formatAdminDate(transaction.updatedAt, true)],
              ['Gateway', transaction.gateway],
              ['Payment reference', transaction.paymentReference],
              ['Risk', transaction.riskLevel]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Gateway and admin context</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Failure reason</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{transaction.failureReason || 'No failure recorded.'}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Admin note</p>
                  <p className="mt-1 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">{transaction.adminNote}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Review state</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{transaction.reviewed ? 'Marked as reviewed' : 'Awaiting review'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Admin actions</h3>
              <div className="mt-4 grid gap-2">
                {actionButtons.map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onAction(key, transaction)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      key === 'reject_refund' || key === 'flag'
                        ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
