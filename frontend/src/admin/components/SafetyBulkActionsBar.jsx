import { BellRing, Download, ShieldBan, ShieldCheck, UserCog } from 'lucide-react';

export default function SafetyBulkActionsBar({
  selectedAlertCount,
  selectedComplaintCount,
  onAlertAction,
  onComplaintAction
}) {
  if (!selectedAlertCount && !selectedComplaintCount) return null;

  const buttonClasses = 'inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800';

  return (
    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          {selectedAlertCount ? `${selectedAlertCount} alerts selected` : ''}{selectedAlertCount && selectedComplaintCount ? ' · ' : ''}
          {selectedComplaintCount ? `${selectedComplaintCount} complaints selected` : ''}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {selectedAlertCount > 0 && (
            <>
              <button type="button" onClick={() => onAlertAction('acknowledge')} className={buttonClasses}><BellRing size={15} />Acknowledge selected</button>
              <button type="button" onClick={() => onAlertAction('resolve')} className={buttonClasses}><ShieldCheck size={15} />Resolve selected</button>
              <button type="button" onClick={() => onAlertAction('dismiss')} className={buttonClasses}><ShieldBan size={15} />Dismiss selected</button>
            </>
          )}
          {selectedComplaintCount > 0 && (
            <>
              <button type="button" onClick={() => onComplaintAction('assign')} className={buttonClasses}><UserCog size={15} />Assign selected</button>
              <button type="button" onClick={() => onComplaintAction('escalate')} className={buttonClasses}><ShieldBan size={15} />Escalate selected</button>
              <button type="button" onClick={() => onComplaintAction('resolve')} className={buttonClasses}><ShieldCheck size={15} />Resolve selected</button>
            </>
          )}
          <button type="button" onClick={() => (selectedAlertCount ? onAlertAction('export') : onComplaintAction('export'))} className={buttonClasses}>
            <Download size={15} />
            Export selected
          </button>
        </div>
      </div>
    </div>
  );
}
