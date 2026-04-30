import { ChevronDown, ChevronUp, Copy, MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatAdminDate, formatMoney } from '../sellers/sellerUtils.js';

function SortButton({ active, direction, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 font-black uppercase tracking-[0.14em] text-slate-400">
      {label}
      {active ? (direction === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null}
    </button>
  );
}

function ModerateMenu({ seller, onModerate }) {
  const options = [
    ['activate', 'Activate seller'],
    ['deactivate', 'Deactivate seller'],
    ['kyc_pending', 'Mark KYC Pending'],
    ['suspend', 'Suspend seller'],
    ['blacklist', 'Blacklist seller'],
    ['approve_kyc', 'Approve KYC'],
    ['reject_kyc', 'Reject KYC'],
    ['manual_review', 'Flag for manual review']
  ];

  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <MoreHorizontal size={18} />
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {options.map(([key, label]) => (
          <button key={key} type="button" onClick={() => onModerate(key, seller)} className="flex w-full rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

const riskLabel = {
  low_risk: 'Low Risk',
  medium_risk: 'Medium Risk',
  high_risk: 'High Risk'
};

export default function SellerTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  onOpenSeller,
  onOpenSection,
  onEmailAction,
  onModerate,
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
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Seller ID</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Store</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Email</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Location</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Verification</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Status</th>
              <th className="px-4 py-3 text-left"><SortButton label="Products" active={sortBy === 'products'} direction={sortDirection} onClick={() => onSort('products')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="Revenue" active={sortBy === 'revenue'} direction={sortDirection} onClick={() => onSort('revenue')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="Rating" active={sortBy === 'rating'} direction={sortDirection} onClick={() => onSort('rating')} /></th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Risk</th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em] text-slate-400">Moderate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((seller) => (
              <tr
                key={seller.id}
                className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-950/50 ${seller.riskBand === 'high_risk' ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}`}
                onClick={() => onOpenSeller(seller)}
              >
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(seller.id)} onChange={() => onToggleSelect(seller.id)} />
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenSeller(seller); }} className="font-black text-brand-700 hover:underline">
                    {seller.id}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenSection(seller, 'profile'); }} className="font-black text-slate-900 hover:text-brand-700 dark:text-slate-100">
                    {seller.storeName}
                  </button>
                  <p className="mt-1 text-xs text-slate-500">{seller.ownerName}</p>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onEmailAction(seller); }} className="inline-flex items-center gap-2 text-slate-600 hover:text-brand-700 dark:text-slate-300">
                    {seller.email}
                    <Copy size={13} />
                  </button>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{seller.location}</td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenSection(seller, 'kyc'); }}>
                    <StatusBadge value={seller.verificationStatus} />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenSection(seller, 'status'); }}>
                    <StatusBadge value={seller.status} />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenSection(seller, 'products'); }} className="font-semibold text-brand-700 hover:underline">
                    {seller.productCount}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenSection(seller, 'revenue'); }} className="font-semibold text-brand-700 hover:underline">
                    {formatMoney(seller.revenue)}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{seller.rating}</span>
                  <p className="mt-1 text-xs text-slate-500">{formatAdminDate(seller.createdAt)}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                    seller.riskBand === 'high_risk'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : seller.riskBand === 'medium_risk'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}>
                    {riskLabel[seller.riskBand]} · {seller.riskScore}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <ModerateMenu seller={seller} onModerate={onModerate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
