import { X } from 'lucide-react';
import AlertLevelBadge from './AlertLevelBadge.jsx';
import ComplaintStatusBadge from './ComplaintStatusBadge.jsx';
import { formatSafetyDate } from '../safety/safetyUtils.js';

export default function AlertDetailsDrawer({ alert, onClose, onAction }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/30 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Alert Details</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{alert.alertTitle}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{alert.alertId}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <AlertLevelBadge level={alert.level} />
          <ComplaintStatusBadge status={alert.status} />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">{alert.priority}</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Alert Summary</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{alert.details}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Source module:</span> {alert.sourceModule}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Assigned admin:</span> {alert.assignedAdmin}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Created:</span> {formatSafetyDate(alert.createdAt)}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Updated:</span> {formatSafetyDate(alert.updatedAt)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Linked Record</p>
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{alert.linkedRecordType}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{alert.linkedRecordId}</p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-slate-100">Recommended action:</span> {alert.recommendedAction}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => onAction('acknowledge', alert)} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Acknowledge</button>
          <button type="button" onClick={() => onAction('investigate', alert)} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Investigate</button>
          <button type="button" onClick={() => onAction('resolve', alert)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Resolve</button>
          <button type="button" onClick={() => onAction('dismiss', alert)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Dismiss</button>
          <button type="button" onClick={() => onAction('escalate', alert)} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:text-rose-300">Escalate</button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Alert Timeline</p>
          <div className="mt-4 space-y-3">
            {alert.timeline.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.action}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.actor}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatSafetyDate(item.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
