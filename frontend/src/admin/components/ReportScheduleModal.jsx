import { useMemo, useState } from 'react';

export default function ReportScheduleModal({ open, report, frequency, nextRun, onFrequencyChange, onNextRunChange, onClose, onConfirm }) {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => {
    if (!report) return '';
    if (frequency !== 'None' && !nextRun) return 'Next scheduled run is required when scheduling is enabled.';
    return '';
  }, [frequency, nextRun, report]);

  if (!open || !report) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Schedule {report.reportName}</h3>
        <div className="mt-6 grid gap-4">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Frequency
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={frequency} onChange={(event) => onFrequencyChange(event.target.value)}>
              {['None', 'Daily', 'Weekly', 'Monthly'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Next scheduled run
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" type="datetime-local" value={nextRun} onChange={(event) => onNextRunChange(event.target.value)} />
          </label>
          {touched && validation ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {validation}
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (!validation) onConfirm();
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save schedule
          </button>
        </div>
      </div>
    </div>
  );
}
