const toneMap = {
  Unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  'Partially Paid': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Overdue: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  'Invoice Missing': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'Payment Scheduled': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'Bill Ready': 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  'Bill Review': 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  'Bill Approved': 'bg-lime-100 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300'
};

export default function BillStatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${toneMap[value] || toneMap.Unpaid}`}>
      {value}
    </span>
  );
}

