import { MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatAdminDate, formatMoney } from '../orders/orderUtils.js';

function QuickMenu({ order, onAction }) {
  const actions = [
    ['approve', 'Approve order'],
    ['hold', 'Hold order'],
    ['cancel', 'Cancel order'],
    ['refund_full', 'Refund full amount'],
    ['packed', 'Mark as packed'],
    ['shipped', 'Mark as shipped'],
    ['out_for_delivery', 'Mark out for delivery'],
    ['delivered', 'Mark as delivered'],
    ['failed_delivery', 'Mark failed delivery'],
    ['dispute', 'Open dispute case'],
    ['review', 'Flag for review']
  ];
  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <MoreHorizontal size={18} />
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {actions.map(([key, label]) => (
          <button key={key} type="button" onClick={() => onAction(key, order)} className="flex w-full rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

const riskTone = {
  low_risk: 'bg-emerald-50 text-emerald-700',
  medium_risk: 'bg-amber-50 text-amber-700',
  high_risk: 'bg-rose-50 text-rose-700'
};

export default function OrderTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  onOpenOrder,
  onOpenLinked,
  onAction
}) {
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" checked={allOnPageSelected} onChange={() => onToggleSelectPage(rows)} /></th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Order ID</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Buyer ID</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Buyer</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Seller ID</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Seller</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Product List</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Quantity</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Amount</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Payment</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Delivery</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Risk</th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em] text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((order) => (
              <tr key={order.id} className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-950/50 ${order.riskFlag === 'high_risk' ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}`} onClick={() => onOpenOrder(order)}>
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => onToggleSelect(order.id)} />
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenOrder(order); }} className="font-black text-brand-700 hover:underline">
                    {order.orderId}
                  </button>
                  <p className="mt-1 text-xs text-slate-500">{formatAdminDate(order.orderDate, true)}</p>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('buyer', order); }} className="font-black text-brand-700 hover:underline">
                    {order.buyerId}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('buyer', order); }} className="text-slate-800 hover:text-brand-700 dark:text-slate-100">
                    {order.buyerName}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('seller', order); }} className="font-black text-brand-700 hover:underline">
                    {order.sellerId}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('seller', order); }} className="text-slate-800 hover:text-brand-700 dark:text-slate-100">
                    {order.sellerName}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('products', order); }} className="text-left text-slate-600 hover:text-brand-700 dark:text-slate-300">
                    {order.lineItems.length > 1 ? `${order.lineItems[0].productName} +${order.lineItems.length - 1}` : order.productList}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('quantity', order); }} className="font-semibold text-brand-700 hover:underline">
                    {order.quantity}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('payment', order); }} className="font-semibold text-brand-700 hover:underline">
                    {formatMoney(order.amount)}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('payment', order); }}>
                    <StatusBadge value={order.paymentStatus} />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenLinked('delivery', order); }}>
                    <StatusBadge value={order.deliveryStatus} />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${riskTone[order.riskFlag] || riskTone.medium_risk}`}>
                      {order.riskFlag.replace('_', ' ')} · {order.riskScore}
                    </span>
                    {!!order.exceptionBadges.length && (
                      <p className="text-[11px] font-semibold text-rose-600">{order.exceptionBadges[0]}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <QuickMenu order={order} onAction={onAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
