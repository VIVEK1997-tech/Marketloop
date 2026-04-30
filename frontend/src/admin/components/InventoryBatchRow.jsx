import QualityGradeBadge from './QualityGradeBadge.jsx';
import { formatInventoryDate } from '../inventory/inventoryUtils.js';

const RiskPill = ({ flags }) => (
  flags.length ? (
    <div className="mt-2 flex flex-wrap gap-1">
      {flags.slice(0, 2).map((flag) => (
        <span key={flag} className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {flag}
        </span>
      ))}
    </div>
  ) : null
);

export default function InventoryBatchRow({ row, selected, active, onSelect, onOpen, onAction }) {
  return (
    <tr
      onClick={() => onOpen(row)}
      className={`cursor-pointer border-t border-slate-100 transition hover:bg-cyan-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''} ${active ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
    >
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onSelect(row.id)} />
      </td>
      <td className="px-4 py-4 font-black text-emerald-700">{row.sku}</td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900 dark:text-slate-100">{row.product}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.batchCode}</p>
      </td>
      <td className="px-4 py-4">{row.warehouse}</td>
      <td className="px-4 py-4 font-bold">{row.availableQty} {row.unit}</td>
      <td className="px-4 py-4">{row.incomingQty} {row.unit}</td>
      <td className="px-4 py-4">{row.damagedQty} {row.unit}</td>
      <td className="px-4 py-4">
        <QualityGradeBadge value={row.freshnessGrade} />
        <RiskPill flags={row.riskFlags} />
      </td>
      <td className="px-4 py-4">{formatInventoryDate(row.expiryDate)}</td>
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <select
          aria-label={`Actions for ${row.sku}`}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          defaultValue=""
          onChange={(event) => {
            if (!event.target.value) return;
            onAction(event.target.value, row);
            event.target.value = '';
          }}
        >
          <option value="" disabled>Actions</option>
          <option value="receive">Receive stock</option>
          <option value="reserve">Reserve stock</option>
          <option value="release">Release reserved</option>
          <option value="sold">Mark sold</option>
          <option value="damaged">Mark damaged</option>
          <option value="return">Return supplier</option>
          <option value="discount">Discount sale</option>
          <option value="reorder">Create reorder</option>
          <option value="adjust">Adjust stock</option>
          <option value="transfer">Transfer stock</option>
        </select>
      </td>
    </tr>
  );
}

