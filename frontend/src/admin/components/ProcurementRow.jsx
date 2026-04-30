const StatusPill = ({ value }) => {
  const tone =
    value === 'Approved' || value === 'Fully Received' || value === 'Closed'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'Rejected' || value === 'Archived'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
        : value === 'Partially Received'
          ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
};

const RiskPill = ({ show }) =>
  show ? (
    <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
      Needs review
    </span>
  ) : null;

export default function ProcurementRow({
  row,
  selected,
  active,
  onSelect,
  onOpen,
  onAction
}) {
  return (
    <tr
      onClick={() => onOpen(row)}
      className={`cursor-pointer border-t border-slate-100 transition hover:bg-cyan-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''} ${active ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
    >
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onSelect(row.id)} />
      </td>
      <td className="px-4 py-4 font-black text-emerald-700">{row.procurementId}</td>
      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">{row.supplier}</td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900 dark:text-slate-100">{row.requestTitle}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.category}</p>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-2">
          <StatusPill value={row.status} />
          <RiskPill show={row.isRisk} />
        </div>
      </td>
      <td className="px-4 py-4">{row.quantityPlan} {row.unit}</td>
      <td className="px-4 py-4">{row.expectedQty} / {row.actualQty} {row.unit}</td>
      <td className="px-4 py-4">{row.qualityScore.toFixed(1)}</td>
      <td className="px-4 py-4">{row.rejectionRate.toFixed(1)}%</td>
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <select
          aria-label={`Actions for ${row.procurementId}`}
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
          <option value="edit">Edit request</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="duplicate">Duplicate</option>
          <option value="archive">Archive</option>
        </select>
      </td>
    </tr>
  );
}

