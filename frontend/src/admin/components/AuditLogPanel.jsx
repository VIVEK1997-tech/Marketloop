import { formatAdminDate } from '../products/productUtils.js';

export default function AuditLogPanel({ rows, entries, title = 'Audit Log' }) {
  const items = rows || entries || [];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="mt-4 space-y-4">
        {items.map((entry) => (
          <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-200">{entry.action}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
              {entry.actor} · {formatAdminDate(entry.createdAt || entry.timestamp)}
            </p>
            {entry.detail ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.detail}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
