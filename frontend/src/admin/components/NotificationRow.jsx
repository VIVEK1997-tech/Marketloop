import AlertLevelBadge from './AlertLevelBadge.jsx';
import ComplaintStatusBadge from './ComplaintStatusBadge.jsx';
import { formatSafetyDate } from '../safety/safetyUtils.js';

export default function NotificationRow({
  row,
  selected,
  onToggleSelect,
  onOpen,
  onQuickStatus,
  onViewLinked,
  onEscalate
}) {
  return (
    <tr
      className={`cursor-pointer border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : ''}`}
      onClick={() => onOpen(row)}
    >
      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(row.id)} aria-label={`Select ${row.alertId}`} />
      </td>
      <td className="px-4 py-3">
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(row); }} className="text-left">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{row.alertTitle}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.alertId}</p>
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <p>{row.details}</p>
        <button type="button" onClick={(event) => { event.stopPropagation(); onViewLinked(row); }} className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {row.linkedRecordType}: {row.linkedRecordId}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-2">
          <AlertLevelBadge level={row.level} />
          <button type="button" onClick={(event) => { event.stopPropagation(); onQuickStatus(row); }} className="block">
            <ComplaintStatusBadge status={row.status} />
          </button>
          {['Critical', 'Danger'].includes(row.level) && (
            <button type="button" onClick={(event) => { event.stopPropagation(); onEscalate(row); }} className="block text-xs font-semibold text-rose-700 dark:text-rose-300">
              Escalate risk
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        <p>{row.assignedAdmin}</p>
        <p>{formatSafetyDate(row.createdAt)}</p>
      </td>
    </tr>
  );
}
