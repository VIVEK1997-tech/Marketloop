import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTrackedPayment } from '../services/paymentLinksApi.js';
import { getErrorMessage } from '../services/api.js';

const statusToneMap = {
  PENDING: 'bg-amber-100 text-amber-700',
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700'
};

export default function PublicPaymentStatusPage() {
  const { paymentId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getTrackedPayment(paymentId);
        if (!ignore) setPayment(data.payment);
      } catch (requestError) {
        if (!ignore) setError(getErrorMessage(requestError));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [paymentId]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">MarketLoop payment status</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Payment details</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This page shows the current status of the generated payment link.
        </p>

        {loading ? <p className="mt-6 text-sm font-semibold text-slate-500">Loading payment details...</p> : null}
        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            {error}
          </div>
        ) : null}

        {payment ? (
          <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Payment ID</p>
                <p className="mt-1 font-black text-slate-900">{payment.payment_id}</p>
              </div>
              <span className={`rounded-full px-4 py-2 text-xs font-black ${statusToneMap[payment.status] || 'bg-slate-100 text-slate-700'}`}>
                {payment.status}
              </span>
            </div>
            <p><span className="font-black text-slate-900">User ID:</span> {payment.user_id}</p>
            <p><span className="font-black text-slate-900">Amount:</span> {payment.currency} {payment.amount}</p>
            <p><span className="font-black text-slate-900">Created at:</span> {new Date(payment.created_at).toLocaleString()}</p>
            <p><span className="font-black text-slate-900">Last updated:</span> {new Date(payment.updated_at).toLocaleString()}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
