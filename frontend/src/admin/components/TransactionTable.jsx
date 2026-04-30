import { MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatAdminDate, formatMoney } from '../transactions/transactionUtils.js';

function RowMenu({ transaction, onAction }) {
  const actions = [
    ['review', 'Mark as reviewed'],
    ['approve_refund', 'Approve refund'],
    ['reject_refund', 'Reject refund'],
    ['retry', 'Retry failed transaction'],
    ['flag', 'Flag suspicious'],
    ['note', 'Add / edit admin note']
  ];
  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <MoreHorizontal size={18} />
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {actions.map(([key, label]) => (
          <button key={key} type="button" onClick={() => onAction(key, transaction)} className="flex w-full rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

export default function TransactionTable({ rows, selectedIds, onToggleSelect, onToggleSelectPage, onOpenTransaction, onAction, activeId }) {
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" checked={allOnPageSelected} onChange={() => onToggleSelectPage(rows)} /></th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Transaction ID</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Buyer</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Seller</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Order ID</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Method</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Status</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Amount</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Refund</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Created</th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em] text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((transaction) => (
              <tr key={transaction.id} className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-950/50 ${activeId === transaction.id ? 'bg-emerald-50/60 dark:bg-emerald-950/10' : ''}`} onClick={() => onOpenTransaction(transaction)}>
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(transaction.id)} onChange={() => onToggleSelect(transaction.id)} />
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-brand-700">{transaction.id}</p>
                  <p className="mt-1 text-xs text-slate-500">{transaction.paymentReference}</p>
                </td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{transaction.buyerName}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{transaction.sellerName}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{transaction.orderId}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{transaction.method}</td>
                <td className="px-4 py-4"><StatusBadge value={transaction.status.replace(/_/g, ' ')} /></td>
                <td className="px-4 py-4 font-semibold">{formatMoney(transaction.amount)}</td>
                <td className="px-4 py-4"><StatusBadge value={transaction.refundStatus.replace(/_/g, ' ')} /></td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatAdminDate(transaction.createdAt, true)}</td>
                <td className="px-4 py-4 text-right">
                  <RowMenu transaction={transaction} onAction={onAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
