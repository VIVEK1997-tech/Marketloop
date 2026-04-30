import { Filter, RotateCcw, Search } from 'lucide-react';
import { buyerStatusOptions, segmentOptions, verificationOptions } from '../buyers/buyerUtils.js';

export default function BuyerFilters({ filters, cityOptions, onChange, onReset }) {
  const toggleBoolean = (key) => onChange(key, !filters[key]);

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 dark:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search by buyer, email, phone, or location"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
          {buyerStatusOptions.map((status) => <option key={status} value={status}>{status === 'all' ? 'All statuses' : status}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.city} onChange={(event) => onChange('city', event.target.value)}>
          <option value="all">All cities</option>
          {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.verification} onChange={(event) => onChange('verification', event.target.value)}>
          {verificationOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All verification' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.segment} onChange={(event) => onChange('segment', event.target.value)}>
          {segmentOptions.map((segment) => <option key={segment} value={segment}>{segment === 'all' ? 'All segments' : segment}</option>)}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[
          ['vipOnly', 'VIP buyers'],
          ['highSpendersOnly', 'High spenders'],
          ['wishlistOnly', 'Wishlist activity']
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleBoolean(key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filters[key]
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Filter size={14} className="mr-2 inline-flex" />
            {label}
          </button>
        ))}

        <button type="button" onClick={onReset} className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
          <RotateCcw size={14} />
          Reset filters
        </button>
      </div>
    </div>
  );
}
