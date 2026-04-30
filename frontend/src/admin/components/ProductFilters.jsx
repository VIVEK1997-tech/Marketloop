import { Filter, RotateCcw, Search } from 'lucide-react';
import { approvalOptions, lifecycleOptions, organicOptions, qualityOptions, stockOptions } from '../products/productUtils.js';

export default function ProductFilters({ filters, categoryOptions, vendorOptions, onChange, onReset }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 dark:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search product, category, vendor, or SKU"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.approval} onChange={(event) => onChange('approval', event.target.value)}>
          {approvalOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All approvals' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.stock} onChange={(event) => onChange('stock', event.target.value)}>
          {stockOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All stock states' : option.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.organic} onChange={(event) => onChange('organic', event.target.value)}>
          {organicOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All organic states' : option.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.quality} onChange={(event) => onChange('quality', event.target.value)}>
          {qualityOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All quality tags' : option}</option>)}
        </select>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.category} onChange={(event) => onChange('category', event.target.value)}>
          <option value="all">All categories</option>
          {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.vendor} onChange={(event) => onChange('vendor', event.target.value)}>
          <option value="all">All vendors</option>
          {vendorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.lifecycle} onChange={(event) => onChange('lifecycle', event.target.value)}>
          {lifecycleOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All lifecycle states' : option}</option>)}
        </select>
        <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
          <Filter size={14} />
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
