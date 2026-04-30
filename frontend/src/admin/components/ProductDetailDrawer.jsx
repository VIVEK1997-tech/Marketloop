import { Archive, CheckCircle2, Flag, Leaf, PackageMinus, Pencil, RefreshCcw, Sparkles, X } from 'lucide-react';
import { formatAdminDate, formatMoney } from '../products/productUtils.js';
import QualityBadge from './QualityBadge.jsx';
import StatusBadge from './StatusBadge.jsx';
import HealthScoreBadge from './HealthScoreBadge.jsx';
import VendorTrustBadge from './VendorTrustBadge.jsx';
import AuditLogPanel from './AuditLogPanel.jsx';

const actions = [
  ['approve', 'Approve product', CheckCircle2],
  ['reject', 'Reject product', X],
  ['edit', 'Edit listing', Pencil],
  ['out_of_stock', 'Mark out-of-stock', PackageMinus],
  ['archive', 'Archive product', Archive],
  ['feature', 'Feature product', Sparkles],
  ['restock', 'Request restock', RefreshCcw],
  ['verify_organic', 'Verify organic', Leaf],
  ['quality', 'Change quality tag', RefreshCcw],
  ['note', 'Add admin note', Pencil],
  ['flag', 'Flag suspicious', Flag]
];

export default function ProductDetailDrawer({ product, open, onClose, onAction }) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Product governance</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{product.productName}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{product.sku} · {product.vendorName} · {product.category}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <img src={product.imageUrl} alt={product.productName} className="h-56 w-full rounded-2xl object-cover" />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Price', formatMoney(product.price)],
                ['Stock', product.stock],
                ['Approval', product.approvalStatus],
                ['Lifecycle', product.lifecycleStatus],
                ['Organic', product.organic ? 'Verified' : 'Not verified'],
                ['Quality', product.quality],
                ['Vendor', product.vendorName],
                ['Vendor trust', product.vendorTrustLevel]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                  <p className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Health score</p>
                    <div className="mt-2"><HealthScoreBadge score={product.healthScore} band={product.healthBand} /></div>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Quality</p>
                    <div className="mt-2"><QualityBadge value={product.quality} /></div>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Vendor trust</p>
                    <div className="mt-2"><VendorTrustBadge value={product.vendorTrustLevel} /></div>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Moderation flags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.suspiciousFlags.length ? product.suspiciousFlags.map((flag) => (
                      <span key={flag} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{flag}</span>
                    )) : <span className="text-sm text-slate-500">No active flags.</span>}
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Admin note</p>
                  <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">{product.adminNote}</p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <AuditLogPanel rows={product.pricingHistory.map((entry, index) => ({ id: `price-${index}`, action: `Price updated to ${formatMoney(entry.price)}`, actor: 'Vendor', createdAt: entry.date }))} title="Pricing History" />
                <AuditLogPanel rows={product.approvalHistory} title="Approval History" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Admin controls</h3>
                <div className="mt-4 grid gap-2">
                  {actions.map(([key, label, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onAction(key, product)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        key === 'reject' || key === 'archive' || key === 'flag'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Listing details</h3>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    ['Created', formatAdminDate(product.createdAt)],
                    ['Updated', formatAdminDate(product.updatedAt)],
                    ['Lifecycle', product.lifecycleStatus],
                    ['Auto-approved', product.autoApproved ? 'Yes' : 'No'],
                    ['Metadata completeness', product.metadataComplete ? 'Complete' : 'Incomplete'],
                    ['Featured', product.featured ? 'Yes' : 'No']
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <AuditLogPanel rows={product.auditLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
