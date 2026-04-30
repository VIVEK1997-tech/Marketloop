export default function OverviewRecentRecords({ records, onOpenModule }) {
  const blocks = [
    { label: 'Recent Buyers', items: records.buyers, field: 'name', meta: (row) => `${row.location} · ${row.status}`, module: 'buyers' },
    { label: 'Recent Sellers', items: records.sellers, field: 'storeName', meta: (row) => `${row.location} · ${row.status}`, module: 'sellers' },
    { label: 'Recent Orders', items: records.orders, field: 'orderId', meta: (row) => `${row.buyerName} · ${row.orderStatus}`, module: 'orders' },
    { label: 'Recent Invoices', items: records.invoices, field: 'invoiceId', meta: (row) => `${row.partyName} · ${row.status}`, module: 'invoices' }
  ];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Recent Records</p>
      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.label}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{block.label}</p>
            <div className="mt-3 space-y-3">
              {block.items.map((row) => (
                <button key={row.id || row[block.field]} type="button" onClick={() => onOpenModule(block.module)} className="w-full rounded-2xl border border-slate-100 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{row[block.field]}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{block.meta(row)}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
