export default function ReceivingWorkflowPanel({ purchase }) {
  if (!purchase) return null;
  const rows = [
    ['Ordered quantity', `${purchase.quantityOrdered} ${purchase.unit}`],
    ['Received quantity', `${purchase.quantityReceived} ${purchase.unit}`],
    ['Damaged quantity', `${purchase.quantityDamaged} ${purchase.unit}`],
    ['Pending quantity', `${purchase.quantityPending} ${purchase.unit}`]
  ];

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Receiving workflow</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-3 dark:bg-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

