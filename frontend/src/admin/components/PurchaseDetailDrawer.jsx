import { X } from 'lucide-react';
import { formatDate, formatMoney } from '../purchases/purchaseUtils.js';
import PurchaseStatusBadge from './PurchaseStatusBadge.jsx';
import BillStatusBadge from './BillStatusBadge.jsx';
import SupplierScoreBadge from './SupplierScoreBadge.jsx';
import RiskFlagBadge from './RiskFlagBadge.jsx';
import ReceivingWorkflowPanel from './ReceivingWorkflowPanel.jsx';
import BillReadinessPanel from './BillReadinessPanel.jsx';
import AuditLogPanel from './AuditLogPanel.jsx';

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
  </div>
);

export default function PurchaseDetailDrawer({ purchase, open, onClose, onAction }) {
  if (!open || !purchase) return null;

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/45">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Purchase details</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{purchase.purchaseId}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <PurchaseStatusBadge value={purchase.purchaseStatus} />
              <BillStatusBadge value={purchase.paymentStatus} />
              <SupplierScoreBadge score={purchase.supplierScore} band={purchase.supplierScoreBand} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Purchase overview</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow label="Supplier" value={purchase.supplierName} />
                <InfoRow label="Contact" value={purchase.supplierContact} />
                <InfoRow label="Product" value={purchase.productName} />
                <InfoRow label="Category" value={purchase.category} />
                <InfoRow label="Invoice" value={purchase.invoiceNumber} />
                <InfoRow label="Approved by" value={purchase.approvedBy} />
                <InfoRow label="Created at" value={formatDate(purchase.createdAt)} />
                <InfoRow label="Updated at" value={formatDate(purchase.updatedAt)} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['approve', 'Approve'],
                  ['ordered', 'Mark ordered'],
                  ['received', 'Mark received'],
                  ['quality', 'Quality checked'],
                  ['bill_paid', 'Bill paid'],
                  ['invoice', 'Upload invoice'],
                  ['note', 'Add note']
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => onAction(key, purchase)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950">
                    {label}
                  </button>
                ))}
              </div>
              {purchase.riskFlags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {purchase.riskFlags.map((flag) => <RiskFlagBadge key={flag} value={flag} />)}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ReceivingWorkflowPanel purchase={purchase} />
            <BillReadinessPanel purchase={purchase} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Invoice and payment</p>
              <div className="mt-4 space-y-1">
                <InfoRow label="Rate" value={formatMoney(purchase.rate)} />
                <InfoRow label="Total cost" value={formatMoney(purchase.totalCost)} />
                <InfoRow label="Bill status" value={purchase.billStatus} />
                <InfoRow label="Payment status" value={purchase.paymentStatus} />
                <InfoRow label="Expected delivery" value={formatDate(purchase.expectedDeliveryDate)} />
                <InfoRow label="Received date" value={formatDate(purchase.receivedDate)} />
              </div>
              <div className="mt-4 space-y-2">
                {purchase.paymentHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.value}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{formatDate(entry.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Approval and notes</p>
              <div className="mt-4 space-y-2">
                {purchase.approvalHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.action}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.actor}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{formatDate(entry.timestamp)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Admin note</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{purchase.adminNote}</p>
              </div>
            </div>
          </div>

          <AuditLogPanel title="Purchase audit log" entries={purchase.auditLog} />
        </div>
      </div>
    </div>
  );
}

