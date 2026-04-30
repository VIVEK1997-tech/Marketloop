import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api.js';
import { formatInvoiceCurrency } from '../utils/invoice.js';

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/orders/${orderId}`)
      .then(({ data: response }) => setData(response))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p className="card">Loading order details...</p>;
  if (error) return <p className="card text-red-700">{error}</p>;
  if (!data?.order) return <p className="card">Order not found.</p>;

  const { order, invoice } = data;

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-subtitle">Admin order view</p>
            <h1 className="section-title mt-2">{order.receipt || order._id}</h1>
            <p className="mt-2 text-sm text-slate-500">Payment: {order.paymentStatus} | Gateway: {order.paymentGateway}</p>
          </div>
          <Link className="btn-secondary py-2" to="/admin">Back to admin</Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ['Amount', formatInvoiceCurrency(order.amount)],
            ['Buyer', order.buyer?.name || 'Buyer'],
            ['Seller', order.seller?.name || 'Seller'],
            ['Created', new Date(order.createdAt).toLocaleString('en-IN')]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-2xl font-black text-slate-900">Buyer</h2>
          <div className="mt-4 space-y-1 text-sm text-slate-600">
            <Link className="font-black text-brand-700 hover:underline" to={`/admin/users/${order.buyer?._id}`}>{order.buyer?.name}</Link>
            <p>{order.buyer?.email || '-'}</p>
            <p>{order.buyer?.phone || '-'}</p>
            <p>Status: {order.buyer?.status || '-'}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-black text-slate-900">Seller</h2>
          <div className="mt-4 space-y-1 text-sm text-slate-600">
            <Link className="font-black text-brand-700 hover:underline" to={`/admin/users/${order.seller?._id}`}>{order.seller?.name}</Link>
            <p>{order.seller?.email || '-'}</p>
            <p>{order.seller?.phone || '-'}</p>
            <p>Status: {order.seller?.status || '-'}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-black text-slate-900">Product</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <img
            src={order.product?.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
            alt={order.product?.title || 'Product'}
            className="h-24 w-24 rounded-2xl object-cover"
          />
          <div>
            <Link className="text-lg font-black text-brand-700 hover:underline" to={`/products/${order.product?._id}`}>
              {order.product?.title || 'Product'}
            </Link>
            <p className="mt-1 text-sm text-slate-500">{order.product?.category} | {order.product?.location}</p>
            <p className="mt-1 text-sm text-slate-500">{formatInvoiceCurrency(order.product?.price)} | {order.product?.quantity || 1} {order.product?.unit || 'Kg'}</p>
          </div>
        </div>
      </div>

      {invoice && (
        <div className="card">
          <h2 className="text-2xl font-black text-slate-900">Linked invoice</h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <Link className="font-black text-brand-700 hover:underline" to={`/invoices/${invoice.invoiceNumber}`}>
                {invoice.invoiceNumber}
              </Link>
              <p className="mt-1 text-sm text-slate-500">{invoice.invoiceType} | {formatInvoiceCurrency(invoice.total)}</p>
            </div>
            <Link className="btn-secondary py-2" to={`/invoices/${invoice.invoiceNumber}`}>Open invoice</Link>
          </div>
        </div>
      )}
    </section>
  );
}
