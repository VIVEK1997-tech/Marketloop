import TaxBreakdownBadge from './TaxBreakdownBadge.jsx';
import { formatInvoiceDate, formatInvoiceMoney } from '../invoices/invoiceUtils.js';

const StatusPill = ({ value }) => {
  const tone =
    value === 'Paid'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'Partially Paid'
        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
        : value === 'Overdue'
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
          : value === 'Cancelled'
            ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            : value === 'Draft'
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
};

export default function InvoiceRow({ row, selected, active, onSelect, onOpen, onAction }) {
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
          <p>{row.invoiceId}</p>
          {row.isOverdueRisk ? <span className="mt-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">Overdue risk</span> : null}
        </div>
      </td>
      <td className="px-4 py-4 capitalize">{row.type}</td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900 dark:text-slate-100">{row.linkedRecordId}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.linkedRecordType}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900 dark:text-slate-100">{row.partyName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.partyType}</p>
      </td>
      <td className="px-4 py-4 font-bold">{formatInvoiceMoney(row.grandTotal)}</td>
      <td className="px-4 py-4"><TaxBreakdownBadge invoice={row} /></td>
      <td className="px-4 py-4">{formatInvoiceDate(row.issueDate)}</td>
      <td className="px-4 py-4">{formatInvoiceDate(row.dueDate)}</td>
      <td className="px-4 py-4"><StatusPill value={row.status} /></td>
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <select
          aria-label={`Actions for ${row.invoiceId}`}
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
          <option value="edit">Edit invoice</option>
          <option value="preview">Generate preview</option>
          <option value="payment">Record payment</option>
          <option value="reminder">Send reminder</option>
          <option value="duplicate">Duplicate invoice</option>
          <option value="cancel">Cancel invoice</option>
          <option value="download">Download PDF placeholder</option>
          <option value="archive">Archive</option>
        </select>
      </td>
    </tr>
  );
}

