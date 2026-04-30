import { Bell, FileText, KeyRound, ShieldAlert, ShieldCheck, Wallet, X } from 'lucide-react';
import { formatAdminDate, formatMoney } from '../sellers/sellerUtils.js';

const actionButtons = [
  ['activate', 'Activate seller', ShieldCheck],
  ['deactivate', 'Deactivate seller', ShieldAlert],
  ['kyc_pending', 'Mark KYC Pending', FileText],
  ['suspend', 'Suspend seller', ShieldAlert],
  ['blacklist', 'Blacklist seller', ShieldAlert],
  ['approve_kyc', 'Approve KYC', ShieldCheck],
  ['reject_kyc', 'Reject KYC', ShieldAlert],
  ['note', 'Add internal admin note', FileText],
  ['orders', 'View seller orders', FileText],
  ['payouts', 'View payout history', Wallet],
  ['disputes', 'View disputes / complaints', FileText],
  ['activity', 'View login / activity history', FileText],
  ['reset_password', 'Reset seller password', KeyRound],
  ['notify', 'Send notification to seller', Bell],
  ['manual_review', 'Flag for manual review', ShieldAlert]
];

const riskTone = {
  low_risk: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium_risk: 'border-amber-200 bg-amber-50 text-amber-700',
  high_risk: 'border-rose-200 bg-rose-50 text-rose-700'
};

export default function SellerDetailDrawer({ seller, open, onClose, onAction }) {
  if (!open || !seller) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Seller profile</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{seller.storeName}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{seller.id} | {seller.email}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Seller status', seller.status],
              ['Verification', seller.verificationStatus],
              ['Products', seller.productCount],
              ['Revenue', formatMoney(seller.revenue)],
              ['Rating', seller.rating],
              ['Orders', seller.orderCount],
              ['Complaints', seller.complaintCount],
              ['Payout status', seller.payoutStatus]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Seller details</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  ['Owner', seller.ownerName],
                  ['Phone', seller.phone],
                  ['Location', seller.location],
                  ['Created date', formatAdminDate(seller.createdAt)],
                  ['Last login', formatAdminDate(seller.lastLogin, true)],
                  ['KYC submitted', formatAdminDate(seller.kycSubmittedAt)],
                  ['Cancellation rate', `${seller.cancellationRate}%`],
                  ['Refund rate', `${seller.refundRate}%`],
                  ['Suspicious logins', seller.suspiciousLogins]
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">KYC documents</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {seller.documents.map((document) => (
                    <div key={document.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{document.name}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{document.status.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Internal note</p>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">{seller.notes}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`rounded-[1.5rem] border p-5 ${riskTone[seller.riskBand] || riskTone.medium_risk}`}>
                <p className="text-xs font-black uppercase tracking-[0.14em]">Seller risk score</p>
                <p className="mt-2 text-3xl font-black">{seller.riskScore}</p>
                <p className="mt-2 text-sm">Band: {seller.riskBand.replace('_', ' ')}. High-risk sellers should enter the manual review queue.</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Moderation actions</p>
                <div className="mt-4 grid gap-2">
                  {actionButtons.map(([key, label, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onAction(key, seller)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        key === 'blacklist' || key === 'reject_kyc'
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
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Admin notes</h3>
              <div className="mt-4 space-y-4">
                {seller.adminNotes.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-cyan-200 pl-4">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{entry.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{entry.actor} · {formatAdminDate(entry.createdAt, true)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Recent activity</h3>
              <div className="mt-4 space-y-4">
                {seller.activityTimeline.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{entry.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{formatAdminDate(entry.createdAt, true)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Complaints / payout trail</h3>
              <div className="mt-4 space-y-4">
                {[...seller.complaints, ...seller.payoutHistory].slice(0, 5).map((entry) => (
                  <div key={entry.id} className="border-l-2 border-amber-200 pl-4">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{entry.label}</p>
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
