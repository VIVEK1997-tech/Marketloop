export default function MetricCard({ item }) {
  const toneClass =
    item.tone === 'emerald' ? 'from-emerald-500/12 to-emerald-50 dark:from-emerald-400/10 dark:to-slate-900' :
    item.tone === 'amber' ? 'from-amber-500/12 to-amber-50 dark:from-amber-400/10 dark:to-slate-900' :
    item.tone === 'rose' ? 'from-rose-500/12 to-rose-50 dark:from-rose-400/10 dark:to-slate-900' :
    item.tone === 'violet' ? 'from-violet-500/12 to-violet-50 dark:from-violet-400/10 dark:to-slate-900' :
    'from-cyan-500/12 to-cyan-50 dark:from-cyan-400/10 dark:to-slate-900';

  return (
    <div className={`rounded-[1.5rem] border border-slate-200 bg-gradient-to-br p-4 shadow-sm dark:border-slate-800 dark:shadow-none ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
      <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">{item.value}</p>
    </div>
  );
}
