export default function OverviewRiskPanel({ risks, health, onOpenModule, onReviewRisk }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Business Health</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{health.score}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{health.band}</p>
        </div>
        <button type="button" onClick={onReviewRisk} className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-amber-900/50 dark:text-amber-300">
          Mark risk reviewed
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {risks.map((risk) => (
          <button key={risk.id} type="button" onClick={() => onOpenModule(risk.module)} className="w-full rounded-2xl border border-slate-100 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{risk.title}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${risk.level === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                {risk.level}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{risk.detail}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
