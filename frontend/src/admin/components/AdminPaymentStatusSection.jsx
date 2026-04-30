import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listTrackedPayments,
  simulateTrackedPaymentWebhook,
  updateTrackedPaymentStatus
} from '../../services/paymentLinksApi.js';
import { getErrorMessage } from '../../services/api.js';
import PaymentGatewayStatusPanel from './PaymentGatewayStatusPanel.jsx';

const statuses = ['ALL', 'PENDING', 'SUCCESS', 'FAILED'];
const POLL_INTERVAL_MS = 10000;

const statusToneMap = {
  PENDING: 'bg-amber-100 text-amber-700',
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700'
};

export default function AdminPaymentStatusSection() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState('');
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const loadPayments = useCallback(async ({ background = false } = {}) => {
    if (!background) setLoading(true);
    setError('');
    try {
      const data = await listTrackedPayments({
        status: statusFilter === 'ALL' ? '' : statusFilter,
        userId: userFilter.trim()
      });
      setPayments(data.payments || []);
      setLastUpdatedAt(new Date());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      if (!background) setLoading(false);
    }
  }, [statusFilter, userFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadPayments({ background: true });
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadPayments]);

  const filteredSummary = useMemo(() => ({
    total: payments.length,
    pending: payments.filter((payment) => payment.status === 'PENDING').length,
    success: payments.filter((payment) => payment.status === 'SUCCESS').length,
    failed: payments.filter((payment) => payment.status === 'FAILED').length
  }), [payments]);

  const updateStatus = async (paymentId, status) => {
    setActioningId(paymentId);
    setError('');
    try {
      await updateTrackedPaymentStatus({ paymentId, status });
      await loadPayments({ background: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActioningId('');
    }
  };

  const simulateWebhook = async (paymentId, status) => {
    setActioningId(paymentId);
    setError('');
    try {
      await simulateTrackedPaymentWebhook(paymentId, status);
      await loadPayments({ background: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActioningId('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">Admin payments</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">Payment status dashboard</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Watch payment statuses update in near real time, test webhook-style transitions, and jump to the public payment page for each link.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/payment-links/create"
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              Create payment link
            </Link>
            <button
              type="button"
              onClick={() => loadPayments()}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Refresh now
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Total links</p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{filteredSummary.total}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Pending</p>
            <p className="mt-2 text-2xl font-black text-amber-700">{filteredSummary.pending}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Success</p>
            <p className="mt-2 text-2xl font-black text-emerald-700">{filteredSummary.success}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">Failed</p>
            <p className="mt-2 text-2xl font-black text-rose-700">{filteredSummary.failed}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {statuses.map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  {status}
                </button>
              );
            })}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {lastUpdatedAt ? `Live refresh every 10s - Last update ${lastUpdatedAt.toLocaleTimeString()}` : 'Live refresh every 10s'}
          </p>
        </div>

        <div className="mt-4 max-w-sm">
          <input
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
            placeholder="Filter by user_id"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
          />
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            {error}
          </div>
        ) : null}
      </section>

      <PaymentGatewayStatusPanel />

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/40">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.12em]">Payment ID</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.12em]">User</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.12em]">Amount</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.12em]">Status</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.12em]">Created</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.12em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700 dark:divide-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center font-semibold text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : null}

              {!loading && payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center font-semibold text-slate-500">
                    No payments found for the selected filters.
                  </td>
                </tr>
              ) : null}

              {payments.map((payment) => {
                const isBusy = actioningId === payment.payment_id;
                return (
                  <tr key={payment.payment_id}>
                    <td className="px-5 py-4 align-top">
                      <div className="font-black text-slate-900 dark:text-slate-100">{payment.payment_id}</div>
                      <Link className="mt-1 inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-800" to={`/payment/${payment.payment_id}`}>
                        Open payment page
                      </Link>
                    </td>
                    <td className="px-5 py-4 align-top">{payment.user_id}</td>
                    <td className="px-5 py-4 align-top">{payment.currency} {payment.amount}</td>
                    <td className="px-5 py-4 align-top">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${statusToneMap[payment.status] || 'bg-slate-100 text-slate-700'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">{new Date(payment.created_at).toLocaleString()}</td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {['PENDING', 'SUCCESS', 'FAILED'].map((status) => (
                          <button
                            key={`${payment.payment_id}-${status}`}
                            type="button"
                            disabled={isBusy}
                            onClick={() => updateStatus(payment.payment_id, status)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            {isBusy ? 'Saving...' : `Mark ${status}`}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => simulateWebhook(payment.payment_id, 'SUCCESS')}
                          className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? 'Running...' : 'Simulate webhook'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
