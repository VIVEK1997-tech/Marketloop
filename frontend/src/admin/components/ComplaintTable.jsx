import ComplaintRow from './ComplaintRow.jsx';

export default function ComplaintTable({
  rows,
  selectedIds,
  onToggleSelect,
  onSelectAllPage,
  onOpen,
  onStatusAction,
  onBlockAction
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
                aria-label="Select all complaints on page"
              />
            </th>
            <th className="px-4 py-4">Complaint Type</th>
            <th className="px-4 py-4">Against</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ComplaintRow
              key={row.id}
              row={row}
              selected={selectedIds.has(row.id)}
              onToggleSelect={onToggleSelect}
              onOpen={onOpen}
              onStatusAction={onStatusAction}
              onBlockAction={onBlockAction}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
