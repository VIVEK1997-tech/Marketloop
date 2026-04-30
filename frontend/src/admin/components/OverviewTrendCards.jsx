const renderBars = (rows, formatter) => (
  <div className="mt-4 flex h-32 items-end gap-2">
    {rows.map((item) => {
      const maxValue = Math.max(...rows.map((entry) => entry.value), 1);
      return (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <div className="w-full rounded-2xl bg-emerald-500" style={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }} title={formatter(item.value)} />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</span>
        </div>
      );
    })}
  </div>
);

export default function OverviewTrendCards({ trends }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Order Trend</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Six-period order volume trend across the marketplace.</p>
        {renderBars(trends.orderTrend, (value) => value.toLocaleString('en-IN'))}
      </div>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Revenue Trend</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Six-period gross sales trend derived from sample orders.</p>
        {renderBars(trends.revenueTrend, (value) => `Rs. ${Math.round(value).toLocaleString('en-IN')}`)}
      </div>
    </div>
  );
}
