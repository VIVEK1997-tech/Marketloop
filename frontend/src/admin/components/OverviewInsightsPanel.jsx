export default function OverviewInsightsPanel({ insights, onOpenModule }) {
  const section = (title, items) => (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-3 space-y-3">
        {items.length ? items.map((item) => (
          <button
            key={`${title}-${item.title}-${item.meta}`}
            type="button"
            onClick={() => item.module && onOpenModule(item.module)}
            className="w-full rounded-2xl border border-slate-100 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.meta || `${item.quantity} units · Rs. ${Math.round(item.revenue).toLocaleString('en-IN')}`}</p>
            {item.risk ? <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">{item.risk}</p> : null}
          </button>
        )) : <p className="text-sm text-slate-500 dark:text-slate-400">No matching records.</p>}
      </div>
    </div>
  );

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Overview Insights</p>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {section('Top Selling Products', insights.topProducts)}
        {section('Low Stock Alerts', insights.lowStockAlerts)}
        {section('Pending Approvals', insights.approvals)}
        {section('Overdue Invoices & Bills', insights.overdue)}
      </div>
    </div>
  );
}
