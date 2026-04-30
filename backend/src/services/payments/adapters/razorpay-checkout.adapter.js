import { createHmacSha256Hash, safeSignatureCompare } from '../../../utils/paymentHash.js';
import { getRazorpayConfig, getRazorpayInstance } from '../../../utils/razorpay.js';
import { createPaymentError } from '../errors.js';
import { generateReference, sanitizePayload } from '../helpers.js';
import { SimulationAdapter } from './simulation.adapter.js';

const resolveBackendBridgeUrl = (requestContext = {}) => {
  const explicitBaseUrl = String(process.env.MOBILE_BRIDGE_BASE_URL || '').trim().replace(/\/+$/, '');
  if (explicitBaseUrl) return explicitBaseUrl;

  const protocol = String(requestContext.protocol || 'http').trim() || 'http';
  const host = String(requestContext.host || '').trim();
  if (!host) return 'http://localhost:5001';

  return `${protocol}://${host}`;
};

export class RazorpayCheckoutAdapter extends SimulationAdapter {
  getLiveAvailability() {
    const { keyId, keySecret } = getRazorpayConfig();
    return Boolean(keyId && keySecret);
  }

  async createOrder(context) {
    const { mode, order, amount, currency, product, buyer, seller } = context;

    if (mode === 'test' && !this.getLiveAvailability()) {
      return super.createOrder(context);
    }

    const amountPaise = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      throw createPaymentError('Invalid order amount for Razorpay.', 400, 'INVALID_AMOUNT');
    }

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: order.receipt,
      notes: {
        productId: String(product._id),
        buyerId: String(buyer._id || buyer.id),
        sellerId: String(seller._id || seller.id),
        platform: 'MarketLoop'
      }
    });

    return {
      gatewayOrderId: razorpayOrder.id,
      providerOrderReference: razorpayOrder.id,
      amount,
      amountSubunits: amountPaise,
      currency,
      metadata: {
        simulated: false,
        provider: 'razorpay'
      }
    };
  }

  async initiatePayment({ mode, order, gatewayOrder, product, buyer, requestContext }) {
    if (mode === 'test' && gatewayOrder.metadata?.simulated) {
      return super.initiatePayment({ order, gatewayOrder });
    }

    const serverUrl = resolveBackendBridgeUrl(requestContext);
    const launchUrl = new URL('/api/payment/mobile-bridge/razorpay', serverUrl);
    launchUrl.searchParams.set('gateway', 'razorpay');
    launchUrl.searchParams.set('orderId', String(order._id));
    launchUrl.searchParams.set('productId', String(product._id));
    launchUrl.searchParams.set('amount', String(order.amount));
    launchUrl.searchParams.set('receipt', String(order.receipt));
    launchUrl.searchParams.set('key', String(process.env.RAZORPAY_KEY_ID || ''));
    launchUrl.searchParams.set('order_id', String(gatewayOrder.gatewayOrderId));
    launchUrl.searchParams.set('currency', String(gatewayOrder.currency));
    launchUrl.searchParams.set('name', 'MarketLoop');
    launchUrl.searchParams.set('description', String(product.title || 'MarketLoop order'));
    launchUrl.searchParams.set('prefill_name', String(buyer.name || ''));
    launchUrl.searchParams.set('prefill_email', String(buyer.email || ''));
    launchUrl.searchParams.set('prefill_contact', String(buyer.phone || ''));

    return {
      checkout: {
        provider: 'razorpay',
        key: process.env.RAZORPAY_KEY_ID,
        amount: gatewayOrder.amountSubunits,
        currency: gatewayOrder.currency,
        name: 'MarketLoop',
        description: product.title,
        order_id: gatewayOrder.gatewayOrderId,
        prefill: {
          name: buyer.name,
          email: buyer.email,
          contact: buyer.phone
        },
        launchUrl: launchUrl.toString(),
        notes: {
          productId: String(product._id),
          sellerId: String(product.seller?._id || product.seller)
        }
      }
    };
  }

  async verifyPayment({ mode, payload = {} }) {
    if (mode === 'test' && (!payload.razorpay_signature || !this.getLiveAvailability())) {
      return super.verifyPayment({ payload });
    }

    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = payload;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw createPaymentError('Razorpay verification payload is incomplete.', 400, 'INVALID_VERIFICATION_PAYLOAD');
    }

    const { keySecret } = getRazorpayConfig();
    const expectedSignature = createHmacSha256Hash(keySecret, `${razorpayOrderId}|${razorpayPaymentId}`);
    if (!safeSignatureCompare(expectedSignature, razorpaySignature)) {
      throw createPaymentError('Invalid Razorpay payment signature.', 400, 'INVALID_SIGNATURE');
    }

    let rawPayment = null;
    let method = 'razorpay';
    try {
      const razorpay = getRazorpayInstance();
      rawPayment = await razorpay.payments.fetch(razorpayPaymentId);
      method = rawPayment.method || method;
    } catch {
      rawPayment = sanitizePayload(payload);
    }

    return {
      successful: true,
      status: rawPayment?.status || 'captured',
      gatewayOrderId: razorpayOrderId,
      gatewayPaymentId: razorpayPaymentId,
      signature: razorpaySignature,
      method,
      rawPayload: rawPayment
    };
  }

  async handleWebhook({ rawBody, headers = {} }) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw createPaymentError('RAZORPAY_WEBHOOK_SECRET is not configured.', 503, 'WEBHOOK_NOT_CONFIGURED');
    }

    const signature = headers['x-razorpay-signature'];
    const expected = createHmacSha256Hash(webhookSecret, rawBody);
    if (!safeSignatureCompare(expected, signature)) {
      throw createPaymentError('Invalid Razorpay webhook signature.', 400, 'INVALID_WEBHOOK_SIGNATURE');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const paymentEntity = event.payload?.payment?.entity;
    const successful = event.event === 'payment.captured';

    return {
      eventId: event.payload?.payment?.entity?.id || generateReference('rzp_webhook'),
      successful,
      status: successful ? 'captured' : 'failed',
      gatewayOrderId: paymentEntity?.order_id || '',
      gatewayPaymentId: paymentEntity?.id || '',
      method: paymentEntity?.method || 'razorpay',
      rawPayload: sanitizePayload(paymentEntity || event)
    };
  }

  async refundPayment({ mode, payment, amount, reason }) {
    if (mode === 'test' || !payment?.gatewayPaymentId || !this.getLiveAvailability()) {
      return super.refundPayment({ amount, currency: payment?.currency || 'INR', reason });
    }

    const refundAmount = Math.round(Number(amount) * 100);
    const razorpay = getRazorpayInstance();
    const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
      amount: refundAmount,
      notes: { reason: reason || 'MarketLoop refund' }
    });

    return {
      refundId: refund.id,
      status: refund.status === 'processed' ? 'processed' : 'pending',
      amount,
      currency: payment.currency,
      rawPayload: sanitizePayload(refund)
    };
  }

  async getPaymentStatus({ payment }) {
    if (!payment?.gatewayPaymentId || !this.getLiveAvailability()) {
      return super.getPaymentStatus({ payment });
    }

    const razorpay = getRazorpayInstance();
    const rawPayment = await razorpay.payments.fetch(payment.gatewayPaymentId);
    return {
      status: rawPayment.status || payment.status,
      gatewayPaymentId: payment.gatewayPaymentId,
      method: rawPayment.method,
      rawPayload: sanitizePayload(rawPayment)
    };
  }
}
