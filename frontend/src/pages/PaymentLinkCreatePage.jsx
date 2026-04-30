import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPaymentLink } from '../services/paymentLinksApi.js';
import { getErrorMessage } from '../services/api.js';

export default function PaymentLinkCreatePage() {
  const [form, setForm] = useState({
    userId: '',
    amount: '',
    currency: 'INR',
    notes: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await createPaymentLink({
        userId: form.userId,
        amount: Number(form.amount),
        currency: form.currency,
        notes: form.notes
      });
      setResult(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">MarketLoop payment links</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Create a payment link</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Generate a unique payment page for a user and track the final payment status from the admin dashboard.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            User ID
            <input
              value={form.userId}
              onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="buyer_123"
              required
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Amount
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="499"
              required
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Currency
            <input
              value={form.currency}
              onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium uppercase text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              maxLength={3}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="Optional context for the payment"
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? 'Creating payment link...' : 'Create payment link'}
            </button>
            <Link
              to="/admin/payments"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Open admin payments
            </Link>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            {error}
          </div>
        ) : null}
      </section>

      {result?.payment ? (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">Payment link created</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-black text-slate-900">Payment ID:</span> {result.payment.payment_id}</p>
            <p><span className="font-black text-slate-900">User ID:</span> {result.payment.user_id}</p>
            <p><span className="font-black text-slate-900">Amount:</span> {result.payment.currency} {result.payment.amount}</p>
            <p><span className="font-black text-slate-900">Status:</span> {result.payment.status}</p>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Payment URL</p>
            <a className="mt-2 block break-all text-sm font-semibold text-emerald-700 hover:text-emerald-800" href={result.payment_link}>
              {result.payment_link}
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}
