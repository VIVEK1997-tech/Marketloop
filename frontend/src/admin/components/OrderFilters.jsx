import { Filter, RotateCcw, Search } from 'lucide-react';
import { deliveryStatusOptions, disputeStatusOptions, orderStatusOptions, paymentStatusOptions, refundStatusOptions, riskOptions } from '../orders/orderUtils.js';

export default function OrderFilters({ filters, onChange, onReset }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-[1.45fr_repeat(5,minmax(0,1fr))]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 dark:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search order, buyer, seller, product, tracking, transaction"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.paymentStatus} onChange={(event) => onChange('paymentStatus', event.target.value)}>
          {paymentStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All payment statuses' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.deliveryStatus} onChange={(event) => onChange('deliveryStatus', event.target.value)}>
          {deliveryStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All delivery statuses' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.orderStatus} onChange={(event) => onChange('orderStatus', event.target.value)}>
          {orderStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All order statuses' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.refundStatus} onChange={(event) => onChange('refundStatus', event.target.value)}>
          {refundStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All refunds' : option}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.disputeStatus} onChange={(event) => onChange('disputeStatus', event.target.value)}>
          {disputeStatusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All disputes' : option}</option>)}
        </select>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[repeat(6,minmax(0,1fr))_auto]">
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.risk} onChange={(event) => onChange('risk', event.target.value)}>
          {riskOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All risk bands' : option.replace('_', ' ')}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.suspicious} onChange={(event) => onChange('suspicious', event.target.value)}>
          <option value="all">All review flags</option>
          <option value="flagged">Flagged only</option>
          <option value="clean">Not flagged</option>
        </select>
        <input value={filters.amountMin} onChange={(event) => onChange('amountMin', event.target.value)} placeholder="Min amount" className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <input value={filters.amountMax} onChange={(event) => onChange('amountMax', event.target.value)} placeholder="Max amount" className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <input value={filters.buyer} onChange={(event) => onChange('buyer', event.target.value)} placeholder="Buyer name" className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <input value={filters.seller} onChange={(event) => onChange('seller', event.target.value)} placeholder="Seller name" className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
          <input type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
        <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
          <Filter size={14} />
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
