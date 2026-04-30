import { X } from 'lucide-react';

export default function BulkExportModal({
  open,
  onClose,
  modules,
  contentOptions,
  form,
  error,
  estimatedRecordCount,
  onToggleModule,
  onToggleContent,
  onFieldChange,
  onStartExport,
  isRunning
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-3xl rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Bulk ZIP Export</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Prepare a cross-module export package</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose modules, export contents, and an optional date range before generating the ZIP placeholder.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isRunning} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Modules</p>
            <div className="mt-3 grid gap-3">
              {modules.map((module) => (
                <label key={module.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                  <span>
                    <span className="block font-semibold text-slate-900 dark:text-slate-100">{module.label}</span>
                    <span className="text-slate-500 dark:text-slate-400">{module.recordEstimate.toLocaleString('en-IN')} records</span>
                  </span>
                  <input type="checkbox" checked={form.modules.includes(module.id)} onChange={() => onToggleModule(module.id)} />
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Contents</p>
            <div className="mt-3 grid gap-3">
              {contentOptions.map((option) => (
                <label key={option.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{option.label}</span>
                  <input type="checkbox" checked={form.contents.includes(option.id)} onChange={() => onToggleContent(option.id)} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-600 dark:text-slate-300">
            <span className="mb-2 block font-semibold">Date from</span>
            <input type="date" value={form.dateFrom} onChange={(event) => onFieldChange('dateFrom', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-300">
            <span className="mb-2 block font-semibold">Date to</span>
            <input type="date" value={form.dateTo} onChange={(event) => onFieldChange('dateTo', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Estimated records</p>
            <p className="mt-2 text-2xl font-black text-emerald-800 dark:text-emerald-200">{estimatedRecordCount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isRunning} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
            Cancel
          </button>
          <button type="button" onClick={onStartExport} disabled={isRunning} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {isRunning ? 'Generating...' : 'Start export'}
          </button>
        </div>
      </div>
    </div>
  );
}
