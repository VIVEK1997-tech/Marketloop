import InventoryMovementRow from './InventoryMovementRow.jsx';

export default function InventoryMovementTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              {['Movement ID', 'Type', 'Item', 'Quantity', 'Location', 'Date'].map((label) => (
                <th key={label} className="px-4 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => <InventoryMovementRow key={row.id} row={row} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

