import { AlertTriangle, Bell, Download, FileText, PackageCheck, RefreshCcw, Truck, Wallet, X } from 'lucide-react';
import { formatAdminDate, formatMoney } from '../orders/orderUtils.js';

const actionButtons = [
  ['approve', 'Approve order', PackageCheck],
  ['hold', 'Hold order', AlertTriangle],
  ['cancel', 'Cancel order', AlertTriangle],
  ['refund_full', 'Refund full amount', Wallet],
  ['refund_partial', 'Refund partial amount', Wallet],
  ['packed', 'Mark as packed', PackageCheck],
  ['shipped', 'Mark as shipped', Truck],
  ['out_for_delivery', 'Mark out for delivery', Truck],
  ['delivered', 'Mark as delivered', Truck],
  ['failed_delivery', 'Mark failed delivery', AlertTriangle],
  ['reassign_courier', 'Reassign delivery partner', Truck],
  ['dispute', 'Open dispute case', AlertTriangle],
  ['resolve_dispute', 'Resolve dispute', AlertTriangle],
  ['contact_buyer', 'Contact buyer', Bell],
  ['contact_seller', 'Contact seller', Bell],
  ['download_invoice', 'Download invoice', Download],
  ['download_label', 'Download shipping label', Download],
  ['retry_payment', 'Retry payment check', RefreshCcw],
  ['sync_payment', 'Sync payment status', RefreshCcw],
  ['sync_delivery', 'Sync delivery status', RefreshCcw],
  ['flag_review', 'Flag order for review', AlertTriangle],
  ['note', 'Add internal note', FileText]
];

export default function OrderDetailDrawer({ order, open, onClose, onAction }) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-5xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Order operations</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{order.orderId}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{order.buyerName} · {order.sellerName} · {formatAdminDate(order.orderDate, true)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Order status', order.orderStatus],
              ['Payment', order.paymentStatus],
              ['Delivery', order.deliveryStatus],
              ['Risk', `${order.riskFlag.replace('_', ' ')} · ${order.riskScore}`],
              ['Transaction ID', order.transactionId],
              ['Gateway', order.paymentGateway],
              ['Tracking ID', order.trackingId],
              ['Courier', order.deliveryPartner]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Buyer, seller, and shipment</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    ['Buyer', `${order.buyerName} (${order.buyerId})`],
                    ['Seller', `${order.sellerName} (${order.sellerId})`],
                    ['Shipping address', order.shippingAddress],
                    ['Estimated delivery', formatAdminDate(order.estimatedDeliveryDate)],
                    ['Actual delivery', order.actualDeliveryDate ? formatAdminDate(order.actualDeliveryDate) : '-'],
                    ['Refund status', order.refundStatus],
                    ['Dispute status', order.disputeStatus],
                    ['Admin notes', order.adminNoteCount]
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Risk exceptions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {order.exceptionBadges.length ? order.exceptionBadges.map((badge) => (
                      <span key={badge} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{badge}</span>
                    )) : <span className="text-sm text-slate-500">No active exceptions.</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Product line items</h3>
                <div className="mt-4 space-y-3">
                  {order.lineItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900 dark:text-slate-100">{item.productName}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.quantity} {item.unit} · {formatMoney(item.unitPrice)} each</p>
                        </div>
                        <p className="font-black text-slate-900 dark:text-slate-100">{formatMoney(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Payment breakdown</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      ['Subtotal', formatMoney(order.lineItems.reduce((sum, item) => sum + item.subtotal, 0))],
                      ['Discount', formatMoney(order.discount)],
                      ['Tax', formatMoney(order.tax)],
                      ['Shipping', formatMoney(order.shipping)],
                      ['Total amount', formatMoney(order.amount)]
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{label}</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Coupon: {order.coupon || 'None'} · Attempts: {order.paymentAttempts}</p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Shipment timeline</h3>
                  <div className="mt-4 space-y-4">
                    {order.deliveryTimeline.map((entry) => (
                      <div key={entry.id} className="border-l-2 border-cyan-200 pl-4">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{entry.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{entry.actor} · {formatAdminDate(entry.createdAt, true)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Quick admin actions</h3>
                <div className="mt-4 grid gap-2">
                  {actionButtons.map(([key, label, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onAction(key, order)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        key.includes('refund') || key === 'cancel' || key === 'flag_review' || key === 'dispute'
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
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Payment history</h3>
                <div className="mt-4 space-y-4">
                  {order.paymentHistory.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-emerald-200 pl-4">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{entry.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{entry.gatewayResponse} · {formatAdminDate(entry.createdAt, true)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Audit trail & note history</h3>
                <div className="mt-4 space-y-4">
                  {order.auditTrail.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{entry.field}: {entry.oldValue} {'->'} {entry.newValue}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{entry.actor} · {formatAdminDate(entry.createdAt, true)}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
