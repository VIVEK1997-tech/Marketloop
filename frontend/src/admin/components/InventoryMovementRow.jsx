import { formatInventoryDate } from '../inventory/inventoryUtils.js';

export default function InventoryMovementRow({ row }) {
  const tone =
    row.type === 'Inward'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : row.type === 'Wastage' || row.type === 'Adjustment'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
        : row.type === 'Transfer'
          ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';

  return (
    <tr className="border-t border-slate-100 dark:border-slate-800">
      <td className="px-4 py-4 font-black text-emerald-700">{row.movementId}</td>
      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{row.type}</span></td>
      <td className="px-4 py-4">{row.item}</td>
      <td className="px-4 py-4">{row.quantity} {row.unit}</td>
      <td className="px-4 py-4">{row.location}</td>
      <td className="px-4 py-4">{formatInventoryDate(row.date)}</td>
    </tr>
  );
}

