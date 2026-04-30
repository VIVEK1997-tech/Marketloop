import { Download, FileArchive, FileText, RefreshCcw } from 'lucide-react';

const actions = [
  { key: 'generate', label: 'Generate Reports & Exports', icon: RefreshCcw, tone: 'primary' },
  { key: 'preview', label: 'Generate Report Preview', icon: FileText },
  { key: 'csv', label: 'Download CSV', icon: Download },
  { key: 'zip', label: 'Download ZIP', icon: FileArchive }
];

export default function ReportsToolbar({ onAction }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            onClick={() => onAction(action.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              action.tone === 'primary'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={16} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
