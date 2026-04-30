export default function OverviewFilters({ filters, onChange, onReset }) {
  const inputClasses = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <input type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} className={inputClasses} />
      <input type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} className={inputClasses} />
      <select value={filters.module} onChange={(event) => onChange('module', event.target.value)} className={inputClasses}>
        <option value="all">All modules</option>
        <option value="buyers">Buyers</option>
        <option value="sellers">Sellers</option>
        <option value="active">Active Users</option>
        <option value="orders">Orders</option>
        <option value="purchases">Purchases</option>
        <option value="procurement">Procurement</option>
        <option value="inventory">Inventory</option>
        <option value="invoices">Invoices</option>
        <option value="bills">Bills</option>
        <option value="quality">Quality</option>
        <option value="safety">Safety</option>
        <option value="reports">Reports</option>
      </select>
      <select value={filters.riskLevel} onChange={(event) => onChange('riskLevel', event.target.value)} className={inputClasses}>
        <option value="all">All risk levels</option>
        <option value="low">Low risk</option>
        <option value="medium">Medium risk</option>
        <option value="high">High risk</option>
      </select>
      <button type="button" onClick={onReset} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
        Reset filters
      </button>
    </div>
  );
}
