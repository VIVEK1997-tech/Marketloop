import { useEffect, useState } from 'react';
import { api, extractApiData, getErrorMessage } from '../../services/api.js';

const POLL_INTERVAL_MS = 10000;

const badgeClassMap = {
  ready: 'bg-emerald-100 text-emerald-700',
  available: 'bg-sky-100 text-sky-700',
  unavailable: 'bg-amber-100 text-amber-700',
  failed: 'bg-rose-100 text-rose-700',
  no_activity: 'bg-slate-100 text-slate-600'
};

const lifecycleLabel = (value) => String(value || '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());

export default function PaymentGatewayStatusPanel() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    let ignore = false;

    const load = async ({ background = false } = {}) => {
      if (!background) setLoading(true);
      setError('');
      try {
        const response = await api.get('/payment/admin/gateways/status');
        const data = extractApiData(response);
        if (!ignore) {
          setGateways(Array.isArray(data.gateways) ? data.gateways : []);
          setLastUpdatedAt(new Date());
        }
      } catch (nextError) {
        if (!ignore) {
          setError(getErrorMessage(nextError));
        }
      } finally {
        if (!ignore && !background) {
          setLoading(false);
        }
      }
    };

    load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        load({ background: true });
      }
    }, POLL_INTERVAL_MS);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Payment gateway status</p>
          <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">Admin payment response monitor</h2>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {lastUpdatedAt ? `Live refresh every 10s - Last update ${lastUpdatedAt.toLocaleTimeString()}` : 'Live refresh every 10s'}
        </p>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading gateway response status...</p>
      ) : error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {gateways.map((gateway) => {
            const latestStatus = gateway.latestResponseStatus || gateway.status || 'no_activity';
            const latestBadgeClass = badgeClassMap[latestStatus] || badgeClassMap.no_activity;
            const statusBadgeClass = badgeClassMap[gateway.status] || badgeClassMap.no_activity;
            const successCount = gateway.paymentSummary?.lifecycle?.success || 0;
            const pendingCount = gateway.paymentSummary?.lifecycle?.pending || 0;
            const failedCount = gateway.paymentSummary?.lifecycle?.failed || 0;

            return (
              <article
                key={gateway.id}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{gateway.company}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{gateway.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusBadgeClass}`}>
                      {gateway.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${latestBadgeClass}`}>
                      response: {latestStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Success</p>
                    <p className="mt-2 text-lg font-black text-emerald-700">{successCount}</p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Pending</p>
                    <p className="mt-2 text-lg font-black text-sky-700">{pendingCount}</p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Failed</p>
                    <p className="mt-2 text-lg font-black text-rose-700">{failedCount}</p>
                  </div>
                </div>

                {gateway.latestPayment ? (
                  <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900">
                    <p className="font-black text-slate-900 dark:text-slate-100">Latest payment</p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      {lifecycleLabel(gateway.latestPayment.lifecycleStatus)} - {gateway.latestPayment.status}
                    </p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                      {gateway.latestPayment.currency} {gateway.latestPayment.amount} - Order {gateway.latestPayment.orderId}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No payment responses yet for this gateway.</p>
                )}

                {gateway.latestWebhook ? (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Latest webhook: {gateway.latestWebhook.status} - {gateway.latestWebhook.eventId || 'event id unavailable'}
                  </p>
                ) : null}

                {Array.isArray(gateway.configReasons) && gateway.configReasons.length > 0 ? (
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    {gateway.configReasons[0]}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
