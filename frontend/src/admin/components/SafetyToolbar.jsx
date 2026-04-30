import { BellRing, Download, FileArchive, ShieldAlert, Sparkles } from 'lucide-react';

const buttonClasses = 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition';

export default function SafetyToolbar({
  search,
  onSearchChange,
  onGenerateScan,
  onCsvExport,
  onZipExport,
  blockedCount
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
          <BellRing size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search alerts, complaints, linked records, admins..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Sparkles size={15} />
          Search, filter, sort, assign, and resolve issues quickly.
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <ShieldAlert size={16} />
          {blockedCount} blocked or suspended accounts
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onGenerateScan} className={`${buttonClasses} bg-emerald-600 text-white hover:bg-emerald-700`}>
            <Sparkles size={16} />
            Generate Safety Scan
          </button>
          <button type="button" onClick={onCsvExport} className={`${buttonClasses} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`}>
            <Download size={16} />
            Download CSV
          </button>
          <button type="button" onClick={onZipExport} className={`${buttonClasses} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`}>
            <FileArchive size={16} />
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
