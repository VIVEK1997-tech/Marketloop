import { formatBillDate, formatBillMoney } from '../bills/billsUtils.js';

export default function PaymentHistoryPanel({ items }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Payment history</p>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((entry) => (
          <div key={entry.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatBillMoney(entry.amount)}</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{entry.adminName}</p>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.mode} - {entry.reference || 'Manual reference'}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{formatBillDate(entry.date)}</p>
          </div>
        )) : <p className="text-sm text-slate-500 dark:text-slate-400">No payment recorded yet.</p>}
      </div>
    </div>
  );
}
