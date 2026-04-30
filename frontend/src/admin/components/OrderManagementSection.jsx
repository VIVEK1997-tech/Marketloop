import { useEffect, useMemo, useState } from 'react';
import { Download, FileArchive, RefreshCcw } from 'lucide-react';
import { downloadCsv, downloadZip, printInvoicePreview } from '../exportUtils.js';
import BuyerSummaryCards from './BuyerSummaryCards.jsx';
import ToastStack from './ToastStack.jsx';
import OrderFilters from './OrderFilters.jsx';
import OrderBulkActions from './OrderBulkActions.jsx';
import OrderTable from './OrderTable.jsx';
import OrderDetailDrawer from './OrderDetailDrawer.jsx';
import { generateMockOrders } from '../orders/mockOrders.js';
import { filterOrders, formatMoney, getPaginationMeta, orderStatusOptions, paginateRows, rowsPerPageOptions, sortOrders } from '../orders/orderUtils.js';

const initialFilters = {
  search: '',
  paymentStatus: 'all',
  deliveryStatus: 'all',
  orderStatus: 'all',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  seller: '',
  buyer: '',
  suspicious: 'all',
  refundStatus: 'all',
  disputeStatus: 'all',
  risk: 'all'
};

const topActions = [
  { key: 'generate', label: 'Generate Order Operations', icon: RefreshCcw, tone: 'primary' },
  { key: 'csv', label: 'Download CSV', icon: Download },
  { key: 'zip', label: 'Download ZIP', icon: FileArchive }
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' },
  { value: 'payment', label: 'Payment status' },
  { value: 'delivery', label: 'Delivery status' },
  { value: 'buyer', label: 'Buyer name' },
  { value: 'seller', label: 'Seller name' }
];

export default function OrderManagementSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('newest');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeOrder, setActiveOrder] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(generateMockOrders(1000));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const filteredOrders = useMemo(() => filterOrders(orders, filters), [orders, filters]);
  const sortedOrders = useMemo(() => sortOrders(filteredOrders, sortBy, sortDirection), [filteredOrders, sortBy, sortDirection]);
  const pagedOrders = useMemo(() => paginateRows(sortedOrders, currentPage, rowsPerPage), [sortedOrders, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getPaginationMeta(sortedOrders.length, currentPage, rowsPerPage), [sortedOrders.length, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const metrics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const delayed = orders.filter((order) => order.exceptionBadges.includes('Delivery Delay')).length;
    const refunds = orders.filter((order) => order.refundStatus !== 'None').length;
    const disputes = orders.filter((order) => order.disputeStatus !== 'None').length;
    const highRisk = orders.filter((order) => order.riskFlag === 'high_risk').length;
    return [
      { label: 'Total Orders', value: orders.length.toLocaleString('en-IN'), helper: 'All seeded admin order records' },
      { label: 'Revenue', value: formatMoney(revenue), helper: 'Total GMV represented in the dataset' },
      { label: 'Delayed Orders', value: delayed.toLocaleString('en-IN'), helper: 'Orders with delivery delay exceptions' },
      { label: 'Refund Queue', value: refunds.toLocaleString('en-IN'), helper: 'Orders with refund activity' },
      { label: 'Dispute Cases', value: disputes.toLocaleString('en-IN'), helper: 'Orders with open or resolved disputes' },
      { label: 'Manual Review Queue', value: highRisk.toLocaleString('en-IN'), helper: 'High-risk or suspicious orders needing ops review' }
    ];
  }, [orders]);

  const updateOrders = (predicate, updater) => {
    setOrders((current) => current.map((order) => (predicate(order) ? updater(order) : order)));
  };

  const applyAction = (action, order) => {
    const patch =
      action === 'approve' ? { orderStatus: 'Confirmed' } :
      action === 'hold' ? { orderStatus: 'On Hold' } :
      action === 'cancel' ? { orderStatus: 'Cancelled', deliveryStatus: 'Cancelled' } :
      action === 'refund_full' ? { paymentStatus: 'Refunded', refundStatus: 'Refunded', orderStatus: 'Refunded' } :
      action === 'refund_partial' ? { paymentStatus: 'Partially Refunded', refundStatus: 'Partially Refunded', orderStatus: 'Partially Refunded' } :
      action === 'packed' ? { orderStatus: 'Packed', deliveryStatus: 'Packed' } :
      action === 'shipped' ? { orderStatus: 'Shipped', deliveryStatus: 'Shipped' } :
      action === 'out_for_delivery' ? { orderStatus: 'Out for Delivery', deliveryStatus: 'Out for Delivery' } :
      action === 'delivered' ? { orderStatus: 'Delivered', deliveryStatus: 'Delivered', actualDeliveryDate: new Date().toISOString() } :
      action === 'failed_delivery' ? { orderStatus: 'Failed', deliveryStatus: 'Failed Attempt' } :
      action === 'dispute' ? { orderStatus: 'Disputed', disputeStatus: 'Open' } :
      action === 'resolve_dispute' ? { disputeStatus: 'Resolved' } :
      action === 'flag_review' || action === 'review' ? { suspicious: true, riskFlag: 'high_risk', riskScore: Math.max(order.riskScore, 82), exceptionBadges: [...new Set([...order.exceptionBadges, 'Fraud Review'])] } :
      action === 'sync_payment' ? { paymentStatus: order.paymentStatus === 'Pending' ? 'Paid' : order.paymentStatus } :
      action === 'sync_delivery' ? { deliveryStatus: order.deliveryStatus === 'In Transit' ? 'Out for Delivery' : order.deliveryStatus } :
      null;

    if (action === 'download_invoice') {
      printInvoicePreview({
        title: `Invoice ${order.orderId}`,
        rows: order.lineItems.map((item) => ({
          product: item.productName,
          quantity: `${item.quantity} ${item.unit}`,
          subtotal: formatMoney(item.subtotal)
        })),
        summary: `Buyer: ${order.buyerName} | Seller: ${order.sellerName} | Total: ${formatMoney(order.amount)}`
      });
      pushToast('Invoice preview generated', `${order.orderId} invoice preview opened.`);
      return;
    }

    if (action === 'download_label') {
      downloadZip('shipping-label', [{
        name: order.orderId,
        extension: 'txt',
        content: `Shipping Label\nOrder: ${order.orderId}\nBuyer: ${order.buyerName}\nAddress: ${order.shippingAddress}\nCourier: ${order.deliveryPartner}\nTracking: ${order.trackingId}`
      }]);
      pushToast('Shipping label generated', `${order.orderId} shipping label exported.`);
      return;
    }

    if (patch) {
      updateOrders((item) => item.id === order.id, (item) => ({ ...item, ...patch }));
    }

    pushToast('Order action completed', `${order.orderId}: ${action.replace(/_/g, ' ')} applied.`);
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'export') {
      downloadCsv('selected-orders', orders.filter((order) => selectedIds.has(order.id)));
      pushToast('Bulk export ready', `${ids.length} orders exported.`);
      return;
    }

    if (action === 'cancel') {
      setConfirmState({
        title: `Cancel ${ids.length} orders?`,
        message: 'This demonstrates bulk cancellation with confirmation. You can later connect this to a real API workflow.',
        onConfirm: () => {
          updateOrders(
            (order) => selectedIds.has(order.id),
            (order) => ({ ...order, orderStatus: 'Cancelled', deliveryStatus: 'Cancelled' })
          );
          setConfirmState(null);
          pushToast('Bulk cancellation completed', `${ids.length} orders cancelled.`);
        }
      });
      return;
    }

    updateOrders(
      (order) => selectedIds.has(order.id),
      (order) => ({
        ...order,
        orderStatus: action === 'packed' ? 'Packed' : action === 'shipped' ? 'Shipped' : action === 'hold' ? 'On Hold' : order.orderStatus,
        deliveryStatus: action === 'packed' ? 'Packed' : action === 'shipped' ? 'Shipped' : order.deliveryStatus,
        suspicious: action === 'note' ? order.suspicious : order.suspicious
      })
    );
    pushToast('Bulk action completed', `${ids.length} orders updated with ${action}.`);
  };

  const handleTopAction = (key) => {
    if (key === 'generate') {
      setLoading(true);
      setTimeout(() => {
        setOrders(generateMockOrders(1000));
        setLoading(false);
        pushToast('Order operations regenerated', '1000 realistic order records were refreshed.');
      }, 350);
      return;
    }

    if (key === 'csv') {
      downloadCsv('order-operations', sortedOrders);
      pushToast('CSV downloaded', 'Filtered order dataset exported.');
      return;
    }

    downloadZip(
      'order-operations',
      sortedOrders.slice(0, 40).map((order) => ({
        name: order.orderId,
        extension: 'txt',
        content: JSON.stringify(order, null, 2)
      }))
    );
    pushToast('ZIP downloaded', 'Order reports bundle generated.');
  };

  const toggleSelect = (orderId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleSelectPage = (rows) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = rows.every((row) => next.has(row.id));
      rows.forEach((row) => {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      });
      return next;
    });
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    for (let page = startPage; page <= endPage; page += 1) pages.push(page);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <BuyerSummaryCards metrics={metrics} />

      <div className="flex flex-wrap items-center gap-3">
        {topActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => handleTopAction(action.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                action.tone === 'primary'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {orderStatusOptions.slice(0, 5).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilters((current) => ({ ...current, orderStatus: status }))}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                filters.orderStatus === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {status === 'all' ? 'All orders' : status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      <OrderFilters filters={filters} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
      <OrderBulkActions selectedCount={selectedIds.size} onAction={handleBulkAction} />

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Order operations</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading order records...' : `Showing ${start}-${end} of ${sortedOrders.length.toLocaleString('en-IN')} orders`}</p>
          </div>
          <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
            {orders.filter((order) => order.riskFlag === 'high_risk').length} high-risk orders in the manual review queue
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
          </div>
        </div>
      ) : !sortedOrders.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">No orders match the current filters.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try resetting filters or widening the date and amount range.</p>
        </div>
      ) : (
        <>
          <OrderTable
            rows={pagedOrders}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectPage={toggleSelectPage}
            onOpenOrder={setActiveOrder}
            onOpenLinked={(type, order) => {
              setActiveOrder(order);
              pushToast('Linked order view opened', `${order.orderId} · ${type}`);
            }}
            onAction={applyAction}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {start}-{end} of {sortedOrders.length.toLocaleString('en-IN')} orders</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Rows per page
                <select className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={rowsPerPage} onChange={(event) => setRowsPerPage(Number(event.target.value))}>
                  {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Previous</button>
                {pageNumbers.map((page) => (
                  <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${page === currentPage ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>
                    {page}
                  </button>
                ))}
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      <OrderDetailDrawer order={activeOrder} open={Boolean(activeOrder)} onClose={() => setActiveOrder(null)} onAction={applyAction} />

      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{confirmState.title}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmState(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={confirmState.onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
