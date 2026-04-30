import { formatAdminDate } from '../active/activeUtils.js';

export default function AuditLogTable({ rows, onEntityClick, onFieldClick, onActorClick }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Entity</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Field</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Old Value</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">New Value</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Updated By</th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Updated At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                <td className="px-4 py-4">
                  <button type="button" onClick={() => onEntityClick(log)} className="font-black text-brand-700 hover:underline">{log.entity}</button>
                  <p className="mt-1 text-xs text-slate-500">{log.entityId}</p>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={() => onFieldClick(log.field)} className="font-semibold text-slate-700 hover:text-brand-700 dark:text-slate-200">{log.field}</button>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{log.oldValue}</td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{log.newValue}</td>
                <td className="px-4 py-4">
                  <button type="button" onClick={() => onActorClick(log.updatedBy)} className="font-semibold text-brand-700 hover:underline">{log.updatedBy}</button>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatAdminDate(log.updatedAt, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
