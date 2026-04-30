import { Download, FileText, ShieldCheck, Star, Trash2, UserCheck, UserMinus, X } from 'lucide-react';
import { formatAdminDate, formatMoney, getBuyerHealthTone } from '../buyers/buyerUtils.js';

const actionConfig = [
  { key: 'view-profile', label: 'View profile', icon: FileText },
  { key: 'edit', label: 'Edit buyer info', icon: UserCheck },
  { key: 'toggle-active', label: 'Activate / deactivate', icon: UserMinus },
  { key: 'toggle-block', label: 'Block / unblock', icon: ShieldCheck },
  { key: 'verify', label: 'Mark as verified', icon: Star },
  { key: 'add-note', label: 'Add internal note', icon: FileText },
  { key: 'export', label: 'Export buyer data', icon: Download },
  { key: 'orders', label: 'View order history', icon: FileText },
  { key: 'wishlist', label: 'View wishlist items', icon: FileText },
  { key: 'delete', label: 'Delete buyer', icon: Trash2, danger: true }
];

export default function BuyerDetailDrawer({ buyer, open, onClose, onAction }) {
  if (!open || !buyer) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Buyer profile</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{buyer.name}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{buyer.id} | {buyer.email}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Account status', buyer.status],
              ['Verification', buyer.verificationStatus],
              ['Segment', buyer.segment],
              ['Total orders', buyer.totalOrders],
              ['Total spent', formatMoney(buyer.totalSpent)],
              ['Wishlist count', buyer.wishlistCount],
              ['Risk score', buyer.riskScore],
              ['Refund / disputes', `${buyer.refundCount} / ${buyer.disputeCount}`],
              ['Account health', buyer.accountHealth]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Buyer profile details</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  ['Phone', buyer.phone],
                  ['Location', buyer.location],
                  ['Join date', formatAdminDate(buyer.joinDate)],
                  ['Last activity', formatAdminDate(buyer.lastActivity, true)],
                  ['Last login', formatAdminDate(buyer.lastLogin, true)],
                  ['Last order date', buyer.lastOrderDate ? formatAdminDate(buyer.lastOrderDate) : '-'],
                  ['KYC status', buyer.kycStatus],
                  ['Manual lists', `${buyer.isBlacklisted ? 'Blacklisted' : 'Not blacklisted'} / ${buyer.isWhitelisted ? 'Whitelisted' : 'Standard'}`]
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {buyer.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Internal note</p>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">{buyer.notes}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`rounded-[1.5rem] border p-5 ${getBuyerHealthTone(buyer.accountHealth)}`}>
                <p className="text-xs font-black uppercase tracking-[0.14em]">Account health</p>
                <p className="mt-2 text-2xl font-black capitalize">{buyer.accountHealth}</p>
                <p className="mt-2 text-sm">Risk score {buyer.riskScore} with {buyer.refundCount} refunds and {buyer.disputeCount} disputes tracked.</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Admin actions</p>
                <div className="mt-4 grid gap-2">
                  {actionConfig.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => onAction(action.key, buyer)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          action.danger
                            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900'
                        }`}
                      >
                        <Icon size={16} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Communication log</h3>
              <div className="mt-4 space-y-4">
                {buyer.communicationLog.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-emerald-200 pl-4">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{entry.actor} · {entry.channel}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{entry.message}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{formatAdminDate(entry.createdAt, true)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Recent activity</h3>
              <div className="mt-4 space-y-4">
                {buyer.activityTimeline.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{entry.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{formatAdminDate(entry.createdAt, true)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
