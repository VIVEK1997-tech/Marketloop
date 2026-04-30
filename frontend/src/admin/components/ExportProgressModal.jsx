export default function ExportProgressModal({ open, progress, isRunning, downloadReady, onDownload, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Export Progress</p>
        <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{downloadReady ? 'ZIP placeholder ready' : 'Generating ZIP placeholder'}</h3>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{progress}% complete</p>
        <div className="mt-6 flex justify-end gap-3">
          {!isRunning && (
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
              Close
            </button>
          )}
          {downloadReady && (
            <button type="button" onClick={onDownload} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Download ZIP placeholder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
