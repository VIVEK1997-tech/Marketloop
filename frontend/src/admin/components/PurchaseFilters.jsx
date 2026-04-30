import { purchaseStatusOptions, paymentStatusOptions, deliveryStatusOptions } from '../purchases/purchaseUtils.js';

const selectClassName = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';
const inputClassName = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export default function PurchaseFilters({ filters, supplierOptions, onChange, onReset }) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5">
      <input className={`${inputClassName} xl:col-span-2`} placeholder="Search purchase ID, supplier, product, invoice..." value={filters.search} onChange={(event) => onChange('search', event.target.value)} />
      <select className={selectClassName} value={filters.purchaseStatus} onChange={(event) => onChange('purchaseStatus', event.target.value)}>
        {purchaseStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All purchase statuses' : option}</option>)}
      </select>
      <select className={selectClassName} value={filters.paymentStatus} onChange={(event) => onChange('paymentStatus', event.target.value)}>
        {paymentStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All bill statuses' : option}</option>)}
      </select>
      <select className={selectClassName} value={filters.deliveryStatus} onChange={(event) => onChange('deliveryStatus', event.target.value)}>
        {deliveryStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All delivery states' : option}</option>)}
      </select>
      <select className={selectClassName} value={filters.supplier} onChange={(event) => onChange('supplier', event.target.value)}>
        <option value="all">All suppliers</option>
        {supplierOptions.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <input className={inputClassName} type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} />
      <input className={inputClassName} type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} />
      <input className={inputClassName} type="number" placeholder="Min cost" value={filters.costMin} onChange={(event) => onChange('costMin', event.target.value)} />
      <div className="flex gap-3">
        <input className={`${inputClassName} flex-1`} type="number" placeholder="Max cost" value={filters.costMax} onChange={(event) => onChange('costMax', event.target.value)} />
        <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Reset</button>
      </div>
    </div>
  );
}

