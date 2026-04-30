import { invoiceStatusOptions, invoiceTypeOptions } from '../invoices/invoiceUtils.js';

const inputClassName = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export default function InvoiceFilters({ filters, options, onChange, onReset }) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5">
      <input className={`${inputClassName} xl:col-span-2`} placeholder="Search invoice ID, linked record, party, GSTIN, status, owner..." value={filters.search} onChange={(event) => onChange('search', event.target.value)} />
      <select className={inputClassName} value={filters.type} onChange={(event) => onChange('type', event.target.value)}>
        {invoiceTypeOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All invoice types' : option}</option>)}
      </select>
      <select className={inputClassName} value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
        {invoiceStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All statuses' : option}</option>)}
      </select>
      <select className={inputClassName} value={filters.partyType} onChange={(event) => onChange('partyType', event.target.value)}>
        <option value="all">All party types</option>
        {options.partyTypes.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.paymentMethod} onChange={(event) => onChange('paymentMethod', event.target.value)}>
        <option value="all">All payment methods</option>
        {options.paymentMethods.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select className={inputClassName} value={filters.taxType} onChange={(event) => onChange('taxType', event.target.value)}>
        <option value="all">All tax types</option>
        {options.taxTypes.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <input className={inputClassName} type="date" value={filters.issueFrom} onChange={(event) => onChange('issueFrom', event.target.value)} />
      <input className={inputClassName} type="date" value={filters.issueTo} onChange={(event) => onChange('issueTo', event.target.value)} />
      <input className={inputClassName} type="date" value={filters.dueFrom} onChange={(event) => onChange('dueFrom', event.target.value)} />
      <input className={inputClassName} type="date" value={filters.dueTo} onChange={(event) => onChange('dueTo', event.target.value)} />
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" checked={filters.overdueOnly} onChange={(event) => onChange('overdueOnly', event.target.checked)} />
          Overdue only
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" checked={filters.unpaidOnly} onChange={(event) => onChange('unpaidOnly', event.target.checked)} />
          Unpaid only
        </label>
      </div>
      <input className={inputClassName} type="number" placeholder="Amount min" value={filters.amountMin} onChange={(event) => onChange('amountMin', event.target.value)} />
      <div className="flex gap-3 xl:col-span-2">
        <input className={`${inputClassName} flex-1`} type="number" placeholder="Amount max" value={filters.amountMax} onChange={(event) => onChange('amountMax', event.target.value)} />
        <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Reset
        </button>
      </div>
    </div>
  );
}

