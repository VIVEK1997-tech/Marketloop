const toneMap = {
  UPI: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  'Bank Transfer': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  Wallet: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Card: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Cash: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Cheque: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  Manual: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
};

export default function PaymentModeBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${toneMap[value] || toneMap.Manual}`}>
      {value}
    </span>
  );
}
