import { X } from 'lucide-react';
import { formatInventoryDate, formatMoney } from '../inventory/inventoryUtils.js';
import AuditLogPanel from './AuditLogPanel.jsx';
import QualityGradeBadge from './QualityGradeBadge.jsx';

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

const StatusPill = ({ value }) => (
  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">{value}</span>
);

export default function InventoryDetailsDrawer({ batch, open, onClose, onAction, movementRows }) {
  if (!open || !batch) return null;

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/45">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Inventory batch</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{batch.sku}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <QualityGradeBadge value={batch.freshnessGrade} />
              <StatusPill value={batch.buyerStatus} />
              <StatusPill value={batch.sellerStatus} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Batch details</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow label="Product" value={batch.product} />
                <InfoRow label="Category" value={batch.category} />
                <InfoRow label="Warehouse" value={batch.warehouse} />
                <InfoRow label="Supplier" value={batch.supplier} />
                <InfoRow label="Batch code" value={batch.batchCode} />
                <InfoRow label="Unit" value={batch.unit} />
                <InfoRow label="Available" value={`${batch.availableQty} ${batch.unit}`} />
                <InfoRow label="Incoming" value={`${batch.incomingQty} ${batch.unit}`} />
                <InfoRow label="Reserved" value={`${batch.reservedQty} ${batch.unit}`} />
                <InfoRow label="Sold" value={`${batch.soldQty} ${batch.unit}`} />
                <InfoRow label="Damaged" value={`${batch.damagedQty} ${batch.unit}`} />
                <InfoRow label="Returned" value={`${batch.returnedQty} ${batch.unit}`} />
                <InfoRow label="Purchase price" value={formatMoney(batch.purchasePrice)} />
                <InfoRow label="Selling price" value={formatMoney(batch.sellingPrice)} />
                <InfoRow label="Margin" value={`${batch.margin.toFixed(1)}%`} />
                <InfoRow label="Expiry" value={formatInventoryDate(batch.expiryDate)} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['receive', 'Receive stock'],
                  ['reserve', 'Reserve'],
                  ['release', 'Release'],
                  ['sold', 'Mark sold'],
                  ['damaged', 'Mark damaged'],
                  ['return', 'Return supplier'],
                  ['discount', 'Discount sale'],
                  ['reorder', 'Reorder'],
                  ['adjust', 'Adjust'],
                  ['transfer', 'Transfer']
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => onAction(key, batch)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950">
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Admin notes</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{batch.adminNotes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Movement history</p>
            <div className="mt-4 space-y-3">
              {movementRows.slice(0, 8).map((row) => (
                <div key={row.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{row.type}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{row.quantity} {row.unit} · {row.referenceType} {row.referenceId}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">{row.location}</span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">{row.adminName} · {formatInventoryDate(row.date)}</p>
                </div>
              ))}
            </div>
          </div>

          <AuditLogPanel title="Inventory audit log" entries={movementRows.slice(0, 6).map((row) => ({ id: row.id, actor: row.adminName, action: row.type, detail: row.notes, timestamp: row.date }))} />
        </div>
      </div>
    </div>
  );
}

