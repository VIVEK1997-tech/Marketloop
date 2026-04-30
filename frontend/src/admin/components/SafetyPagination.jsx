import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { safetyRowsPerPage } from '../safety/safetyUtils.js';

export default function SafetyPagination({
  label,
  currentPage,
  totalPages,
  totalRows,
  start,
  end,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {start}-{end} of {totalRows.toLocaleString('en-IN')} {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={rowsPerPage}
          onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {safetyRowsPerPage.map((value) => (
            <option key={value} value={value}>{value} / page</option>
          ))}
        </select>
        <div className="inline-flex items-center gap-1">
          <button type="button" onClick={() => onPageChange(1)} disabled={currentPage === 1} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700">
            <ChevronsLeft size={16} />
          </button>
          <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700">
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700">
            <ChevronRight size={16} />
          </button>
          <button type="button" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700">
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
