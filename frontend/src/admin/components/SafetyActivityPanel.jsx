import { formatSafetyDate } from '../safety/safetyUtils.js';

export default function SafetyActivityPanel({ rows }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Activity Log</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent admin actions across alerts, complaints, and support cases.</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.action}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.actor} · {item.recordId}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.note}</p>
              </div>
              <span className="text-xs text-slate-400">{formatSafetyDate(item.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
