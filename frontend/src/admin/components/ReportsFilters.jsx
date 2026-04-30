import { reportStatusOptions } from '../reports/reportsUtils.js';

const inputClassName = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export default function ReportsFilters({ filters, options, onChange, onReset }) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5">
      <input className={`${inputClassName} xl:col-span-2`} placeholder="Search report, category, owner, status, format..." value={filters.search} onChange={(event) => onChange('search', event.target.value)} />
      <select className={inputClassName} value={filters.category} onChange={(event) => onChange('category', event.target.value)}>
        <option value="all">All categories</option>
        {options.categories.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
        {reportStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All statuses' : option}</option>)}
      </select>
      <select className={inputClassName} value={filters.format} onChange={(event) => onChange('format', event.target.value)}>
        <option value="all">All formats</option>
        {options.formats.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.ownerAdmin} onChange={(event) => onChange('ownerAdmin', event.target.value)}>
        <option value="all">All owners</option>
        {options.owners.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.scheduleFrequency} onChange={(event) => onChange('scheduleFrequency', event.target.value)}>
        <option value="all">All schedules</option>
        {options.frequencies.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.visibility} onChange={(event) => onChange('visibility', event.target.value)}>
        <option value="all">All visibility</option>
        {options.visibilities.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <input className={inputClassName} type="date" value={filters.lastRunFrom} onChange={(event) => onChange('lastRunFrom', event.target.value)} />
      <input className={inputClassName} type="date" value={filters.lastRunTo} onChange={(event) => onChange('lastRunTo', event.target.value)} />
      <div className="flex flex-wrap gap-2 xl:col-span-2">
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" checked={filters.scheduledOnly} onChange={(event) => onChange('scheduledOnly', event.target.checked)} />
          Scheduled only
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" checked={filters.failedOnly} onChange={(event) => onChange('failedOnly', event.target.checked)} />
          Failed only
        </label>
      </div>
      <div className="xl:col-span-2">
        <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Reset filters
        </button>
      </div>
    </div>
  );
}
