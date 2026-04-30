import { formatDate, formatMoney } from '../purchases/purchaseUtils.js';
import PurchaseStatusBadge from './PurchaseStatusBadge.jsx';
import BillStatusBadge from './BillStatusBadge.jsx';
import SupplierScoreBadge from './SupplierScoreBadge.jsx';
import RiskFlagBadge from './RiskFlagBadge.jsx';
import PurchaseActions from './PurchaseActions.jsx';

export default function PurchaseTable({ rows, selectedIds, onToggleSelect, onToggleSelectPage, onOpenPurchase, onAction, activeId }) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-4">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleSelectPage(rows)} />
              </th>
              {['Purchase ID', 'Supplier', 'Product', 'Quantity', 'Rate', 'Total Cost', 'Status', 'Bill', 'Expected Delivery', 'Payment Status', 'Actions'].map((label) => (
                <th key={label} className="px-4 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((purchase) => {
              const selected = selectedIds.has(purchase.id);
              const isActive = activeId === purchase.id;
              return (
                <tr
                  key={purchase.id}
                  onClick={() => onOpenPurchase(purchase)}
                  className={`cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''} ${isActive ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
                >
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selected} onChange={() => onToggleSelect(purchase.id)} />
                  </td>
                  <td className="px-4 py-4 font-black text-emerald-700">{purchase.purchaseId}</td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{purchase.supplierName}</p>
                      <div className="mt-2">
                        <SupplierScoreBadge score={purchase.supplierScore} band={purchase.supplierScoreBand} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{purchase.productName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{purchase.category}</p>
                  </td>
                  <td className="px-4 py-4">{purchase.quantityOrdered} {purchase.unit}</td>
                  <td className="px-4 py-4">{formatMoney(purchase.rate)}</td>
                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">{formatMoney(purchase.totalCost)}</td>
                  <td className="px-4 py-4"><PurchaseStatusBadge value={purchase.purchaseStatus} /></td>
                  <td className="px-4 py-4"><BillStatusBadge value={purchase.billStatus} /></td>
                  <td className="px-4 py-4">{formatDate(purchase.expectedDeliveryDate)}</td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <BillStatusBadge value={purchase.paymentStatus} />
                      {purchase.riskFlags[0] && <RiskFlagBadge value={purchase.riskFlags[0]} />}
                    </div>
                  </td>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <PurchaseActions purchase={purchase} onAction={onAction} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

