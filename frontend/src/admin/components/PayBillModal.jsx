import { useMemo, useState } from 'react';
import { billModeOptions, formatBillMoney } from '../bills/billsUtils.js';

export default function PayBillModal({ open, bill, amount, paymentMode, reference, onAmountChange, onModeChange, onReferenceChange, onClose, onConfirm }) {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => {
    if (!bill) return '';
    const numericAmount = Number(amount || 0);
    if (bill.status === 'Cancelled') return 'Cancelled bills cannot be paid.';
    if (!numericAmount || numericAmount <= 0) return 'Enter a valid payment amount.';
    if (numericAmount > bill.balanceDue) return 'Payment amount cannot exceed the current balance due.';
    if (['UPI', 'Bank Transfer', 'Wallet', 'Card', 'Cheque'].includes(paymentMode) && !String(reference || '').trim()) {
      return 'Payment reference is required for this payment mode.';
    }
    return '';
  }, [amount, bill, paymentMode, reference]);

  if (!open || !bill) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-lg rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Pay bill {bill.billId}</h3>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Grand total {formatBillMoney(bill.grandTotal)} - Current balance {formatBillMoney(bill.balanceDue)}
        </p>
        <div className="mt-6 grid gap-4">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Payment amount
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" type="number" min="0" step="0.01" value={amount} onChange={(event) => onAmountChange(event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Payment mode
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={paymentMode} onChange={(event) => onModeChange(event.target.value)}>
              {billModeOptions.filter((option) => option !== 'all').map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Payment reference
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={reference} onChange={(event) => onReferenceChange(event.target.value)} placeholder="Transaction / cheque / bank reference" />
          </label>
          {touched && validation ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {validation}
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (!validation) onConfirm();
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Record payment
          </button>
        </div>
      </div>
    </div>
  );
}
