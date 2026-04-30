import QualityGradeBadge from './QualityGradeBadge.jsx';

const StatusPill = ({ value }) => {
  const tone =
    value === 'Approved for Sale'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'Discount Sale'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        : value === 'Rejected' || value === 'Archived'
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
          : value === 'Quarantined'
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
};

const RiskPill = ({ show }) =>
  show ? (
    <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
      Risk
    </span>
  ) : null;

export default function QualityRow({ row, selected, active, onSelect, onOpen, onAction }) {
  return (
    <tr
      onClick={() => onOpen(row)}
      className={`cursor-pointer border-t border-slate-100 transition hover:bg-cyan-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''} ${active ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
    >
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onSelect(row.id)} />
      </td>
      <td className="px-4 py-4 font-black text-emerald-700">{row.inspectionId}</td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900 dark:text-slate-100">{row.product}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.category}</p>
      </td>
      <td className="px-4 py-4">{row.supplier}</td>
      <td className="px-4 py-4">{row.batchCode}</td>
      <td className="px-4 py-4">
        <div className="space-y-2">
          <QualityGradeBadge value={row.grade} />
          <RiskPill show={row.isRisk} />
        </div>
      </td>
      <td className="px-4 py-4">{row.freshnessScore.toFixed(1)} / 5</td>
      <td className="px-4 py-4">{row.shelfLifeDays} days</td>
      <td className="px-4 py-4">
        <div className="space-y-2">
          <p className="max-w-[220px] text-sm text-slate-600 dark:text-slate-300">{row.remarks}</p>
          <StatusPill value={row.inspectionStatus} />
        </div>
      </td>
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <select
          aria-label={`Actions for ${row.inspectionId}`}
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
          <option value="edit">Edit inspection</option>
          <option value="update_grade">Update grade</option>
          <option value="approve">Approve</option>
          <option value="discount">Discount sale</option>
          <option value="reject">Reject</option>
          <option value="quarantine">Quarantine</option>
          <option value="archive">Archive</option>
        </select>
      </td>
    </tr>
  );
}

