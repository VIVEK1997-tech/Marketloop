import { formatInvoiceMoney } from '../invoices/invoiceUtils.js';

export default function PaymentUpdateModal({ open, invoice, amount, onAmountChange, onClose, onConfirm }) {
  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Record payment for {invoice.invoiceId}</h3>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Grand total {formatInvoiceMoney(invoice.grandTotal)} - Current balance {formatInvoiceMoney(invoice.balanceDue)}
        </p>
        <label className="mt-6 block text-sm font-semibold text-slate-600 dark:text-slate-300">
          Payment amount
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
          />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Record payment
          </button>
        </div>
      </div>
    </div>
  );
}
