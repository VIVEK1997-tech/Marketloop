import { CheckCircle2, Download, ShieldMinus, ShieldPlus, Trash2, UserX } from 'lucide-react';

const ActionButton = ({ icon: Icon, label, onClick, disabled, danger = false }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
      disabled
        ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        : danger
          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default function BuyerBulkActions({ selectedCount, onAction }) {
  const disabled = selectedCount === 0;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Bulk actions</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedCount} buyer{selectedCount === 1 ? '' : 's'} selected across pages</p>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        <ActionButton icon={ShieldPlus} label="Activate selected" disabled={disabled} onClick={() => onAction('activate')} />
        <ActionButton icon={UserX} label="Deactivate selected" disabled={disabled} onClick={() => onAction('deactivate')} />
        <ActionButton icon={ShieldMinus} label="Block selected" disabled={disabled} onClick={() => onAction('block')} />
        <ActionButton icon={CheckCircle2} label="Verify selected" disabled={disabled} onClick={() => onAction('verify')} />
        <ActionButton icon={Download} label="Export selected" disabled={disabled} onClick={() => onAction('export')} />
        <ActionButton icon={Trash2} label="Delete selected" disabled={disabled} onClick={() => onAction('delete')} danger />
      </div>
    </div>
  );
}
