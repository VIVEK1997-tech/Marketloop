import ComplaintStatusBadge from './ComplaintStatusBadge.jsx';
import { formatSafetyDate } from '../safety/safetyUtils.js';

const severityClasses = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Medium: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
};

export default function ComplaintRow({
  row,
  selected,
  onToggleSelect,
  onOpen,
  onStatusAction,
  onBlockAction
}) {
  return (
    <tr
      className={`cursor-pointer border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : ''}`}
      onClick={() => onOpen(row)}
    >
      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(row.id)} aria-label={`Select ${row.complaintId}`} />
      </td>
      <td className="px-4 py-3">
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(row); }} className="text-left">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{row.complaintType}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.complaintId}</p>
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <p>{row.againstName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.againstRole}</p>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-2">
          <button type="button" onClick={(event) => { event.stopPropagation(); onStatusAction(row); }} className="block">
            <ComplaintStatusBadge status={row.status} />
          </button>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${severityClasses[row.severity] || severityClasses.Low}`}>
            {row.severity}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <p>{row.notes}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {row.isBlocked && (
            <button type="button" onClick={(event) => { event.stopPropagation(); onBlockAction(row, 'unblock'); }} className="font-semibold text-rose-700 dark:text-rose-300">
              Blocked
            </button>
          )}
          {row.isSuspended && <span className="font-semibold text-violet-700 dark:text-violet-300">Suspended</span>}
          <span>{formatSafetyDate(row.updatedAt)}</span>
        </div>
      </td>
    </tr>
  );
}
