import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyCashfreePayment } from '../services/paymentApi.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CashfreeReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [message, setMessage] = useState('Verifying your Cashfree payment...');

  useEffect(() => {
    let ignore = false;
    const localOrderId = searchParams.get('localOrderId');
    const cashfreeOrderId = searchParams.get('order_id');
    const productId = searchParams.get('productId');
    const qty = searchParams.get('qty') || '1';

    const verify = async () => {
      if (!localOrderId || !cashfreeOrderId) {
        navigate(`/checkout?productId=${productId || ''}&qty=${qty}&gateway=cashfree_payments&status=failed&reason=missing_cashfree_return_params`, { replace: true });
        return;
      }

      if (!user) {
        navigate('/login?role=buyer', {
          replace: true,
          state: { redirectTo: `/payment/cashfree/return?${searchParams.toString()}` }
        });
        return;
      }

      try {
        const verification = await verifyCashfreePayment({
          orderId: localOrderId,
          cashfreeOrderId
        });

        if (ignore) return;

        navigate(
          `/order-success?orderId=${localOrderId}&amount=${verification.order?.amount || ''}&receipt=${verification.receipt?.receiptId || ''}&gateway=cashfree_payments`,
          { replace: true }
        );
      } catch (error) {
        if (ignore) return;
        setMessage('Cashfree payment could not be verified. Returning you to checkout...');
        const reason = encodeURIComponent(getErrorMessage(error));
        window.setTimeout(() => {
          navigate(`/checkout?productId=${productId || ''}&qty=${qty}&gateway=cashfree_payments&status=failed&orderId=${localOrderId}&reason=${reason}`, { replace: true });
        }, 900);
      }
    };

    verify();
    return () => {
      ignore = true;
    };
  }, [navigate, searchParams, user]);

  return (
    <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Cashfree return</p>
      <h1 className="mt-3 text-3xl font-black text-slate-900">Checking your payment</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {message}
      </p>
    </div>
  );
}
