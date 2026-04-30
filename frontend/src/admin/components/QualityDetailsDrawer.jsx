import { X } from 'lucide-react';
import { formatQualityDate } from '../quality/qualityUtils.js';
import AuditLogPanel from './AuditLogPanel.jsx';
import QualityGradeBadge from './QualityGradeBadge.jsx';

const StatusPill = ({ value }) => {
  const tone =
    value === 'Approved for Sale'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'Discount Sale'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        : value === 'Rejected' || value === 'Archived'
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
          : value === 'Quarantined'
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

export default function QualityDetailsDrawer({ inspection, open, onClose, onAction }) {
  if (!open || !inspection) return null;

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/45">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Quality inspection</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{inspection.inspectionId}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <QualityGradeBadge value={inspection.grade} />
              <StatusPill value={inspection.inspectionStatus} />
              {inspection.isRisk ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">Risk flagged</span> : null}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Inspection details</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow label="Product" value={inspection.product} />
                <InfoRow label="Supplier" value={inspection.supplier} />
                <InfoRow label="Batch" value={inspection.batchCode} />
                <InfoRow label="Category" value={inspection.category} />
                <InfoRow label="Warehouse" value={inspection.warehouse} />
                <InfoRow label="Region" value={inspection.region} />
                <InfoRow label="Inspector" value={inspection.inspectorName} />
                <InfoRow label="Priority" value={inspection.priority} />
                <InfoRow label="Freshness" value={`${inspection.freshnessScore.toFixed(1)} / 5`} />
                <InfoRow label="Shelf life" value={`${inspection.shelfLifeDays} days`} />
                <InfoRow label="Damage %" value={`${inspection.damagePercentage.toFixed(1)}%`} />
                <InfoRow label="Temperature" value={`${inspection.temperatureReading.toFixed(1)}°C`} />
                <InfoRow label="Moisture" value={`${inspection.moistureLevel.toFixed(1)}%`} />
                <InfoRow label="Expiry date" value={formatQualityDate(inspection.expiryDate)} />
                <InfoRow label="Created" value={formatQualityDate(inspection.createdAt)} />
                <InfoRow label="Inspected" value={formatQualityDate(inspection.inspectedAt)} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['approve', 'Approve for sale'],
                  ['discount', 'Discount sale'],
                  ['reject', 'Reject'],
                  ['quarantine', 'Quarantine'],
                  ['update_grade', 'Update grade'],
                  ['edit', 'Edit inspection']
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => onAction(key, inspection)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950">
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Notes</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{inspection.adminNotes}</p>
                {inspection.rejectionReason ? (
                  <>
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Rejection reason</p>
                    <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{inspection.rejectionReason}</p>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quality timeline</p>
            <div className="mt-4 space-y-4">
              {inspection.timeline.map((entry) => (
                <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.action}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.detail}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{entry.actor} · {formatQualityDate(entry.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>

          <AuditLogPanel title="Inspection audit log" entries={inspection.auditLog} />
        </div>
      </div>
    </div>
  );
}

