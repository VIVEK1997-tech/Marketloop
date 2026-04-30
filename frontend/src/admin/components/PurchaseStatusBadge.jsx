const toneMap = {
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'Pending Approval': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Ordered: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'Partially Received': 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  Received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Quality Check': 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  Cancelled: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Closed: 'bg-lime-100 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300'
};

export default function PurchaseStatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${toneMap[value] || toneMap.Draft}`}>
      {value}
    </span>
  );
}

