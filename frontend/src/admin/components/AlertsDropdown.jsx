import { ArrowRight, CheckCheck, ChevronLeft, ExternalLink, X } from 'lucide-react';
import AlertLevelBadge from './AlertLevelBadge.jsx';
import ComplaintStatusBadge from './ComplaintStatusBadge.jsx';
import { formatSafetyDate } from '../safety/safetyUtils.js';

export default function AlertsDropdown({
  open,
  alerts,
  selectedAlert,
  onClose,
  onViewDetails,
  onBack,
  onAcknowledge,
  onResolve,
  onDismiss,
  onOpenModule,
  onViewAll
}) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-14 z-50 w-full max-w-xl rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Alerts</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent unresolved signals from safety, payments, inventory, and quality.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
          <X size={16} />
        </button>
      </div>

      {selectedAlert ? (
        <div className="mt-4 space-y-4">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <ChevronLeft size={16} />
            Back to alerts
          </button>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <AlertLevelBadge level={selectedAlert.level} />
              <ComplaintStatusBadge status={selectedAlert.status} />
            </div>
            <h3 className="mt-3 text-lg font-black text-slate-900 dark:text-slate-100">{selectedAlert.alertTitle}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{selectedAlert.details}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Source:</span> {selectedAlert.sourceModule}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Linked:</span> {selectedAlert.linkedRecordType} · {selectedAlert.linkedRecordId}</p>
              <p><span className="font-semibold text-slate-900 dark:text-slate-100">Updated:</span> {formatSafetyDate(selectedAlert.timestamp)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onAcknowledge(selectedAlert.id)} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Acknowledge</button>
            <button type="button" onClick={() => onResolve(selectedAlert.id)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Resolve</button>
            <button type="button" onClick={() => onDismiss(selectedAlert.id)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Dismiss</button>
            <button type="button" onClick={() => onOpenModule(selectedAlert.sourceModule)} className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-300">
              Open related module
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {alerts.length ? alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => onViewDetails(alert.id)}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{alert.alertTitle}</p>
                    <AlertLevelBadge level={alert.level} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{alert.sourceModule} · {alert.status}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatSafetyDate(alert.timestamp)}</p>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            </button>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No unresolved alerts right now.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button type="button" onClick={onViewAll} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCheck size={16} />
              View all alerts
            </button>
            <button type="button" onClick={() => alerts[0] && onOpenModule(alerts[0].sourceModule)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <ExternalLink size={16} />
              Open related module
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
