import { loadRazorpayCheckout } from './razorpay.js';
import { submitPayuCheckout } from './payu.js';

export const launchGatewayCheckout = async ({
  gateway,
  orderResponse,
  verifyPayment,
  recordFailure,
  onProcessing,
  onSuccess,
  onError
}) => {
  const checkout = orderResponse?.checkout || {};
  const order = orderResponse?.order || {};

  try {
    if (checkout.provider === 'razorpay') {
      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded. Please refresh and try again.');
      }

      onProcessing?.(`Opening ${gateway.company} checkout...`);

      const options = {
        ...checkout,
        image: '/favicon.svg',
        theme: { color: '#0891b2' },
        handler: async (response) => {
          try {
            const verification = await verifyPayment({
              gatewayId: gateway.id,
              orderId: order.id,
              payload: response
            });
            onSuccess?.(verification.data?.receipt || null);
          } catch (error) {
            onError?.(error);
          }
        },
        modal: {
          ondismiss: () => {
            recordFailure?.({
              orderId: order.id,
              gatewayId: gateway.id,
              error: { description: `${gateway.company} checkout was closed before payment completed.` }
            });
            onError?.(new Error('Payment failed or cancelled'));
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (response) => {
        await recordFailure?.({
          orderId: order.id,
          gatewayId: gateway.id,
          error: response.error
        });
        onError?.(new Error(response.error?.description || 'Payment failed or cancelled'));
      });
      razorpay.open();
      return;
    }

    if (checkout.provider === 'redirect-form') {
      onProcessing?.(`Redirecting to ${gateway.company} checkout...`);
      submitPayuCheckout(checkout);
      return;
    }

    if (checkout.provider === 'instant-test') {
      onProcessing?.(`Running ${gateway.company} test checkout...`);
      const verification = await verifyPayment({
        gatewayId: gateway.id,
        orderId: order.id,
        payload: {
          simulateStatus: checkout.simulateStatus || 'success',
          gatewayOrderId: order.gatewayOrderId
        }
      });
      onSuccess?.(verification.data?.receipt || null);
      return;
    }

    if (checkout.provider === 'redirect-url' && checkout.url) {
      onProcessing?.(`Redirecting to ${gateway.company}...`);
      window.location.assign(checkout.url);
      return;
    }

    throw new Error(`${gateway.company} checkout is not available in this web client yet.`);
  } catch (error) {
    onError?.(error);
  }
};
