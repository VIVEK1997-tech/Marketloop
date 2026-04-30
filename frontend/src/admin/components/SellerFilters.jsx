import { Filter, RotateCcw, Search } from 'lucide-react';
import { productOptions, ratingOptions, revenueOptions, riskOptions, verificationOptions } from '../sellers/sellerUtils.js';

export default function SellerFilters({ filters, cityOptions, onChange, onReset }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(6,minmax(0,1fr))]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 dark:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search by seller ID, store, email, or location"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.verification} onChange={(event) => onChange('verification', event.target.value)}>
          {verificationOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All verification' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.rating} onChange={(event) => onChange('rating', event.target.value)}>
          {ratingOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All ratings' : option.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.revenue} onChange={(event) => onChange('revenue', event.target.value)}>
          {revenueOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All revenue' : option.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.products} onChange={(event) => onChange('products', event.target.value)}>
          {productOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All product counts' : option.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.city} onChange={(event) => onChange('city', event.target.value)}>
          <option value="all">All cities</option>
          {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.risk} onChange={(event) => onChange('risk', event.target.value)}>
          {riskOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All risk bands' : option.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
          <Filter size={14} />
          <RotateCcw size={14} />
          Reset filters
        </button>
      </div>
    </div>
  );
}
