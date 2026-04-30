import { Filter, RotateCcw, Search } from 'lucide-react';
import { methodOptions, refundOptions, statusOptions } from '../transactions/transactionUtils.js';

export default function TransactionFilters({ filters, onChange, onReset }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 dark:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search by txn, buyer, seller, order, payment reference"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
          {statusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All statuses' : option.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.method} onChange={(event) => onChange('method', event.target.value)}>
          {methodOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All methods' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.refundStatus} onChange={(event) => onChange('refundStatus', event.target.value)}>
          {refundOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All refunds' : option}</option>)}
        </select>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <input value={filters.amountMin} onChange={(event) => onChange('amountMin', event.target.value)} placeholder="Min amount" className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <input value={filters.amountMax} onChange={(event) => onChange('amountMax', event.target.value)} placeholder="Max amount" className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <input type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <input type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
          <Filter size={14} />
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
