const toneMap = {
  Ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Queued: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Running: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  Failed: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  Scheduled: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  Archived: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
};

export default function ReportStatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${toneMap[value] || toneMap.Ready}`}>
      {value}
    </span>
  );
}
