import { qualityGradeOptions, qualityStatusOptions } from '../quality/qualityUtils.js';

const inputClassName = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export default function QualityFilters({ filters, options, onChange, onReset }) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5">
      <input
        className={`${inputClassName} xl:col-span-2`}
        placeholder="Search by inspection ID, product, supplier, batch, inspector, warehouse, or remarks..."
        value={filters.search}
        onChange={(event) => onChange('search', event.target.value)}
      />
      <select className={inputClassName} value={filters.grade} onChange={(event) => onChange('grade', event.target.value)}>
        {qualityGradeOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All grades' : option}</option>)}
      </select>
      <select className={inputClassName} value={filters.inspectionStatus} onChange={(event) => onChange('inspectionStatus', event.target.value)}>
        {qualityStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All statuses' : option}</option>)}
      </select>
      <select className={inputClassName} value={filters.category} onChange={(event) => onChange('category', event.target.value)}>
        <option value="all">All categories</option>
        {options.categories.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.supplier} onChange={(event) => onChange('supplier', event.target.value)}>
        <option value="all">All suppliers</option>
        {options.suppliers.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.warehouse} onChange={(event) => onChange('warehouse', event.target.value)}>
        <option value="all">All warehouses</option>
        {options.warehouses.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.region} onChange={(event) => onChange('region', event.target.value)}>
        <option value="all">All regions</option>
        {options.regions.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <input className={inputClassName} type="number" min="0" max="5" step="0.1" placeholder="Freshness min" value={filters.freshnessMin} onChange={(event) => onChange('freshnessMin', event.target.value)} />
      <input className={inputClassName} type="number" min="0" max="5" step="0.1" placeholder="Freshness max" value={filters.freshnessMax} onChange={(event) => onChange('freshnessMax', event.target.value)} />
      <input className={inputClassName} type="number" min="0" placeholder="Shelf life min" value={filters.shelfLifeMin} onChange={(event) => onChange('shelfLifeMin', event.target.value)} />
      <input className={inputClassName} type="number" min="0" placeholder="Shelf life max" value={filters.shelfLifeMax} onChange={(event) => onChange('shelfLifeMax', event.target.value)} />
      <input className={inputClassName} type="number" min="0" max="100" step="0.1" placeholder="Damage <= %" value={filters.damageThreshold} onChange={(event) => onChange('damageThreshold', event.target.value)} />
      <input className={inputClassName} type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} />
      <div className="flex gap-3 xl:col-span-2">
        <input className={`${inputClassName} flex-1`} type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} />
        <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Reset
        </button>
      </div>
    </div>
  );
}

