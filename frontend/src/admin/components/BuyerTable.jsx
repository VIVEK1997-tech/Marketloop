import { ChevronDown, ChevronUp, Download, Eye, MoreHorizontal, ShieldMinus, ShieldPlus, Star, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatAdminDate, formatMoney } from '../buyers/buyerUtils.js';

function SortButton({ active, direction, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 font-black uppercase tracking-[0.14em] text-slate-400">
      {label}
      {active ? (direction === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null}
    </button>
  );
}

function RowMenu({ buyer, onAction }) {
  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <MoreHorizontal size={18} />
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {[
          ['view-profile', 'View profile', Eye],
          ['verify', 'Mark as verified', Star],
          ['toggle-block', buyer.status === 'blocked' ? 'Unblock buyer' : 'Block buyer', buyer.status === 'blocked' ? ShieldPlus : ShieldMinus],
          ['export', 'Export buyer data', Download],
          ['delete', 'Delete buyer', Trash2]
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => onAction(key, buyer)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${
              key === 'delete' ? 'text-rose-700 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

export default function BuyerTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  onOpenBuyer,
  onAction,
  sortBy,
  sortDirection,
  onSort
}) {
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allOnPageSelected} onChange={() => onToggleSelectPage(rows)} />
              </th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Buyer</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Email</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Phone</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Location</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Status</th>
              <th className="px-4 py-3 text-left"><SortButton label="Orders" active={sortBy === 'orders'} direction={sortDirection} onClick={() => onSort('orders')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="Total spent" active={sortBy === 'spent'} direction={sortDirection} onClick={() => onSort('spent')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="Wishlist" active={sortBy === 'wishlist'} direction={sortDirection} onClick={() => onSort('wishlist')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="Join date" active={sortBy === 'joinDate'} direction={sortDirection} onClick={() => onSort('joinDate')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="Last activity" active={sortBy === 'lastActivity'} direction={sortDirection} onClick={() => onSort('lastActivity')} /></th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em] text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((buyer) => (
              <tr key={buyer.id} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-950/50" onClick={() => onOpenBuyer(buyer)}>
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(buyer.id)} onChange={() => onToggleSelect(buyer.id)} />
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-brand-700">{buyer.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{buyer.id}</span>
                    {buyer.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{buyer.email}</td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{buyer.phone}</td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{buyer.location}</td>
                <td className="px-4 py-4"><StatusBadge value={buyer.status} /></td>
                <td className="px-4 py-4 font-semibold">{buyer.totalOrders}</td>
                <td className="px-4 py-4 font-semibold">{formatMoney(buyer.totalSpent)}</td>
                <td className="px-4 py-4 font-semibold">{buyer.wishlistCount}</td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatAdminDate(buyer.joinDate)}</td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatAdminDate(buyer.lastActivity, true)}</td>
                <td className="px-4 py-4 text-right">
                  <RowMenu buyer={buyer} onAction={onAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
