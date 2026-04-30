import ReportStatusBadge from './ReportStatusBadge.jsx';
import ExportFormatBadge from './ExportFormatBadge.jsx';
import { formatReportDate } from '../reports/reportsUtils.js';

export default function ReportsRow({ row, selected, active, onSelect, onOpen, onAction }) {
  return (
    <tr
      onClick={() => onOpen(row)}
      className={`cursor-pointer border-t border-slate-100 transition hover:bg-cyan-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60 ${selected ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''} ${active ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
    >
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onSelect(row.id)} />
      </td>
      <td className="px-4 py-4">
        <p className="font-black text-emerald-700">{row.reportName}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{row.reportId}</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {row.formats.map((format) => <ExportFormatBadge key={`${row.id}-${format}`} value={format} />)}
        </div>
      </td>
      <td className="px-4 py-4">{formatReportDate(row.lastRunAt)}</td>
      <td className="px-4 py-4"><ReportStatusBadge value={row.status} /></td>
      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
        <select
          aria-label={`Actions for ${row.reportName}`}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          defaultValue=""
          onChange={(event) => {
            if (!event.target.value) return;
            onAction(event.target.value, row);
            event.target.value = '';
          }}
        >
          <option value="" disabled>Actions</option>
          <option value="view">View details</option>
          <option value="preview">Preview report</option>
          <option value="generate">Generate now</option>
          <option value="download_csv">Download CSV</option>
          <option value="download_pdf">Download PDF</option>
          <option value="download_zip">Download ZIP</option>
          <option value="schedule">Schedule report</option>
          <option value="duplicate">Duplicate report</option>
          <option value="archive">Archive</option>
          <option value="delete">Delete</option>
          {row.status === 'Failed' ? <option value="retry">Retry failed report</option> : null}
        </select>
      </td>
    </tr>
  );
}
