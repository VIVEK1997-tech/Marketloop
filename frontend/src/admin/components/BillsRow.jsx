import BillStatusBadge from './BillStatusBadge.jsx';
import PaymentModeBadge from './PaymentModeBadge.jsx';
import { formatBillDate, formatBillMoney } from '../bills/billsUtils.js';

const RiskPill = ({ value }) =>
  value === 'Normal' ? null : (
    <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${
      value === 'Overdue'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300'
        : value === 'Due Soon'
          ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
          : 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300'
    }`}>
      {value}
    </span>
  );

export default function BillsRow({ row, selected, active, onSelect, onOpen, onAction }) {
  return (
    <tr
      onClick={() => onOpen(row)}
      className={`cursor-pointer border-t border-slate-100 transition hover:bg-cyan-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''} ${active ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
    >
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onSelect(row.id)} />
      </td>
      <td className="px-4 py-4 font-black text-emerald-700">
        <div>
          <p>{row.billId}</p>
          <RiskPill value={row.dueRisk} />
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900 dark:text-slate-100">{row.linkedInvoiceId}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.linkedPurchaseOrderId}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900 dark:text-slate-100">{row.supplierName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.supplierGstin}</p>
      </td>
      <td className="px-4 py-4 font-bold">{formatBillMoney(row.grandTotal)}</td>
      <td className="px-4 py-4">
        <div className="inline-flex flex-col rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <span>Tax {formatBillMoney(row.taxAmount)}</span>
          <span>CGST {formatBillMoney(row.cgst)}</span>
          <span>SGST {formatBillMoney(row.sgst)}</span>
          <span>IGST {formatBillMoney(row.igst)}</span>
        </div>
      </td>
      <td className="px-4 py-4">{formatBillDate(row.dueDate)}</td>
      <td className="px-4 py-4"><PaymentModeBadge value={row.paymentMode} /></td>
      <td className="px-4 py-4"><BillStatusBadge value={row.status} /></td>
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <select
          aria-label={`Actions for ${row.billId}`}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          defaultValue=""
          onChange={(event) => {
            if (!event.target.value) return;
            onAction(event.target.value, row);
            event.target.value = '';
          }}
        >
          <option value="" disabled>Actions</option>
          <option value="view">View details</option>
          <option value="edit">Edit bill</option>
          <option value="pay">Pay bill</option>
          <option value="partial">Record partial payment</option>
          <option value="paid">Mark as paid</option>
          <option value="reminder">Send reminder</option>
          <option value="duplicate">Duplicate bill</option>
          <option value="cancel">Cancel bill</option>
          <option value="archive">Archive</option>
          <option value="download">Download receipt placeholder</option>
        </select>
      </td>
    </tr>
  );
}
