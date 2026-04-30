export default function BuyerSummaryCards({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
          <p className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">{metric.value}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{metric.helper}</p>
        </div>
      ))}
    </div>
  );
}
