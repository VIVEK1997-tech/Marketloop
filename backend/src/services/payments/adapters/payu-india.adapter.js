import { buildPayuPaymentHash, getPayuGatewayConfig, getPublicPayuConfig, verifyPayuResponseHash } from '../../../utils/payu.js';
import { createPaymentError } from '../errors.js';
import { generateReference, sanitizePayload } from '../helpers.js';
import { SimulationAdapter } from './simulation.adapter.js';

const sanitizePayuText = (value, fallback) => String(value || fallback).replace(/[|]/g, ' ').trim();
const normalizePayuPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(-10);
  return digits || '9999999999';
};

export class PayuIndiaAdapter extends SimulationAdapter {
  getLiveAvailability() {
    try {
      getPayuGatewayConfig('primary');
      return true;
    } catch {
      return false;
    }
  }

  async createOrder(context) {
    const { mode, order, amount, currency, product, buyer, seller, definition } = context;

    if (mode === 'test' && !this.getLiveAvailability()) {
      return super.createOrder(context);
    }

    const amountFixed = Number(amount).toFixed(2);
    if (!Number.isFinite(Number(amountFixed)) || Number(amountFixed) <= 0) {
      throw createPaymentError('Invalid order amount for PayU.', 400, 'INVALID_AMOUNT');
    }

    const selectedGateway = String(order.gatewayMetadata?.providerVariant || 'primary');
    const payuConfig = getPayuGatewayConfig(selectedGateway);
    const txnid = generateReference('MLPAYU');
    const productinfo = sanitizePayuText(product.title, 'MarketLoop Product');
    const firstname = sanitizePayuText(buyer.name, 'MarketLoop Buyer');
    const email = sanitizePayuText(buyer.email, 'buyer@marketloop.local');
    const phone = normalizePayuPhone(buyer.phone);
    const udf1 = String(product._id);
    const udf2 = String(seller._id || seller.id);
    const udf3 = String(buyer._id || buyer.id);
    const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const callbackUrl = `${apiBaseUrl}/api/payment/payu/callback`;
    const hash = buildPayuPaymentHash({
      key: payuConfig.key,
      txnid,
      amount: amountFixed,
      productinfo,
      firstname,
      email,
      udf1,
      udf2,
      udf3,
      salt: payuConfig.salt
    });

    return {
      gatewayOrderId: txnid,
      providerOrderReference: txnid,
      amount: amountFixed,
      currency,
      metadata: {
        simulated: false,
        provider: definition.id,
        config: getPublicPayuConfig(payuConfig),
        checkoutForm: {
          ...getPublicPayuConfig(payuConfig),
          txnid,
          amount: amountFixed,
          productinfo,
          firstname,
          email,
          phone,
          surl: callbackUrl,
          furl: callbackUrl,
          hash,
          udf1,
          udf2,
          udf3
        }
      }
    };
  }

  async initiatePayment({ mode, order, gatewayOrder }) {
    if (mode === 'test' && gatewayOrder.metadata?.simulated) {
      return super.initiatePayment({ order, gatewayOrder });
    }

    return {
      checkout: {
        provider: 'redirect-form',
        ...gatewayOrder.metadata.checkoutForm
      }
    };
  }

  async verifyPayment({ mode, order, payload = {} }) {
    if (mode === 'test' && !payload.hash) {
      return super.verifyPayment({ payload });
    }

    const payuConfig = getPayuGatewayConfig(order?.gatewayVariant || order?.gatewayMetadata?.providerVariant || 'primary');
    const valid = verifyPayuResponseHash({ payload, key: payuConfig.key, salt: payuConfig.salt });

    if (!valid) {
      throw createPaymentError('Invalid PayU payment signature.', 400, 'INVALID_SIGNATURE');
    }

    const successful = String(payload.status).toLowerCase() === 'success';
    return {
      successful,
      status: successful ? 'captured' : 'failed',
      gatewayOrderId: payload.txnid || order?.gatewayOrderId || '',
      gatewayPaymentId: payload.mihpayid || payload.txnid || generateReference('PAYU_PAY'),
      signature: payload.hash,
      method: payload.mode || 'payu',
      rawPayload: sanitizePayload(payload)
    };
  }

  async handleWebhook({ parsedPayload = {}, order }) {
    return this.verifyPayment({ mode: 'live', order, payload: parsedPayload });
  }

  async refundPayment({ mode, payment, amount, reason }) {
    if (mode === 'test') {
      return super.refundPayment({ amount, currency: payment?.currency || 'INR', reason });
    }

    throw createPaymentError('PayU refunds are not automated in this build yet. Use the provider dashboard or add the live refund API next.', 501, 'REFUND_NOT_IMPLEMENTED');
  }
}
