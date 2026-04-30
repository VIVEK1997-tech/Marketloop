import NotificationRow from './NotificationRow.jsx';

export default function NotificationTable({
  rows,
  selectedIds,
  onToggleSelect,
  onSelectAllPage,
  onOpen,
  onQuickStatus,
  onViewLinked,
  onEscalate
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onSelectAllPage(rows.map((row) => row.id), !allSelected)}
                aria-label="Select all alerts on page"
              />
            </th>
            <th className="px-4 py-4">Alert</th>
            <th className="px-4 py-4">Details</th>
            <th className="px-4 py-4">Level</th>
            <th className="px-4 py-4">Assigned / Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <NotificationRow
              key={row.id}
              row={row}
              selected={selectedIds.has(row.id)}
              onToggleSelect={onToggleSelect}
              onOpen={onOpen}
              onQuickStatus={onQuickStatus}
              onViewLinked={onViewLinked}
              onEscalate={onEscalate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
