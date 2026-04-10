import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => new Date(value).toLocaleString('en-IN');

const statusClass = {
  pending: 'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-slate-100 text-slate-700'
};

export default function PaymentHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payment/orders')
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="card">Loading payment history...</p>;

  return (
    <section className="space-y-5">
      <div className="card">
        <p className="section-subtitle">Payments</p>
        <h1 className="section-title mt-2">Your MarketLoop orders</h1>
        <p className="mt-2 text-sm text-slate-500">Track Razorpay payment status, receipts, and purchased products.</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <article key={order._id} className="card flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={order.product?.images?.[0] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                alt={order.product?.title || 'Product'}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div>
                <Link className="text-lg font-black text-slate-900 hover:text-brand-700" to={`/products/${order.product?._id}`}>
                  {order.product?.title || 'Product'}
                </Link>
                <p className="mt-1 text-sm text-slate-500">Seller: {order.seller?.name || 'Marketplace seller'}</p>
                <p className="mt-1 text-sm text-slate-500">Receipt: {order.receipt}</p>
                <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{formatCurrency(order.amount)}</p>
              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClass[order.paymentStatus] || statusClass.pending}`}>
                {order.paymentStatus}
              </span>
              {order.failureReason && <p className="mt-2 max-w-xs text-sm text-red-600">{order.failureReason}</p>}
            </div>
          </article>
        ))}
        {!orders.length && <p className="card">No payment history yet.</p>}
      </div>
    </section>
  );
}
