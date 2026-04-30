import { ChevronDown } from 'lucide-react';

const actions = [
  ['approve', 'Approve purchase'],
  ['cancel', 'Cancel purchase'],
  ['ordered', 'Mark as ordered'],
  ['received', 'Mark as received'],
  ['partial', 'Mark partially received'],
  ['quality', 'Mark quality checked'],
  ['bill_paid', 'Mark bill paid'],
  ['bill_unpaid', 'Mark bill unpaid'],
  ['invoice', 'Upload invoice placeholder'],
  ['note', 'Add admin note'],
  ['export', 'Export purchase']
];

export default function PurchaseActions({ onAction, purchase }) {
  return (
    <div className="relative">
      <select
        aria-label={`Actions for ${purchase.purchaseId}`}
        className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        defaultValue=""
        onChange={(event) => {
          if (!event.target.value) return;
          onAction(event.target.value, purchase);
          event.target.value = '';
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <option value="" disabled>Actions</option>
        {actions.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

