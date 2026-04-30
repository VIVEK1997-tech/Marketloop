import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { rowsPerPageOptions } from '../products/productUtils.js';

export default function ProductPagination({ start, end, total, rowsPerPage, currentPage, totalPages, onRowsPerPageChange, onPageChange }) {
  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  for (let page = startPage; page <= endPage; page += 1) pages.push(page);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">Showing {start}-{end} of {total.toLocaleString('en-IN')} products</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Rows per page
          <select className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={rowsPerPage} onChange={(event) => onRowsPerPageChange(Number(event.target.value))}>
            {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(1)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700"><ChevronsLeft size={14} /></button>
          <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Previous</button>
          {pages.map((page) => (
            <button key={page} type="button" onClick={() => onPageChange(page)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${page === currentPage ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>
              {page}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Next</button>
          <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700"><ChevronsRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
