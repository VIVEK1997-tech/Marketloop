const CheckRow = ({ label, checked }) => (
  <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 dark:bg-slate-950">
    <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${checked ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
      {checked ? 'Ready' : 'Pending'}
    </span>
  </div>
);

export default function BillReadinessPanel({ purchase }) {
  if (!purchase) return null;
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Bill readiness</p>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${purchase.billReady ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
          {purchase.billReady ? 'Bill ready for payment' : 'Action required'}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        <CheckRow label="Invoice uploaded" checked={purchase.billReadinessChecks.invoiceUploaded} />
        <CheckRow label="Invoice matched" checked={purchase.billReadinessChecks.invoiceMatched} />
        <CheckRow label="Receiving completed" checked={purchase.billReadinessChecks.receivingComplete} />
        <CheckRow label="Quality check passed" checked={purchase.billReadinessChecks.qualityPassed} />
      </div>
    </div>
  );
}

