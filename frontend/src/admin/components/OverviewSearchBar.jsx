import { Search } from 'lucide-react';

export default function OverviewSearchBar({ value, onChange, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
        <Search size={16} className="text-slate-400" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search buyers, sellers, orders, invoices, risks..."
        />
      </div>
      <button type="button" onClick={onRefresh} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
        Refresh dashboard
      </button>
    </div>
  );
}
