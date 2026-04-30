import { paymentGatewayRegistry } from '../services/payments/gateway-registry.service.js';
import { paymentService } from '../services/payments/payment.service.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import PaymentWebhookEvent from '../models/PaymentWebhookEvent.js';
import { sendSuccess } from '../utils/apiResponse.js';

const htmlEscape = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatGatewayResponse = (gateway) => ({
  id: gateway.id,
  company: gateway.company,
  type: gateway.type,
  purpose: gateway.purpose,
  implementationStatus: gateway.implementationStatus,
  enabled: gateway.enabled,
  runtimeAvailable: gateway.runtimeAvailable,
  paymentMode: gateway.paymentMode,
  configured: gateway.configured,
  ready: gateway.ready,
  configValid: gateway.configValid,
  configReasons: gateway.configReasons,
  status: gateway.status
});

export const listCheckoutGateways = async (_req, res) => {
  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const defaultGateway = paymentGatewayRegistry.getDefaultCheckoutGatewayId();
  const visibleGatewayIds = new Set([
    'razorpay_checkout',
    'cashfree_payments',
    'phonepe_pg',
    'payu_india',
    'hdfc_smartgateway'
  ]);
  const visibleGateways = gateways.filter((gateway) => visibleGatewayIds.has(gateway.id));
  return sendSuccess(res, {
    mode: paymentGatewayRegistry.getGatewayMode(),
    paymentMode: paymentGatewayRegistry.getPaymentMode(),
    defaultGateway,
    gateways: visibleGateways.map(formatGatewayResponse)
  });
};

export const listAdminGateways = async (_req, res) => {
  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  return sendSuccess(res, {
    mode: paymentGatewayRegistry.getGatewayMode(),
    paymentMode: paymentGatewayRegistry.getPaymentMode(),
    defaultGateway: paymentGatewayRegistry.getDefaultCheckoutGatewayId(),
    payoutGateway: paymentGatewayRegistry.getDefaultPayoutGatewayId(),
    gateways
  });
};

export const getAdminGatewayStatus = async (_req, res) => {
  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const gatewayIds = gateways.map((gateway) => gateway.id);

  const [paymentStats, latestPayments, latestWebhookEvents] = await Promise.all([
    Payment.aggregate([
      { $match: { gatewayId: { $in: gatewayIds } } },
      {
        $group: {
          _id: { gatewayId: '$gatewayId', lifecycleStatus: '$lifecycleStatus', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]),
    Payment.find({ gatewayId: { $in: gatewayIds } })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('gatewayId status lifecycleStatus gatewayOrderId gatewayPaymentId amount currency updatedAt order')
      .lean(),
    PaymentWebhookEvent.find({ gatewayId: { $in: gatewayIds } })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('gatewayId eventId status processedAt createdAt order')
      .lean()
  ]);

  const paymentCountsMap = paymentStats.reduce((accumulator, entry) => {
    const gatewayId = entry._id?.gatewayId;
    if (!gatewayId) return accumulator;
    if (!accumulator[gatewayId]) {
      accumulator[gatewayId] = {
        total: 0,
        lifecycle: {},
        processing: {}
      };
    }
    accumulator[gatewayId].total += entry.count;
    if (entry._id.lifecycleStatus) {
      accumulator[gatewayId].lifecycle[entry._id.lifecycleStatus] = entry.count;
    }
    if (entry._id.status) {
      accumulator[gatewayId].processing[entry._id.status] = entry.count;
    }
    return accumulator;
  }, {});

  const latestPaymentMap = latestPayments.reduce((accumulator, payment) => {
    if (!accumulator[payment.gatewayId]) accumulator[payment.gatewayId] = payment;
    return accumulator;
  }, {});

  const latestWebhookMap = latestWebhookEvents.reduce((accumulator, event) => {
    if (!accumulator[event.gatewayId]) accumulator[event.gatewayId] = event;
    return accumulator;
  }, {});

  const response = gateways.map((gateway) => ({
    ...formatGatewayResponse(gateway),
    latestResponseStatus: latestPaymentMap[gateway.id]?.status || latestWebhookMap[gateway.id]?.status || 'no_activity',
    paymentSummary: paymentCountsMap[gateway.id] || {
      total: 0,
      lifecycle: {},
      processing: {}
    },
    latestPayment: latestPaymentMap[gateway.id]
      ? {
          orderId: String(latestPaymentMap[gateway.id].order || ''),
          status: latestPaymentMap[gateway.id].status,
          lifecycleStatus: latestPaymentMap[gateway.id].lifecycleStatus,
          gatewayOrderId: latestPaymentMap[gateway.id].gatewayOrderId,
          gatewayPaymentId: latestPaymentMap[gateway.id].gatewayPaymentId,
          amount: latestPaymentMap[gateway.id].amount,
          currency: latestPaymentMap[gateway.id].currency,
          updatedAt: latestPaymentMap[gateway.id].updatedAt
        }
      : null,
    latestWebhook: latestWebhookMap[gateway.id]
      ? {
          eventId: latestWebhookMap[gateway.id].eventId,
          status: latestWebhookMap[gateway.id].status,
          processedAt: latestWebhookMap[gateway.id].processedAt,
          createdAt: latestWebhookMap[gateway.id].createdAt,
          orderId: String(latestWebhookMap[gateway.id].order || '')
        }
      : null
  }));

  return sendSuccess(res, {
    generatedAt: new Date().toISOString(),
    gateways: response
  });
};

export const getGatewayStatus = async (_req, res) => {
  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const visibleGatewayIds = new Set([
    'razorpay_checkout',
    'cashfree_payments',
    'phonepe_pg',
    'payu_india',
    'hdfc_smartgateway'
  ]);

  const statusMap = gateways
    .filter((gateway) => visibleGatewayIds.has(gateway.id))
    .reduce((accumulator, gateway) => {
      accumulator[gateway.id] = {
        enabled: gateway.enabled,
        ready: gateway.ready,
        configValid: gateway.configValid,
        status: gateway.status,
        reasons: gateway.configReasons || []
      };
      return accumulator;
    }, {});

  return sendSuccess(res, statusMap);
};

export const updateAdminGateway = async (req, res) => {
  const setting = await paymentService.updateAdminGateway({
    gatewayId: req.params.gatewayId,
    payload: req.body,
    adminUserId: req.user._id
  });
  return sendSuccess(res, { setting }, { message: 'Gateway setting updated' });
};

export const createCheckoutOrder = async (req, res) => {
  const { productId, quantity, gatewayId, paymentGateway, gateway, gatewayVariant } = req.body;
  const selectedGatewayId = gatewayId
    || (paymentGateway === 'payu' ? 'payu_india' : paymentGateway)
    || (gateway ? 'payu_india' : '')
    || (gatewayVariant ? 'payu_india' : '');
  const result = await paymentService.createCheckoutOrder({
    productId,
    quantity,
    buyerUser: req.user,
    selectedGatewayId,
    selectedGatewayVariant: gatewayVariant || gateway,
    requestContext: {
      protocol: req.headers['x-forwarded-proto'] || req.protocol || 'http',
      host: req.get('host') || '',
      origin: req.get('origin') || ''
    }
  });

  return sendSuccess(res, {
    order: {
      id: result.order._id,
      receipt: result.order.receipt,
      quantity: result.order.quantity,
      subtotal: result.order.subtotal,
      deliveryFee: result.order.deliveryFee,
      amount: result.order.amount,
      currency: result.order.currency,
      gatewayCompany: result.gateway.company,
      gatewayId: result.gateway.id,
      gatewayType: result.gateway.type,
      gatewayOrderId: result.order.gatewayOrderId
    },
    checkout: result.checkout
  }, {
    statusCode: 201,
    message: 'Checkout order created successfully'
  });
};

export const verifyCheckoutPayment = async (req, res) => {
  const { gatewayId, orderId, payload, ...legacyPayload } = req.body;
  const resolvedGatewayId = gatewayId
    || (legacyPayload.razorpay_order_id ? 'razorpay_checkout' : '')
    || (legacyPayload.merchantTransactionId || legacyPayload.transactionId ? 'phonepe_pg' : '')
    || 'payu_india';
  const resolvedOrderId = orderId || req.body.orderId;
  const verificationPayload = payload || legacyPayload;

  const result = await paymentService.verifyOrderPayment({
    gatewayId: resolvedGatewayId,
    orderId: resolvedOrderId,
    payload: verificationPayload,
    buyerUser: req.user
  });

  return sendSuccess(res, {
    order: result.order,
    receipt: result.receipt
  }, {
    message: result.receipt ? 'Payment verified successfully' : 'Payment verification completed'
  });
};

export const createPhonePeCheckout = async (req, res) => {
  req.body.gatewayId = 'phonepe_pg';
  return createCheckoutOrder(req, res);
};

export const createRazorpayCheckout = async (req, res) => {
  req.body.gatewayId = 'razorpay_checkout';
  return createCheckoutOrder(req, res);
};

export const createPayuCheckout = async (req, res) => {
  req.body.gatewayId = 'payu_india';
  return createCheckoutOrder(req, res);
};

export const createCashfreeCheckout = async (req, res) => {
  req.body.gatewayId = 'cashfree_payments';
  return createCheckoutOrder(req, res);
};

export const createHdfcCheckout = async (req, res) => {
  req.body.gatewayId = 'hdfc_smartgateway';
  return createCheckoutOrder(req, res);
};

export const verifyPhonePeCheckout = async (req, res) => {
  req.body.gatewayId = 'phonepe_pg';
  return verifyCheckoutPayment(req, res);
};

export const verifyCashfreeCheckout = async (req, res) => {
  req.body.gatewayId = 'cashfree_payments';
  return verifyCheckoutPayment(req, res);
};

export const verifyHdfcCheckout = async (req, res) => {
  req.body.gatewayId = 'hdfc_smartgateway';
  req.body.orderId = req.body.orderId || req.query.orderId || req.body.localOrderId || req.query.localOrderId;
  req.body.payload = req.body.payload || {
    ...req.query,
    ...req.body
  };
  return verifyCheckoutPayment(req, res);
};

export const handlePhonePeWebhook = async (req, res) => {
  req.params.gatewayId = 'phonepe_pg';
  return handlePaymentWebhook(req, res);
};

export const handleCashfreeWebhook = async (req, res) => {
  req.params.gatewayId = 'cashfree_payments';
  return handlePaymentWebhook(req, res);
};

export const handleHdfcWebhook = async (req, res) => {
  req.params.gatewayId = 'hdfc_smartgateway';
  return handlePaymentWebhook(req, res);
};

export const recordCheckoutFailure = async (req, res) => {
  const { orderId, razorpayOrderId, error, gatewayId } = req.body;
  let resolvedOrderId = orderId;

  if (!resolvedOrderId) {
    const order = await Order.findOne({
      $or: [
        ...(razorpayOrderId ? [{ razorpayOrderId }] : []),
        ...(gatewayId && razorpayOrderId ? [{ gatewayId, gatewayOrderId: razorpayOrderId }] : [])
      ],
      buyer: req.user._id
    });
    resolvedOrderId = order?._id;
  }

  const order = await paymentService.recordFailedPayment({
    orderId: resolvedOrderId,
    buyerUser: req.user,
    errorPayload: error
  });

  return sendSuccess(res, { order }, { message: 'Payment failure recorded' });
};

export const getMyOrders = async (req, res) => {
  const orders = await paymentService.getMyOrders({ buyerUserId: req.user._id });
  return sendSuccess(res, { orders });
};

export const getPaymentByOrder = async (req, res) => {
  const detail = await paymentService.getOrderPaymentDetail({ orderId: req.params.orderId, userId: req.user._id });
  return sendSuccess(res, detail);
};

export const getOrderPaymentStatus = async (req, res) => {
  const detail = await paymentService.getPaymentStatus({ orderId: req.params.orderId, userId: req.user._id });
  return sendSuccess(res, detail);
};

export const refundPayment = async (req, res) => {
  const { orderId, amount, reason } = req.body;
  const result = await paymentService.refundOrderPayment({
    orderId,
    amount,
    reason,
    requestedBy: req.user
  });
  return sendSuccess(res, {
    order: result.order,
    payment: result.payment,
    refund: result.refund
  }, {
    message: 'Refund request processed'
  });
};

export const handlePaymentWebhook = async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  let parsedPayload = {};

  if (Buffer.isBuffer(req.body)) {
    const text = req.body.toString('utf8').trim();
    if (text) {
      try {
        parsedPayload = JSON.parse(text);
      } catch {
        parsedPayload = req.body.toString('utf8');
      }
    }
  } else {
    parsedPayload = req.body || {};
  }

  const result = await paymentService.handleWebhook({
    gatewayId: req.params.gatewayId,
    rawBody,
    parsedPayload,
    headers: req.headers
  });

  return sendSuccess(res, {
    received: true,
    duplicate: result.duplicate || false,
    ignored: result.ignored || false
  });
};

export const handlePayuCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const result = await paymentService.handleWebhook({
      gatewayId: 'payu_india',
      rawBody: Buffer.from(JSON.stringify(req.body || {})),
      parsedPayload: req.body,
      headers: req.headers
    });

    if (result.order?._id) {
      const status = result.order.paymentStatus === 'success' ? 'success' : 'failed';
      const productId = String(result.order.product?._id || result.order.product || '');

      if (status === 'success') {
        const successParams = new URLSearchParams({
          orderId: String(result.order._id),
          amount: String(result.order.amount || ''),
          receipt: String(result.order.receipt || ''),
          gateway: 'payu_india'
        });
        return res.redirect(`${clientUrl}/order-success?${successParams.toString()}`);
      }

      const failureParams = new URLSearchParams({
        productId,
        qty: String(result.order.quantity || 1),
        gateway: 'payu_india',
        status: 'failed',
        orderId: String(result.order._id),
        reason: String(result.order.failureReason || 'PayU payment failed or was cancelled.')
      });
      return res.redirect(`${clientUrl}/checkout?${failureParams.toString()}`);
    }

    return res.redirect(`${clientUrl}/checkout?status=failed&gateway=payu_india&reason=payu_callback_unmatched`);
  } catch {
    return res.redirect(`${clientUrl}/checkout?status=failed&gateway=payu_india&reason=payu_callback_failed`);
  }
};

export const renderMobileRazorpayBridge = async (req, res) => {
  const {
    gateway = 'razorpay',
    orderId = '',
    productId = '',
    amount = '',
    receipt = '',
    key = '',
    order_id: razorpayOrderId = '',
    currency = 'INR',
    name = 'MarketLoop',
    description = 'MarketLoop order',
    prefill_name: prefillName = '',
    prefill_email: prefillEmail = '',
    prefill_contact: prefillContact = ''
  } = req.query || {};

  const safePayload = {
    gateway,
    orderId,
    productId,
    amount,
    receipt,
    key,
    razorpayOrderId,
    currency,
    name,
    description,
    prefillName,
    prefillEmail,
    prefillContact
  };

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self' data: blob:",
      "base-uri 'self'",
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
      "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
      "form-action 'self' https://checkout.razorpay.com https://api.razorpay.com"
    ].join('; ')
  );
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MarketLoop Payment Bridge</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #f7f8fa; color: #0f172a; }
      .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .card { width: 100%; max-width: 520px; background: white; border: 1px solid #e2e8f0; border-radius: 28px; padding: 28px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
      .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #059669; }
      h1 { margin: 12px 0 0; font-size: 34px; line-height: 1.1; }
      p { margin: 14px 0 0; color: #475569; line-height: 1.7; }
      .hint { margin-top: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; }
      .actions { margin-top: 20px; display: grid; gap: 12px; }
      button { border: 0; border-radius: 18px; padding: 14px 18px; font-size: 15px; font-weight: 700; cursor: pointer; }
      .primary { background: #10b981; color: white; }
      .secondary { background: white; color: #334155; border: 1px solid #e2e8f0; }
      .hidden { display: none; }
      .error { color: #dc2626; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="eyebrow">MarketLoop Mobile Checkout</div>
        <h1>Opening secure payment</h1>
        <p id="message">Tap below to continue to Razorpay securely.</p>
        <p class="hint">Do not close this page until the gateway finishes.</p>
        <div id="actions" class="actions">
          <button id="openButton" class="primary" type="button">Continue to Razorpay</button>
          <button id="retryButton" class="secondary hidden" type="button">Retry opening Razorpay</button>
          <button id="returnButton" class="secondary" type="button">Return to MarketLoop app</button>
        </div>
      </div>
    </div>
    <script>
      const data = ${JSON.stringify(safePayload)};
      const messageEl = document.getElementById('message');
      const actionsEl = document.getElementById('actions');
      const openButton = document.getElementById('openButton');
      const retryButton = document.getElementById('retryButton');
      const returnButton = document.getElementById('returnButton');
      let isOpening = false;
      let scriptLoaded = false;
      let autoAttempted = false;

      const buildDeepLink = (path, params = {}) => {
        const url = new URL('marketloop://' + path);
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, String(value));
          }
        });
        return url.toString();
      };

      const failureDeepLink = buildDeepLink('payments/result', {
        status: 'failed',
        gateway: data.gateway,
        productId: data.productId,
        orderId: data.orderId,
        amount: data.amount,
        receipt: data.receipt
      });

      const showRecovery = (reason) => {
        messageEl.textContent = reason;
        messageEl.classList.add('error');
        openButton.classList.remove('hidden');
        retryButton.classList.remove('hidden');
        openButton.disabled = false;
        retryButton.disabled = false;
        isOpening = false;
      };

      const returnToApp = (reason) => {
        window.location.replace(failureDeepLink + '&reason=' + encodeURIComponent(reason || 'Razorpay checkout was not opened.'));
      };

      const loadRazorpay = () => new Promise((resolve, reject) => {
        if (window.Razorpay) {
          scriptLoaded = true;
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          scriptLoaded = true;
          window.Razorpay ? resolve(true) : reject(new Error('Razorpay checkout loaded but was not initialized.'));
        };
        script.onerror = () => reject(new Error('Could not load Razorpay checkout.'));
        document.body.appendChild(script);
        window.setTimeout(() => reject(new Error('Razorpay checkout timed out while loading.')), 12000);
      });

      const showBlockedState = () => {
        if (!isOpening) return;
        messageEl.textContent = 'If Razorpay did not open automatically, tap Continue to Razorpay again.';
        messageEl.classList.remove('error');
        openButton.classList.remove('hidden');
        retryButton.classList.remove('hidden');
        openButton.disabled = false;
        retryButton.disabled = false;
        isOpening = false;
      };

      const startRazorpay = async ({ manual = false } = {}) => {
        if (isOpening) return;
        if (!data.key || !data.razorpayOrderId || !data.orderId) {
          showRecovery('Missing Razorpay checkout parameters.');
          return;
        }

        try {
          isOpening = true;
          messageEl.classList.remove('error');
          messageEl.textContent = scriptLoaded ? 'Opening Razorpay checkout...' : 'Loading Razorpay secure checkout...';
          openButton.disabled = true;
          retryButton.disabled = true;
          if (manual) {
            openButton.textContent = 'Opening Razorpay...';
          }
          await loadRazorpay();

          const razorpay = new window.Razorpay({
            key: data.key,
            amount: Math.round(Number(data.amount || 0) * 100),
            currency: data.currency || 'INR',
            name: data.name || 'MarketLoop',
            description: data.description || 'MarketLoop order',
            order_id: data.razorpayOrderId,
            prefill: {
              name: data.prefillName || '',
              email: data.prefillEmail || '',
              contact: data.prefillContact || ''
            },
            theme: { color: '#10b981' },
            handler: (response) => {
              const deepLink = buildDeepLink('payments/pending', {
                gateway: data.gateway,
                productId: data.productId,
                orderId: data.orderId,
                amount: data.amount,
                receipt: data.receipt,
                verify: 'razorpay',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              window.location.replace(deepLink);
            },
            modal: {
              ondismiss: () => returnToApp('Razorpay checkout was closed before payment completed.')
            }
          });

          razorpay.on('payment.failed', (response) => {
            const reason = response && response.error && response.error.description ? response.error.description : 'Razorpay payment failed.';
            returnToApp(reason);
          });

          window.setTimeout(showBlockedState, 2500);
          razorpay.open();
        } catch (error) {
          showRecovery(error && error.message ? error.message : 'We could not open Razorpay automatically.');
        }
      };

      openButton.addEventListener('click', () => startRazorpay({ manual: true }));

      retryButton.addEventListener('click', () => {
        retryButton.classList.add('hidden');
        openButton.classList.remove('hidden');
        openButton.textContent = 'Continue to Razorpay';
        startRazorpay({ manual: true });
      });

      returnButton.addEventListener('click', () => returnToApp(messageEl.textContent));
      window.addEventListener('load', () => {
        if (autoAttempted) return;
        autoAttempted = true;
        window.setTimeout(() => startRazorpay(), 400);
      });
    </script>
  </body>
</html>`);
};

export const renderMobileHdfcBridge = async (req, res) => {
  const {
    orderId = '',
    gatewayOrderId = '',
    receipt = '',
    amount = '',
    currency = 'INR',
    gateway = 'hdfc',
    productId = '',
    quantity = '1'
  } = req.query || {};

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MarketLoop HDFC Sandbox</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #f7f8fa; color: #0f172a; }
      .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .card { width: 100%; max-width: 520px; background: white; border: 1px solid #e2e8f0; border-radius: 28px; padding: 28px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
      .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #059669; }
      h1 { margin: 12px 0 0; font-size: 34px; line-height: 1.1; }
      p { margin: 14px 0 0; color: #475569; line-height: 1.7; }
      .amount { margin-top: 18px; font-size: 20px; font-weight: 700; color: #047857; }
      .actions { margin-top: 24px; display: grid; gap: 12px; }
      button { border: 0; border-radius: 18px; padding: 14px 18px; font-size: 15px; font-weight: 700; cursor: pointer; }
      .primary { background: #10b981; color: white; }
      .secondary { background: white; color: #334155; border: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="eyebrow">MarketLoop HDFC Sandbox</div>
        <h1>Continue to HDFC payment</h1>
        <p>This mobile bridge simulates the HDFC SmartGateway sandbox flow and returns to the app with a verifiable payment status.</p>
        <p class="amount">Amount: ${htmlEscape(currency)} ${htmlEscape(amount)}</p>
        <div class="actions">
          <button id="successButton" class="primary" type="button">Simulate successful payment</button>
          <button id="failedButton" class="secondary" type="button">Simulate failed payment</button>
          <button id="pendingButton" class="secondary" type="button">Simulate pending payment</button>
        </div>
      </div>
    </div>
    <script>
      const params = ${JSON.stringify({
        orderId,
        gatewayOrderId,
        receipt,
        amount,
        currency,
        gateway,
        productId,
        quantity
      })};

      const buildDeepLink = (status) => {
        const url = new URL('marketloop://payments/pending');
        url.searchParams.set('gateway', params.gateway || 'hdfc');
        url.searchParams.set('gatewayTitle', 'HDFC SmartGateway');
        url.searchParams.set('orderId', params.orderId || '');
        url.searchParams.set('receipt', params.receipt || '');
        url.searchParams.set('amount', params.amount || '');
        url.searchParams.set('productId', params.productId || '');
        url.searchParams.set('quantity', params.quantity || '1');
        url.searchParams.set('verify', 'hdfc');
        url.searchParams.set('gatewayOrderId', params.gatewayOrderId || '');
        url.searchParams.set('mockStatus', status);
        url.searchParams.set('mockTxnId', 'HDFC_TXN_' + Date.now());
        return url.toString();
      };

      document.getElementById('successButton').addEventListener('click', () => {
        window.location.replace(buildDeepLink('success'));
      });
      document.getElementById('failedButton').addEventListener('click', () => {
        window.location.replace(buildDeepLink('failed'));
      });
      document.getElementById('pendingButton').addEventListener('click', () => {
        window.location.replace(buildDeepLink('pending'));
      });
    </script>
  </body>
</html>`);
};
