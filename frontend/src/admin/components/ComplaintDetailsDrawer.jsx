import { X } from 'lucide-react';
import ComplaintStatusBadge from './ComplaintStatusBadge.jsx';
import { formatSafetyDate } from '../safety/safetyUtils.js';

const severityClasses = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Medium: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
};

export default function ComplaintDetailsDrawer({ complaint, onClose, onAction }) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/30 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Complaint Details</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{complaint.complaintType}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{complaint.complaintId}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ComplaintStatusBadge status={complaint.status} />
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${severityClasses[complaint.severity] || severityClasses.Low}`}>
            {complaint.severity}
          </span>
          {complaint.isBlocked && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">Blocked</span>}
          {complaint.isSuspended && <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">Suspended</span>}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Raised By</p>
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{complaint.raisedBy}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{complaint.raisedByRole}</p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-slate-100">Assigned admin:</span> {complaint.assignedAdmin}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-slate-100">Evidence:</span> {complaint.evidenceCount} attachments</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Against</p>
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{complaint.againstName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{complaint.againstRole}</p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-slate-100">Linked order:</span> {complaint.linkedOrderId}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-slate-100">Linked payment:</span> {complaint.linkedPaymentId}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Case Notes</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{complaint.notes}</p>
          {complaint.resolutionNotes && (
            <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300"><span className="font-semibold">Resolution:</span> {complaint.resolutionNotes}</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => onAction('resolve', complaint)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Resolve</button>
          <button type="button" onClick={() => onAction('reject', complaint)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Reject</button>
          <button type="button" onClick={() => onAction('escalate', complaint)} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Escalate</button>
          <button type="button" onClick={() => onAction(complaint.isBlocked ? 'unblock' : 'block', complaint)} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:text-rose-300">
            {complaint.isBlocked ? 'Unblock user' : 'Block user'}
          </button>
          <button type="button" onClick={() => onAction(complaint.isSuspended ? 'restore' : 'suspend', complaint)} className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 dark:border-violet-900/50 dark:text-violet-300">
            {complaint.isSuspended ? 'Restore user' : 'Suspend user'}
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Complaint Timeline</p>
          <div className="mt-4 space-y-3">
            {complaint.timeline.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.action}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.actor}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatSafetyDate(item.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
