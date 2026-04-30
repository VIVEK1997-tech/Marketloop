import { formatSafetyDate } from '../safety/safetyUtils.js';

export default function OverviewActivityFeed({ items }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Activity Feed</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.meta}</p>
              </div>
              <span className="text-xs text-slate-400">{formatSafetyDate(item.time)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
