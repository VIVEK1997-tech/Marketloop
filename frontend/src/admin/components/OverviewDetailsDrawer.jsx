import { X } from 'lucide-react';

export default function OverviewDetailsDrawer({ card, onClose, onGoToModule, onQuickAction }) {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/30 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Metric Details</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{card.label}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.value}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => onGoToModule(card.module)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Go to module
          </button>
          <button type="button" onClick={() => onQuickAction(card)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
            Export selected records
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Related Records</p>
          <div className="mt-4 space-y-3">
            {card.records.length ? card.records.map((record, index) => (
              <div key={record.id || index} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {record.name || record.storeName || record.orderId || record.invoiceId || record.billId || record.product || record.requestTitle || record.supplierName || record.inspectionId || record.alertTitle || record.reportName}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {record.email || record.location || record.status || record.orderStatus || record.partyName || record.supplier || record.warehouse || record.sellerName || record.level || record.reportCategory || record.notes}
                </p>
              </div>
            )) : <p className="text-sm text-slate-500 dark:text-slate-400">No related records for the current filters.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
