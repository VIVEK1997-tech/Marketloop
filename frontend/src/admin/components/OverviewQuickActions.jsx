export default function OverviewQuickActions({ actions }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Quick Actions</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <button key={action.id} type="button" onClick={action.action} className="rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{action.label}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Open {action.module} workflow</p>
          </button>
        ))}
      </div>
    </div>
  );
}
