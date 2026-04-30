import { useEffect, useState } from 'react';

export default function BlockUserModal({ open, complaint, mode, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason(mode === 'block' ? 'Repeated complaint pattern flagged for manual review.' : 'Manual restoration after admin verification.');
    }
  }, [open, mode]);

  if (!open || !complaint) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{mode === 'block' ? 'Block or suspend account' : 'Restore account access'}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {complaint.againstName} · {complaint.againstRole}
        </p>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          placeholder="Add the moderation reason..."
        />
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${mode === 'block' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {mode === 'block' ? 'Apply restriction' : 'Restore access'}
          </button>
        </div>
      </div>
    </div>
  );
}
