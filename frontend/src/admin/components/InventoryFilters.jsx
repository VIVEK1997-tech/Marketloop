import { freshnessOptions } from '../inventory/inventoryUtils.js';

const inputClassName = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export default function InventoryFilters({ filters, options, onChange, onReset }) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5">
      <input className={`${inputClassName} xl:col-span-2`} placeholder="Search SKU, product, warehouse, supplier, batch, freshness, notes..." value={filters.search} onChange={(event) => onChange('search', event.target.value)} />
      <select className={inputClassName} value={filters.freshness} onChange={(event) => onChange('freshness', event.target.value)}>
        {freshnessOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All freshness' : option}</option>)}
      </select>
      <select className={inputClassName} value={filters.warehouse} onChange={(event) => onChange('warehouse', event.target.value)}>
        <option value="all">All warehouses</option>
        {options.warehouses.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.category} onChange={(event) => onChange('category', event.target.value)}>
        <option value="all">All categories</option>
        {options.categories.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.supplier} onChange={(event) => onChange('supplier', event.target.value)}>
        <option value="all">All suppliers</option>
        {options.suppliers.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.buyerStatus} onChange={(event) => onChange('buyerStatus', event.target.value)}>
        <option value="all">All buyer-side states</option>
        {options.buyerStatuses.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.sellerStatus} onChange={(event) => onChange('sellerStatus', event.target.value)}>
        <option value="all">All seller-side states</option>
        {options.sellerStatuses.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <input className={inputClassName} type="date" value={filters.expiryFrom} onChange={(event) => onChange('expiryFrom', event.target.value)} />
      <input className={inputClassName} type="date" value={filters.expiryTo} onChange={(event) => onChange('expiryTo', event.target.value)} />
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" checked={filters.lowStockOnly} onChange={(event) => onChange('lowStockOnly', event.target.checked)} />
          Low stock
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" checked={filters.damagedOnly} onChange={(event) => onChange('damagedOnly', event.target.checked)} />
          Damaged only
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" checked={filters.nearExpiryOnly} onChange={(event) => onChange('nearExpiryOnly', event.target.checked)} />
          Near expiry
        </label>
      </div>
      <input className={inputClassName} type="number" placeholder="Available min" value={filters.availableMin} onChange={(event) => onChange('availableMin', event.target.value)} />
      <input className={inputClassName} type="number" placeholder="Available max" value={filters.availableMax} onChange={(event) => onChange('availableMax', event.target.value)} />
      <input className={inputClassName} type="number" placeholder="Margin min %" value={filters.marginMin} onChange={(event) => onChange('marginMin', event.target.value)} />
      <div className="flex gap-3 xl:col-span-2">
        <input className={`${inputClassName} flex-1`} type="number" placeholder="Margin max %" value={filters.marginMax} onChange={(event) => onChange('marginMax', event.target.value)} />
        <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Reset
        </button>
      </div>
    </div>
  );
}

