import { Download, Flag, RefreshCcw, ShieldCheck, StickyNote } from 'lucide-react';

const ActionButton = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
      disabled
        ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default function TransactionActions({ selectedCount, onAction }) {
  const disabled = selectedCount === 0;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Bulk transaction controls</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedCount} transactions selected</p>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        <ActionButton icon={ShieldCheck} label="Mark reviewed" disabled={disabled} onClick={() => onAction('review')} />
        <ActionButton icon={ShieldCheck} label="Approve refunds" disabled={disabled} onClick={() => onAction('approve_refund')} />
        <ActionButton icon={RefreshCcw} label="Retry failed" disabled={disabled} onClick={() => onAction('retry')} />
        <ActionButton icon={Flag} label="Flag suspicious" disabled={disabled} onClick={() => onAction('flag')} />
        <ActionButton icon={StickyNote} label="Add admin note" disabled={disabled} onClick={() => onAction('note')} />
        <ActionButton icon={Download} label="Export selected" disabled={disabled} onClick={() => onAction('export')} />
      </div>
    </div>
  );
}
