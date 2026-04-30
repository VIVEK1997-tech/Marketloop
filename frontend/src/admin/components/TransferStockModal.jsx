export default function TransferStockModal({ open, batch, warehouseOptions, destination, onDestinationChange, onClose, onConfirm }) {
  if (!open || !batch) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Transfer stock for {batch.sku}</h3>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Move stock between warehouses for fulfillment balancing and near-expiry handling.</p>
        <label className="mt-6 block text-sm font-semibold text-slate-600 dark:text-slate-300">
          Destination warehouse
          <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={destination} onChange={(event) => onDestinationChange(event.target.value)}>
            {warehouseOptions.filter((option) => option !== batch.warehouse).map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">Transfer stock</button>
        </div>
      </div>
    </div>
  );
}

