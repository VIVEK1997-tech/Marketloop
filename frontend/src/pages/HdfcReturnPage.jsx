import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../services/api.js';
import { verifyHdfcPayment } from '../services/paymentApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const statusMeta = {
  verifying: {
    eyebrow: 'HDFC return',
    title: 'Verifying payment...',
    copy: 'We are checking the final HDFC SmartGateway order status with the backend before confirming your MarketLoop order.'
  },
  success: {
    eyebrow: 'Payment successful',
    title: 'Your payment is confirmed',
    copy: 'We verified the HDFC payment and your order is now ready for confirmation.'
  },
  failed: {
    eyebrow: 'Payment failed',
    title: 'The payment did not complete',
    copy: 'The gateway did not report a successful charge. Your order is still safe and pending until you try again.'
  },
  pending: {
    eyebrow: 'Payment pending',
    title: 'We are still waiting for HDFC confirmation',
    copy: 'The payment session exists, but the final result is not confirmed yet. You can check again or return to checkout.'
  }
};

export default function HdfcReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [phase, setPhase] = useState('verifying');
  const [message, setMessage] = useState(statusMeta.verifying.copy);
  const [verification, setVerification] = useState(null);

  const params = useMemo(() => ({
    localOrderId: searchParams.get('localOrderId') || searchParams.get('orderId') || '',
    gatewayOrderId: searchParams.get('gatewayOrderId') || '',
    receipt: searchParams.get('receipt') || '',
    productId: searchParams.get('productId') || '',
    qty: searchParams.get('qty') || '1',
    mockStatus: searchParams.get('mockStatus') || '',
    mockTxnId: searchParams.get('mockTxnId') || ''
  }), [searchParams]);

  useEffect(() => {
    let ignore = false;

    const verify = async () => {
      if (!params.localOrderId) {
        setPhase('failed');
        setMessage('The HDFC return is missing the local order reference. Please go back to checkout and try again.');
        return;
      }

      if (!user) {
        navigate('/login?role=buyer', {
          replace: true,
          state: { redirectTo: `/payment/hdfc/return?${searchParams.toString()}` }
        });
        return;
      }

      try {
        const result = await verifyHdfcPayment(params);
        if (ignore) return;

        setVerification(result);

        const paymentStatus = String(result?.order?.paymentStatus || '').toLowerCase();
        if (paymentStatus === 'success') {
          setPhase('success');
          setMessage(statusMeta.success.copy);
          return;
        }

        if (paymentStatus === 'failed') {
          setPhase('failed');
          setMessage(result?.order?.failureReason || statusMeta.failed.copy);
          return;
        }

        setPhase('pending');
        setMessage('HDFC has not confirmed the charge yet. You can wait a moment and check again from checkout.');
      } catch (error) {
        if (ignore) return;
        setPhase('failed');
        setMessage(getErrorMessage(error));
      }
    };

    verify();
    return () => {
      ignore = true;
    };
  }, [navigate, params, searchParams, user]);

  const goToCheckout = () => {
    navigate(
      `/checkout?productId=${params.productId}&qty=${params.qty}&gateway=hdfc_smartgateway&status=failed&orderId=${params.localOrderId}&reason=${encodeURIComponent(message)}`,
      { replace: true }
    );
  };

  const goToSuccess = () => {
    navigate(
      `/order-success?orderId=${params.localOrderId}&amount=${verification?.order?.amount || ''}&receipt=${verification?.receipt?.receiptId || params.receipt}&gateway=hdfc_smartgateway`,
      { replace: true }
    );
  };

  const meta = statusMeta[phase] || statusMeta.verifying;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">{meta.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">{meta.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {message}
        </p>
        {verification?.order?.amount ? (
          <p className="mt-4 text-lg font-bold text-emerald-700">
            Amount: Rs. {verification.order.amount}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {phase === 'success' ? (
            <button
              type="button"
              onClick={goToSuccess}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
            >
              Continue to order confirmation
            </button>
          ) : null}

          {phase === 'failed' || phase === 'pending' ? (
            <button
              type="button"
              onClick={goToCheckout}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
            >
              Back to checkout
            </button>
          ) : null}

          {phase !== 'verifying' ? (
            <button
              type="button"
              onClick={() => navigate('/payments')}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Open payment history
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

