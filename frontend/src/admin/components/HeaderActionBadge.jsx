export default function HeaderActionBadge({ value, tone = 'default' }) {
  const classes =
    tone === 'danger'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        : tone === 'success'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${classes}`}>{value}</span>;
}
