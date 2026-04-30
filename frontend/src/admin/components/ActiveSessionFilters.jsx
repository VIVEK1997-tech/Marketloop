import { Filter, RotateCcw, Search } from 'lucide-react';
import { kycOptions, riskOptions, roleOptions, sessionTypeOptions, stateOptions, suspiciousOptions, watchlistOptions } from '../active/activeUtils.js';

export default function ActiveSessionFilters({ filters, deviceOptions, onChange, onReset }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 dark:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search by user, email, phone, device, or IP"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.role} onChange={(event) => onChange('role', event.target.value)}>
          {roleOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All roles' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.state} onChange={(event) => onChange('state', event.target.value)}>
          {stateOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All states' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.sessionType} onChange={(event) => onChange('sessionType', event.target.value)}>
          {sessionTypeOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All session types' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.kyc} onChange={(event) => onChange('kyc', event.target.value)}>
          {kycOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All KYC states' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.risk} onChange={(event) => onChange('risk', event.target.value)}>
          {riskOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All risk bands' : option.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.device} onChange={(event) => onChange('device', event.target.value)}>
          <option value="all">All devices</option>
          {deviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.watchlist} onChange={(event) => onChange('watchlist', event.target.value)}>
          {watchlistOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.suspicious} onChange={(event) => onChange('suspicious', event.target.value)}>
          {suspiciousOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.online} onChange={(event) => onChange('online', event.target.value)}>
          <option value="all">All presence</option>
          <option value="online">Online only</option>
          <option value="offline">Offline only</option>
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
