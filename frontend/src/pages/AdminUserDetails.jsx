import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api.js';
import { formatInvoiceCurrency } from '../utils/invoice.js';

export default function AdminUserDetails() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then(({ data: response }) => setData(response))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="card">Loading user details...</p>;
  if (error) return <p className="card text-red-700">{error}</p>;
  if (!data?.user) return <p className="card">User not found.</p>;

  const { user, orders, products, invoices } = data;

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-subtitle">Admin user profile</p>
            <h1 className="section-title mt-2">{user.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{user.userLabel} | {user.email}</p>
          </div>
          <Link className="btn-secondary py-2" to="/admin">Back to admin</Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ['Status', user.status],
            ['Phone', user.phone || '-'],
            ['Location', user.location?.city || user.location?.state || 'Unknown'],
            ['Roles', (user.roles || []).join(', ')]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-2xl font-black text-slate-900">Orders</h2>
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <Link key={order._id} className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" to={`/admin/orders/${order._id}`}>
                <p className="font-black text-brand-700">{order.receipt || order._id}</p>
                <p className="mt-1 text-sm text-slate-500">{order.product?.title || 'Product'} | {formatInvoiceCurrency(order.amount)}</p>
              </Link>
            ))}
            {!orders.length && <p className="text-sm text-slate-500">No orders found for this user.</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-black text-slate-900">Invoices</h2>
          <div className="mt-4 space-y-3">
            {invoices.map((invoice) => (
              <Link key={invoice._id} className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" to={`/invoices/${invoice.invoiceNumber}`}>
                <p className="font-black text-brand-700">{invoice.invoiceNumber}</p>
                <p className="mt-1 text-sm text-slate-500">{invoice.invoiceType} | {formatInvoiceCurrency(invoice.total)}</p>
              </Link>
            ))}
            {!invoices.length && <p className="text-sm text-slate-500">No invoices found for this user.</p>}
          </div>
        </div>
      </div>

      {!!products.length && (
        <div className="card">
          <h2 className="text-2xl font-black text-slate-900">Listings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`} className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <p className="font-black text-slate-900">{product.title}</p>
                <p className="mt-1 text-sm text-slate-500">{product.category} | {formatInvoiceCurrency(product.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
