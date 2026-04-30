import { reportsRowsPerPage } from '../reports/reportsUtils.js';

export default function ReportsPagination({
  currentPage,
  totalPages,
  total,
  start,
  end,
  rowsPerPage,
  onRowsPerPageChange,
  onPageChange
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Showing {start}-{end} of {total.toLocaleString('en-IN')} reports</p>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Page {currentPage} of {totalPages}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Rows
          <select className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={rowsPerPage} onChange={(event) => onRowsPerPageChange(Number(event.target.value))}>
            {reportsRowsPerPage.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onPageChange(1)} disabled={currentPage === 1} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">First</button>
          <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Previous</button>
          <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Next</button>
          <button type="button" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Last</button>
        </div>
      </div>
    </div>
  );
}
