import { useEffect, useState } from 'react';

export default function ResolveComplaintModal({ open, complaint, onClose, onConfirm }) {
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    if (open) setResolution('Resolved after admin review and case follow-up.');
  }, [open]);

  if (!open || !complaint) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Resolve Complaint</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {complaint.complaintId} · {complaint.complaintType}
        </p>
        <textarea
          value={resolution}
          onChange={(event) => setResolution(event.target.value)}
          rows={4}
          className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          placeholder="Add resolution notes..."
        />
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
            Cancel
          </button>
          <button type="button" onClick={() => onConfirm(resolution)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Save resolution
          </button>
        </div>
      </div>
    </div>
  );
}
