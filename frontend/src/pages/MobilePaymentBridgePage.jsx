import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api.js';
import { loadRazorpayCheckout } from '../services/razorpay.js';

const buildDeepLink = (path, params = {}) => {
  const url = new URL(`marketloop://${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

export default function MobilePaymentBridgePage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Preparing secure checkout...');
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);

  const gateway = searchParams.get('gateway') || 'razorpay';
  const orderId = searchParams.get('orderId') || '';
  const productId = searchParams.get('productId') || '';
  const amount = searchParams.get('amount') || '';
  const receipt = searchParams.get('receipt') || '';
  const key = searchParams.get('key') || '';
  const razorpayOrderId = searchParams.get('order_id') || '';
  const currency = searchParams.get('currency') || 'INR';
  const name = searchParams.get('name') || 'MarketLoop';
  const description = searchParams.get('description') || 'MarketLoop order';
  const prefillName = searchParams.get('prefill_name') || '';
  const prefillEmail = searchParams.get('prefill_email') || '';
  const prefillContact = searchParams.get('prefill_contact') || '';

  const failureDeepLink = useMemo(() => buildDeepLink('payments/result', {
    status: 'failed',
    gateway,
    productId,
    orderId,
    amount,
    receipt
  }), [amount, gateway, orderId, productId, receipt]);

  useEffect(() => {
    let cancelled = false;

    const redirectToFailure = async (reason) => {
      if (cancelled) return;
      try {
        await api.post('/payment/failed', {
          orderId,
          gatewayId: 'razorpay_checkout',
          error: { description: reason }
        });
      } catch {
        // best effort only
      }
      window.location.replace(`${failureDeepLink}&reason=${encodeURIComponent(reason)}`);
    };

    const startRazorpay = async () => {
      if (!key || !razorpayOrderId || !orderId) {
        const reason = 'Missing Razorpay mobile checkout parameters.';
        setError(reason);
        setMessage(reason);
        return;
      }

      try {
        setOpening(true);
        setMessage('Opening Razorpay checkout...');
        await loadRazorpayCheckout({ timeoutMs: 12000 });

        if (!window.Razorpay) {
          throw new Error('Razorpay checkout could not be loaded.');
        }

        const razorpay = new window.Razorpay({
          key,
          amount: Math.round(Number(amount || 0) * 100),
          currency,
          name,
          description,
          order_id: razorpayOrderId,
          prefill: {
            name: prefillName,
            email: prefillEmail,
            contact: prefillContact
          },
          theme: { color: '#10b981' },
          handler: (response) => {
            const deepLink = buildDeepLink('payments/pending', {
              gateway,
              productId,
              orderId,
              amount,
              receipt,
              verify: 'razorpay',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            window.location.replace(deepLink);
          },
          modal: {
            ondismiss: () => {
              redirectToFailure('Razorpay checkout was closed before payment completed.');
            }
          }
        });

        razorpay.on('payment.failed', async (response) => {
          const reason = response?.error?.description || 'Razorpay payment failed.';
          await redirectToFailure(reason);
        });

        razorpay.open();
      } catch (bridgeError) {
        const reason = getErrorMessage(bridgeError);
        setError(reason);
        setMessage('We could not open Razorpay automatically. You can retry below or return to the app.');
      } finally {
        setOpening(false);
      }
    };

    if (gateway === 'razorpay') {
      startRazorpay();
    } else {
      setError('This mobile checkout bridge currently supports Razorpay only.');
    }

    return () => {
      cancelled = true;
    };
  }, [
    amount,
    currency,
    description,
    failureDeepLink,
    gateway,
    key,
    name,
    orderId,
    prefillContact,
    prefillEmail,
    prefillName,
    productId,
    razorpayOrderId,
    receipt
  ]);

  const returnToApp = () => {
    window.location.replace(`${failureDeepLink}&reason=${encodeURIComponent(error || 'Razorpay checkout was not opened.')}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">MarketLoop Mobile Checkout</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Opening secure payment</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">{error || message}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Do not close this page until the gateway finishes.
          </p>

          {error ? (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Retry opening Razorpay
              </button>
              <button
                type="button"
                onClick={returnToApp}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Return to MarketLoop app
              </button>
            </div>
          ) : opening ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              Razorpay is loading. If it does not appear in a few seconds, this page will let you retry safely.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
