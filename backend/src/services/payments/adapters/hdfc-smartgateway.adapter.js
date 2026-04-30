import {
  createOrder as createHdfcSession,
  getHdfcConfig,
  getPaymentStatus as fetchHdfcPaymentStatus,
  handleWebhook as handleHdfcWebhook,
  refundPayment as createHdfcRefund,
  verifyPayment as verifyHdfcPayment
} from '../../hdfcPaymentService.js';
import { createPaymentError } from '../errors.js';
import { generateReference, resolveClientAppUrl, sanitizePayload } from '../helpers.js';
import { PaymentGatewayAdapter } from './base.adapter.js';

const resolveBackendBridgeUrl = (requestContext = {}) => {
  const explicitBaseUrl = String(process.env.MOBILE_BRIDGE_BASE_URL || '').trim().replace(/\/+$/, '');
  if (explicitBaseUrl) return explicitBaseUrl;

  const protocol = String(requestContext.protocol || 'http').trim() || 'http';
  const host = String(requestContext.host || '').trim();
  if (!host) return 'http://localhost:5001';

  return `${protocol}://${host}`;
};

const buildReturnUrl = ({ baseReturnUrl, localOrderId, productId, quantity, gatewayOrderId, receipt }) => {
  const url = new URL(baseReturnUrl);
  url.searchParams.set('localOrderId', String(localOrderId));
  url.searchParams.set('productId', String(productId));
  url.searchParams.set('qty', String(quantity || 1));
  url.searchParams.set('gateway', 'hdfc_smartgateway');
  url.searchParams.set('gatewayOrderId', String(gatewayOrderId || ''));
  url.searchParams.set('receipt', String(receipt || ''));
  return url.toString();
};

const mapHdfcStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'success') return 'captured';
  if (normalized === 'failed') return 'failed';
  if (normalized === 'payment_link_generated') return 'pending';
  if (normalized === 'created') return 'pending';
  return 'pending';
};

const shouldUseMockVerification = ({ order, payment, payload = {} }) => Boolean(
  payload?.mockStatus
  || payload?.mockTxnId
  || payment?.rawPayload?.hdfcMockMode
  || order?.gatewayMetadata?.hdfcMockMode
);

export class HdfcSmartgatewayAdapter extends PaymentGatewayAdapter {
  getLiveAvailability() {
    const config = getHdfcConfig();
    if (config.mockMode) return true;
    return Boolean(
      config.merchantId
      && config.apiKey
      && config.secretKey
      && config.sessionApiUrl
      && config.orderStatusApiUrl
      && config.returnUrl
    );
  }

  async createOrder({ order, amount, currency }) {
    if (!this.getLiveAvailability()) {
      throw createPaymentError(
        'HDFC SmartGateway test configuration is incomplete. Configure HDFC test env vars or enable HDFC_MOCK_MODE.',
        503,
        'HDFC_NOT_CONFIGURED'
      );
    }

    return {
      gatewayOrderId: generateReference('MLHDFC'),
      providerOrderReference: order.receipt,
      amount,
      currency,
      metadata: {
        simulated: getHdfcConfig().mockMode,
        provider: 'hdfc_smartgateway',
        merchantOrderId: order.receipt
      }
    };
  }

  async initiatePayment({ order, gatewayOrder, product, buyer, requestContext }) {
    const clientBaseUrl = resolveClientAppUrl(requestContext);
    const serverBaseUrl = resolveBackendBridgeUrl(requestContext);
    const config = getHdfcConfig();
    const returnUrl = buildReturnUrl({
      baseReturnUrl: config.returnUrl || `${clientBaseUrl}/payment/hdfc/return`,
      localOrderId: order._id,
      productId: product._id,
      quantity: order.quantity || 1,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      receipt: order.receipt
    });

    const session = await createHdfcSession({
      merchantOrderId: order.receipt,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      amount: Number(order.amount),
      currency: order.currency || 'INR',
      customer: {
        id: buyer._id || buyer.id,
        name: buyer.name || 'MarketLoop Buyer',
        email: buyer.email || '',
        phone: buyer.phone || ''
      },
      returnUrl,
      clientBaseUrl,
      orderNote: `MarketLoop order ${order.receipt}`,
      metadata: {
        localOrderId: String(order._id),
        productId: String(product._id),
        quantity: order.quantity || 1
      }
    });

    return {
      status: session.status || 'payment_link_generated',
      metadata: {
        hdfcSessionId: session.session_id || '',
        hdfcPaymentLink: session.payment_link || '',
        hdfcMockMode: Boolean(session.mock)
      },
      checkout: {
        provider: 'redirect-url',
        url: session.payment_link,
        launchUrl: session.mock
          ? new URL(`/api/payment/mobile-bridge/hdfc`, serverBaseUrl).toString()
          : session.payment_link,
        providerName: 'HDFC SmartGateway',
        sessionId: session.session_id || '',
        gatewayOrderId: gatewayOrder.gatewayOrderId,
        returnUrl,
        localOrderId: String(order._id),
        receipt: String(order.receipt),
        mock: Boolean(session.mock)
      }
    };
  }

  async verifyPayment({ order, payment, payload = {} }) {
    if (order?.paymentStatus === 'success' && payment?.gatewayPaymentId) {
      return {
        successful: true,
        status: 'captured',
        gatewayOrderId: payment.gatewayOrderId || order.gatewayOrderId,
        gatewayPaymentId: payment.gatewayPaymentId,
        providerOrderReference: payment.providerOrderReference || order.receipt,
        providerPaymentReference: payment.providerPaymentReference || payment.gatewayPaymentId,
        method: payment.method || 'hdfc_smartgateway',
        rawPayload: sanitizePayload({ duplicateVerification: true })
      };
    }

    const useMockMode = shouldUseMockVerification({ order, payment, payload });
    const verification = await verifyHdfcPayment({
      merchantOrderId: payload.receipt || order.receipt,
      gatewayOrderId: payload.gatewayOrderId || order.gatewayOrderId,
      payload,
      forceMockMode: useMockMode
    });

    const normalizedStatus = mapHdfcStatus(verification.status);

    return {
      successful: verification.successful,
      status: normalizedStatus,
      gatewayOrderId: payload.gatewayOrderId || order.gatewayOrderId,
      gatewayPaymentId: verification.payment_id || '',
      providerOrderReference: order.receipt,
      providerPaymentReference: verification.payment_id || '',
      method: 'hdfc_smartgateway',
      failureReason: verification.successful ? '' : `HDFC status is ${verification.status}.`,
      rawPayload: sanitizePayload(verification.raw || {}),
      verificationPayload: sanitizePayload(payload)
    };
  }

  async handleWebhook({ parsedPayload, headers, rawBody }) {
    const verification = await handleHdfcWebhook(parsedPayload || {}, headers || {}, rawBody || '');
    const normalizedStatus = mapHdfcStatus(verification.status);

    return {
      successful: verification.successful,
      status: normalizedStatus,
      gatewayOrderId: verification.gateway_order_id || parsedPayload?.gatewayOrderId || '',
      gatewayPaymentId: verification.payment_id || '',
      providerOrderReference: verification.order_id || '',
      providerPaymentReference: verification.payment_id || '',
      method: 'hdfc_smartgateway',
      failureReason: verification.successful ? '' : `HDFC webhook returned ${verification.status}.`,
      rawPayload: sanitizePayload(verification.raw || parsedPayload || {})
    };
  }

  async refundPayment({ payment, amount }) {
    const response = await createHdfcRefund({
      paymentId: payment?.gatewayPaymentId,
      amount
    });

    return {
      refundId: response.refundId,
      status: response.status,
      amount,
      currency: payment?.currency || 'INR',
      rawPayload: sanitizePayload(response.raw || {})
    };
  }

  async getPaymentStatus({ order, payment }) {
    const useMockMode = shouldUseMockVerification({ order, payment });
    const response = await fetchHdfcPaymentStatus({
      merchantOrderId: order?.receipt,
      gatewayOrderId: payment?.gatewayOrderId || order?.gatewayOrderId,
      forceMockMode: useMockMode
    });

    return {
      status: mapHdfcStatus(response.status),
      gatewayPaymentId: response.payment_id || payment?.gatewayPaymentId || '',
      method: payment?.method || 'hdfc_smartgateway',
      rawPayload: sanitizePayload(response.raw || {})
    };
  }
}
