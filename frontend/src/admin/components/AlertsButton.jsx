import { BellRing } from 'lucide-react';
import HeaderActionBadge from './HeaderActionBadge.jsx';

export default function AlertsButton({ count, onClick }) {
  return (
    <button
      type="button"
      aria-label={`${count} unresolved alerts`}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <BellRing size={16} />
      <span>{count} Alerts</span>
      <HeaderActionBadge value={count} tone={count >= 3 ? 'danger' : count > 0 ? 'warning' : 'success'} />
    </button>
  );
}
