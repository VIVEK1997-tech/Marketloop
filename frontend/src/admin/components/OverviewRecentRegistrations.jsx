export default function OverviewRecentRegistrations({ items, onOpenModule }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Recent Registrations</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <button key={`${item.title}-${item.meta}`} type="button" onClick={() => onOpenModule(item.module)} className="w-full rounded-2xl border border-slate-100 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.meta}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
