const statusClasses = {
  Open: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  'In Review': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Escalated: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Rejected: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Blocked: 'bg-rose-200 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200',
  Suspended: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
};

export default function ComplaintStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${statusClasses[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
      {status}
    </span>
  );
}
