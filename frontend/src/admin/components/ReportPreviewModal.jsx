import { X } from 'lucide-react';
import { formatReportDate } from '../reports/reportsUtils.js';

export default function ReportPreviewModal({ open, report, onClose }) {
  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-5xl rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Report preview</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{report.reportName}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{report.reportCategory} - {report.dateRange}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Generated timestamp</p>
            <p className="text-sm font-black text-slate-900 dark:text-slate-100">{formatReportDate(report.lastRunAt || new Date().toISOString())}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                {Object.keys(report.previewRows[0] || {}).map((key) => (
                  <th key={key} className="px-4 py-3">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.previewRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                  {Object.values(row).map((value, index) => (
                    <td key={`${row.id}-${index}`} className="px-4 py-3">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
