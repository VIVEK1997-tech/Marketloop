import { MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import QualityBadge from './QualityBadge.jsx';
import HealthScoreBadge from './HealthScoreBadge.jsx';
import VendorTrustBadge from './VendorTrustBadge.jsx';
import { formatAdminDate, formatMoney } from '../products/productUtils.js';

function ActionMenu({ product, onAction }) {
  const actions = [
    ['approve', 'Approve product'],
    ['reject', 'Reject product'],
    ['edit', 'Edit listing'],
    ['out_of_stock', 'Mark out-of-stock'],
    ['archive', 'Archive product'],
    ['feature', 'Feature product'],
    ['restock', 'Request vendor restock'],
    ['verify_organic', 'Verify organic status'],
    ['quality', 'Change quality tag'],
    ['note', 'Add admin note'],
    ['flag', 'Flag suspicious listing']
  ];
  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <MoreHorizontal size={18} />
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {actions.map(([key, label]) => (
          <button key={key} type="button" onClick={() => onAction(key, product)} className="flex w-full rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

export default function ProductTable({ rows, selectedIds, onToggleSelect, onToggleSelectPage, onOpenProduct, onAction, activeId }) {
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" checked={allOnPageSelected} onChange={() => onToggleSelectPage(rows)} /></th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Product</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Category</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Price</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Unit</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Stock</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Quality</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Organic</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Approval</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Vendor</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Health Score</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Last Updated</th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em] text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((product) => (
              <tr key={product.id} className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-950/50 ${activeId === product.id ? 'bg-emerald-50/60 dark:bg-emerald-950/10' : ''}`} onClick={() => onOpenProduct(product)}>
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => onToggleSelect(product.id)} />
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-brand-700">{product.productName}</p>
                  <p className="mt-1 text-xs text-slate-500">{product.sku}</p>
                </td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{product.category}</td>
                <td className="px-4 py-4 font-semibold">{formatMoney(product.price)}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{product.unit}</td>
                <td className="px-4 py-4 font-semibold">{product.stock}</td>
                <td className="px-4 py-4"><QualityBadge value={product.quality} /></td>
                <td className="px-4 py-4"><StatusBadge value={product.organic ? 'Verified' : 'Inactive'} /></td>
                <td className="px-4 py-4"><StatusBadge value={product.approvalStatus} /></td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{product.vendorName}</p>
                  <div className="mt-1"><VendorTrustBadge value={product.vendorTrustLevel} /></div>
                </td>
                <td className="px-4 py-4"><HealthScoreBadge score={product.healthScore} band={product.healthBand} /></td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatAdminDate(product.updatedAt)}</td>
                <td className="px-4 py-4 text-right"><ActionMenu product={product} onAction={onAction} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
