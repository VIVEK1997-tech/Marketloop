import StatusBadge from './StatusBadge.jsx';

export default function AdminTable({ columns, rows, empty = 'No data available yet.' }) {
  if (!rows.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{empty}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-950">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => {
                const value = row[column.key];
                return (
                  <td key={`${row.id}-${column.key}`} className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">
                    {column.type === 'status' ? <StatusBadge value={value} /> : column.render ? column.render(value, row) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
