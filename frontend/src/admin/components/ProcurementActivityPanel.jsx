import { formatProcurementDate } from '../procurement/procurementUtils.js';

export default function ProcurementActivityPanel({ items }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Activity log</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent procurement admin actions and planning changes.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {items.length} events
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.action}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                {item.procurementId}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
              {item.actor} · {formatProcurementDate(item.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

