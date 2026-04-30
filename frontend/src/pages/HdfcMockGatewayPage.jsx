import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const appendParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

export default function HdfcMockGatewayPage() {
  const [searchParams] = useSearchParams();

  const details = useMemo(() => ({
    returnUrl: searchParams.get('returnUrl') || '',
    localOrderId: searchParams.get('localOrderId') || '',
    merchantOrderId: searchParams.get('merchantOrderId') || '',
    gatewayOrderId: searchParams.get('gatewayOrderId') || '',
    amount: searchParams.get('amount') || '',
    currency: searchParams.get('currency') || 'INR'
  }), [searchParams]);

  const continueWith = (mockStatus) => {
    if (!details.returnUrl) return;
    const target = appendParams(details.returnUrl, {
      localOrderId: details.localOrderId,
      gatewayOrderId: details.gatewayOrderId,
      receipt: details.merchantOrderId,
      mockStatus,
      mockTxnId: `HDFC_TXN_${Date.now()}`
    });
    window.location.assign(target);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">HDFC sandbox</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Mock HDFC SmartGateway</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This page simulates the hosted HDFC checkout while the integration is running in sandbox/mock mode.
        </p>
        <p className="mt-4 text-lg font-bold text-emerald-700">
          Amount: {details.currency} {details.amount}
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => continueWith('success')}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
          >
            Simulate successful payment
          </button>
          <button
            type="button"
            onClick={() => continueWith('failed')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Simulate failed payment
          </button>
          <button
            type="button"
            onClick={() => continueWith('pending')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Simulate pending payment
          </button>
        </div>
      </section>
    </div>
  );
}

