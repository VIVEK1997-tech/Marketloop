import { X } from 'lucide-react';
import { formatReportDate } from '../reports/reportsUtils.js';
import ExportFormatBadge from './ExportFormatBadge.jsx';
import ReportStatusBadge from './ReportStatusBadge.jsx';
import AuditLogPanel from './AuditLogPanel.jsx';

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

export default function ReportDetailsDrawer({ report, open, onClose, onAction }) {
  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/45">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Report details</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{report.reportName}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <ReportStatusBadge value={report.status} />
              {report.formats.map((format) => <ExportFormatBadge key={`${report.id}-${format}`} value={format} />)}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Report metadata</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow label="Report ID" value={report.reportId} />
                <InfoRow label="Category" value={report.reportCategory} />
                <InfoRow label="Owner admin" value={report.ownerAdmin} />
                <InfoRow label="Created by" value={report.createdBy} />
                <InfoRow label="Visibility" value={report.visibility} />
                <InfoRow label="Schedule" value={report.scheduleFrequency} />
                <InfoRow label="Last run" value={formatReportDate(report.lastRunAt)} />
                <InfoRow label="Next scheduled run" value={formatReportDate(report.nextScheduledRun)} />
                <InfoRow label="Date range" value={report.dateRange} />
                <InfoRow label="Total rows" value={report.totalRows.toLocaleString('en-IN')} />
                <InfoRow label="File size" value={report.fileSize} />
                <InfoRow label="Export placeholder" value={report.exportUrlPlaceholder} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['preview', 'Preview'],
                  ['generate', 'Generate now'],
                  ['schedule', 'Schedule'],
                  ['download_csv', 'CSV'],
                  ['download_pdf', 'PDF'],
                  ['download_zip', 'ZIP'],
                  ['archive', 'Archive']
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => onAction(key, report)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950">
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Notes</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{report.notes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Report timeline</p>
            <div className="mt-4 space-y-4">
              {report.timeline.map((entry) => (
                <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.action}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.detail}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{entry.actor} - {formatReportDate(entry.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>

          <AuditLogPanel title="Report activity log" entries={report.timeline.map((entry) => ({ ...entry }))} />
        </div>
      </div>
    </div>
  );
}
