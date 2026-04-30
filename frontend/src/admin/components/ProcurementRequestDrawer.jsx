import { X } from 'lucide-react';
import { formatProcurementDate } from '../procurement/procurementUtils.js';
import AuditLogPanel from './AuditLogPanel.jsx';

const StatusPill = ({ value }) => {
  const tone =
    value === 'Approved' || value === 'Fully Received' || value === 'Closed'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'Rejected' || value === 'Archived'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
        : value === 'Partially Received'
          ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

export default function ProcurementRequestDrawer({ request, open, onClose, onAction }) {
  if (!open || !request) return null;

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/45">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Procurement request</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{request.procurementId}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill value={request.status} />
              <StatusPill value={request.priority} />
              {request.isRisk ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{request.riskLevel}</span> : null}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Request details</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow label="Supplier" value={request.supplier} />
                <InfoRow label="Request" value={request.requestTitle} />
                <InfoRow label="Category" value={request.category} />
                <InfoRow label="Region" value={request.region} />
                <InfoRow label="Assigned admin" value={request.assignedAdmin} />
                <InfoRow label="Quantity plan" value={`${request.quantityPlan} ${request.unit}`} />
                <InfoRow label="Expected vs actual" value={`${request.expectedQty} / ${request.actualQty} ${request.unit}`} />
                <InfoRow label="Expected delivery" value={formatProcurementDate(request.expectedDeliveryDate)} />
                <InfoRow label="Quality score" value={request.qualityScore.toFixed(1)} />
                <InfoRow label="Rejection rate" value={`${request.rejectionRate.toFixed(1)}%`} />
                <InfoRow label="Created at" value={formatProcurementDate(request.createdAt)} />
                <InfoRow label="Updated at" value={formatProcurementDate(request.updatedAt)} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['approve', 'Approve'],
                  ['partial', 'Mark partial'],
                  ['reject', 'Reject'],
                  ['duplicate', 'Duplicate'],
                  ['archive', 'Archive']
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => onAction(key, request)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950">
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Notes</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{request.notes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Mini timeline</p>
            <div className="mt-4 space-y-4">
              {request.timeline.map((entry) => (
                <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.action}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.detail}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                    {entry.actor} · {formatProcurementDate(entry.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <AuditLogPanel title="Procurement audit log" entries={request.auditTrail} />
        </div>
      </div>
    </div>
  );
}

