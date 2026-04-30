import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DeliveryAddressCard from '../components/DeliveryAddressCard.jsx';
import DeliverySlotCard from '../components/DeliverySlotCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import PaymentGatewaySelector from '../components/checkout/PaymentGatewaySelector.jsx';
import { productApi } from '../services/productApi.js';
import {
  createCashfreePayment,
  createCheckoutOrder,
  createHdfcPayment,
  createPhonePePayment,
  openGatewayCheckout,
  recordFailedCheckoutPayment,
  verifyCheckoutPayment,
  verifyCashfreePayment,
  verifyPhonePePayment
} from '../services/paymentApi.js';
import { api, extractApiData, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const productId = searchParams.get('productId');
  const qty = Math.max(1, Number(searchParams.get('qty') || 1));
  const status = searchParams.get('status');
  const returnedGateway = searchParams.get('gateway');
  const returnReason = searchParams.get('reason');
  const returnedOrderId = searchParams.get('orderId');
  const returnedTransactionId = searchParams.get('transactionId');
  const returnStatus = searchParams.get('returnStatus');
  const returnedCashfreeLocalOrderId = searchParams.get('localOrderId');
  const returnedCashfreeOrderId = searchParams.get('order_id');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [payingGatewayId, setPayingGatewayId] = useState('');
  const [gateways, setGateways] = useState([]);
  const [gatewayStatuses, setGatewayStatuses] = useState({});
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [activeGatewayId, setActiveGatewayId] = useState(
    returnedGateway || 'razorpay_checkout'
  );
  const subtotal = (product?.price || 0) * qty;
  const deliveryFee = subtotal > 699 ? 0 : 35;
  const total = subtotal + deliveryFee;

  const proceedToSuccess = ({ orderId, receipt, gatewayId, amountPaid }) => {
    navigate(
      `/order-success?orderId=${orderId}&productId=${product?._id}&amount=${amountPaid}&receipt=${receipt || ''}&gateway=${gatewayId}`
    );
  };

  useEffect(() => {
    let cancelled = false;

    if (!productId) {
        setError('Missing product selection for checkout.');
        setLoading(false);
        return () => {};
      }

    if (!user) {
      navigate('/login?role=buyer', {
        replace: true,
        state: { redirectTo: `/checkout?productId=${productId}&qty=${qty}` }
      });
      return () => {};
    }

    productApi.getProduct(productId)
      .then((nextProduct) => {
        if (!cancelled) setProduct(nextProduct);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, qty, user, navigate]);

  useEffect(() => {
    let cancelled = false;

    api.get('/payment/gateways')
      .then((response) => {
        if (cancelled) return;
        const data = extractApiData(response);
        const gatewayList = Array.isArray(data.gateways) ? data.gateways : [];
        setGateways(gatewayList.filter((gateway) => gateway.purpose !== 'payout'));
      })
      .catch((err) => {
        if (!cancelled) setError((current) => current || getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setGatewaysLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    api.get('/payment/gateways/status')
      .then((response) => {
        if (!cancelled) {
          setGatewayStatuses(extractApiData(response) || {});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGatewayStatuses({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === 'failed') {
      setError(returnReason || 'Payment was cancelled or failed. Please choose a gateway and try again.');
      setPayingGatewayId('');
    }
  }, [status, returnReason]);

  useEffect(() => {
    let ignore = false;

    const verifyReturnedPhonePePayment = async () => {
      if (
        !user
        || returnStatus !== 'phonepe'
        || returnedGateway !== 'phonepe_pg'
        || !returnedOrderId
        || !returnedTransactionId
      ) {
        return;
      }

      try {
        setPayingGatewayId('phonepe_pg');
        setError('');
        const verification = await verifyPhonePePayment({
          orderId: returnedOrderId,
          transactionId: returnedTransactionId,
          merchantTransactionId: returnedTransactionId
        });

        if (ignore) return;

        proceedToSuccess({
          orderId: returnedOrderId,
          receipt: verification.receipt?.receiptId,
          gatewayId: 'phonepe_pg',
          amountPaid: verification.order?.amount || total
        });
      } catch (verificationError) {
        if (!ignore) {
          setError(getErrorMessage(verificationError));
          setPayingGatewayId('');
        }
      }
    };

    verifyReturnedPhonePePayment();
    return () => {
      ignore = true;
    };
  }, [returnStatus, returnedGateway, returnedOrderId, returnedTransactionId, user, total]);

  useEffect(() => {
    let ignore = false;

    const verifyReturnedCashfreePayment = async () => {
      if (!user || !returnedCashfreeLocalOrderId || !returnedCashfreeOrderId) return;

      try {
        setPayingGatewayId('cashfree_payments');
        setError('');
        const verification = await verifyCashfreePayment({
          orderId: returnedCashfreeLocalOrderId,
          cashfreeOrderId: returnedCashfreeOrderId
        });

        if (ignore) return;

        proceedToSuccess({
          orderId: returnedCashfreeLocalOrderId,
          receipt: verification.receipt?.receiptId,
          gatewayId: 'cashfree_payments',
          amountPaid: verification.order?.amount || total
        });
      } catch (verificationError) {
        if (!ignore) {
          setError(getErrorMessage(verificationError));
          setPayingGatewayId('');
        }
      }
    };

    verifyReturnedCashfreePayment();
    return () => {
      ignore = true;
    };
  }, [returnedCashfreeLocalOrderId, returnedCashfreeOrderId, user, total]);

  const startCheckoutGateway = async (gatewayId) => {
    if (!productId || !product) return;

    try {
      setPayingGatewayId(gatewayId);
      setActiveGatewayId(gatewayId);
      setError('');
      const orderData = gatewayId === 'phonepe_pg'
        ? await createPhonePePayment({ productId, quantity: qty })
        : gatewayId === 'cashfree_payments'
          ? await createCashfreePayment({ productId, quantity: qty })
          : gatewayId === 'hdfc_smartgateway'
            ? await createHdfcPayment({ productId, quantity: qty })
          : await createCheckoutOrder({ productId, quantity: qty, gatewayId });

      await openGatewayCheckout({
        gatewayId,
        checkout: orderData.checkout,
        order: orderData.order,
        onSuccess: async (response) => {
          try {
            const verification = await verifyCheckoutPayment({
              gatewayId,
              orderId: orderData.order.id,
              payload: response
            });

            proceedToSuccess({
              orderId: orderData.order.id,
              receipt: verification.receipt?.receiptId || orderData.order.receipt,
              gatewayId,
              amountPaid: orderData.order.amount || total
            });
          } catch (verificationError) {
            setError(getErrorMessage(verificationError));
          } finally {
            if (gatewayId === 'razorpay_checkout' || orderData.checkout?.provider === 'instant-test') {
              setPayingGatewayId('');
            }
          }
        },
        onFailure: async (failure) => {
          await recordFailedCheckoutPayment({
            orderId: orderData.order.id,
            gatewayId,
            error: failure?.error || failure
          });
          setError(failure?.error?.description || 'Payment failed. Please try again.');
          setPayingGatewayId('');
        },
        onDismiss: async () => {
          await recordFailedCheckoutPayment({
            orderId: orderData.order.id,
            gatewayId,
            error: { description: 'Checkout was closed before completion.' }
          });
          setError('Payment checkout was closed before completion.');
          setPayingGatewayId('');
        }
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setPayingGatewayId('');
    }
  };

  const handleGatewayPay = async (gateway) => {
    if (payingGatewayId) return;
    if (gateway.status === 'available') {
      setError(gateway.configReasons?.[0] || `${gateway.company} is enabled but setup is incomplete. Please finish backend gateway configuration first.`);
      return;
    }
    await startCheckoutGateway(gateway.id);
  };

  const checkoutGateways = gateways.map((gateway) => {
    const statusInfo = gatewayStatuses[gateway.id] || {};
    return {
      ...gateway,
      ready: statusInfo.ready ?? gateway.ready,
      configValid: statusInfo.configValid ?? gateway.configValid,
      status: statusInfo.status ?? gateway.status ?? (gateway.enabled ? 'available' : 'unavailable'),
      configReasons: statusInfo.reasons ?? gateway.configReasons ?? []
    };
  });

  if (loading) return <p className="card">Loading checkout...</p>;
  if (error && !product) return <p className="card text-red-700">{error}</p>;
  if (!product) return <p className="card">Product not found for checkout.</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Checkout</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">Confirm your order before payment</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Review your delivery details and pay with the gateway you prefer. MarketLoop creates the payment session only when you tap that gateway’s pay button below.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <DeliveryAddressCard />
          <DeliverySlotCard />
          <PaymentGatewaySelector
            gateways={checkoutGateways}
            activeGatewayId={activeGatewayId}
            loadingGatewayId={payingGatewayId}
            onPay={handleGatewayPay}
          />
          {!gatewaysLoading && checkoutGateways.length === 0 && (
            <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
              No payment gateways are enabled right now. Please ask the admin to enable at least one checkout gateway.
            </p>
          )}
          {error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            product={product}
            quantity={qty}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
          />
          {gatewaysLoading && (
            <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              Loading available payment gateways...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
