import QualityRow from './QualityRow.jsx';

export default function QualityTable({
  rows,
  selectedIds,
  activeId,
  onToggleSelect,
  onToggleSelectPage,
  onOpen,
  onAction
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-4">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleSelectPage(rows)} />
              </th>
              {['Inspection ID', 'Product', 'Supplier', 'Batch', 'Grade', 'Freshness', 'Shelf Life', 'Remarks', 'Actions'].map((label) => (
                <th key={label} className="px-4 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <QualityRow
                key={row.id}
                row={row}
                selected={selectedIds.has(row.id)}
                active={activeId === row.id}
                onSelect={onToggleSelect}
                onOpen={onOpen}
                onAction={onAction}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

