import PaymentGatewaySetting from '../../models/PaymentGatewaySetting.js';
import { getGatewayDefinition, normalizeGatewayId, paymentGateways } from '../../config/paymentGateways.js';
import { CashfreePaymentsAdapter } from './adapters/cashfree-payments.adapter.js';
import { HdfcSmartgatewayAdapter } from './adapters/hdfc-smartgateway.adapter.js';
import { PhonePePgAdapter } from './adapters/phonepe-pg.adapter.js';
import { PlaceholderAdapter } from './adapters/placeholder.adapter.js';
import { PayuIndiaAdapter } from './adapters/payu-india.adapter.js';
import { RazorpayCheckoutAdapter } from './adapters/razorpay-checkout.adapter.js';
import { SimulationAdapter } from './adapters/simulation.adapter.js';
import { createPaymentError } from './errors.js';
import { parseCsv } from './helpers.js';

const TEST_IMPLEMENTED_GATEWAYS = new Set(['stripe', 'paypal_india']);

const getPaymentMode = () => (String(process.env.PAYMENT_MODE || 'test').trim().toLowerCase() === 'live' ? 'live' : 'test');
const getGatewayMode = () => (String(process.env.PAYMENT_GATEWAY_MODE || 'single').trim().toLowerCase() === 'multiple' ? 'multiple' : 'single');
const getDefaultCheckoutGatewayId = () => normalizeGatewayId(process.env.PAYMENT_GATEWAY || 'razorpay_checkout');
const getDefaultPayoutGatewayId = () => normalizeGatewayId(process.env.DEFAULT_PAYOUT_GATEWAY || 'cashfree_payouts');

const getConfiguredCheckoutGatewayIds = () => {
  if (getGatewayMode() === 'single') return [getDefaultCheckoutGatewayId()];
  const enabled = parseCsv(process.env.ENABLED_PAYMENT_GATEWAYS).map(normalizeGatewayId);
  return enabled.length ? enabled : [getDefaultCheckoutGatewayId()];
};

const instantiateAdapter = (definition) => {
  if (definition.id === 'razorpay_checkout') return new RazorpayCheckoutAdapter(definition);
  if (definition.id === 'payu_india') return new PayuIndiaAdapter(definition);
  if (definition.id === 'cashfree_payments') return new CashfreePaymentsAdapter(definition);
  if (definition.id === 'phonepe_pg') return new PhonePePgAdapter(definition);
  if (definition.id === 'hdfc_smartgateway') return new HdfcSmartgatewayAdapter(definition);
  if (TEST_IMPLEMENTED_GATEWAYS.has(definition.id)) return new SimulationAdapter(definition);
  return new PlaceholderAdapter(definition);
};

const getSupportedPaymentModes = (definition) => {
  if (Array.isArray(definition.supportedPaymentModes) && definition.supportedPaymentModes.length) {
    return definition.supportedPaymentModes;
  }

  const supportedModes = [];
  if (definition.testSupported) supportedModes.push('test');
  if (definition.liveSupported) supportedModes.push('live');
  return supportedModes;
};

const getMissingEnv = (definition) => {
  const missing = [];

  if (Array.isArray(definition.requiredEnvGroups) && definition.requiredEnvGroups.length) {
    definition.requiredEnvGroups.forEach((group) => {
      const keys = Array.isArray(group?.keys) ? group.keys : [];
      const present = keys.some((key) => String(process.env[key] || '').trim());
      if (!present) missing.push(group?.label || keys[0]);
    });
  }

  if (Array.isArray(definition.requiredEnv) && definition.requiredEnv.length) {
    definition.requiredEnv.forEach((key) => {
      if (!String(process.env[key] || '').trim()) missing.push(key);
    });
  }

  return [...new Set(missing.filter(Boolean))];
};

const getRuntimeState = (definition, paymentMode) => {
  const supportedModes = getSupportedPaymentModes(definition);
  const modeSupported = supportedModes.includes(paymentMode);
  if (!modeSupported) {
    return {
      ready: false,
      configValid: false,
      configReasons: [
        definition.unsupportedModeMessage
          || `${definition.id} does not support payment mode "${paymentMode}".`
      ]
    };
  }

  const missingEnv = getMissingEnv(definition);

  const configReasons = [];
  if (missingEnv.length) {
    configReasons.push(`Missing env: ${missingEnv.join(', ')}`);
  }

  const adapter = instantiateAdapter(definition);
  let adapterReady = true;
  if (typeof adapter.getLiveAvailability === 'function') {
    try {
      adapterReady = adapter.getLiveAvailability(paymentMode);
    } catch (error) {
      adapterReady = false;
      if (error?.message) configReasons.push(error.message);
    }
  }

  return {
    ready: missingEnv.length === 0 && Boolean(adapterReady),
    configValid: missingEnv.length === 0 && modeSupported,
    configReasons
  };
};

const getConfigSourceIds = (purpose) => {
  if (purpose === 'payout') return [getDefaultPayoutGatewayId()];
  return getConfiguredCheckoutGatewayIds();
};

export const paymentGatewayRegistry = {
  getPaymentMode,
  getGatewayMode,
  getDefaultCheckoutGatewayId,
  getDefaultPayoutGatewayId,
  getGatewayDefinition(gatewayId) {
    return getGatewayDefinition(normalizeGatewayId(gatewayId));
  },
  getAdapter(gatewayId) {
    const definition = this.getGatewayDefinition(gatewayId);
    if (!definition) {
      throw createPaymentError(`Unknown payment gateway: ${gatewayId}`, 400, 'UNKNOWN_GATEWAY');
    }
    return instantiateAdapter(definition);
  },
  async listGateways({ purpose = 'checkout', admin = false } = {}) {
    const settings = await PaymentGatewaySetting.find({ gatewayId: { $in: paymentGateways.map((gateway) => gateway.id) } });
    const settingsMap = new Map(settings.map((setting) => [setting.gatewayId, setting]));
    const paymentMode = getPaymentMode();
    const configuredIds = new Set(getConfigSourceIds(purpose));

    return paymentGateways
      .filter((gateway) => (purpose === 'checkout' ? gateway.purpose !== 'payout' : gateway.purpose === 'payout'))
      .map((gateway) => {
        const setting = settingsMap.get(gateway.id);
        const envEnabled = configuredIds.has(gateway.id);
        const runtimeState = getRuntimeState(gateway, paymentMode);
        const checkoutEnabled = setting?.checkoutEnabled ?? true;
        const payoutEnabled = setting?.payoutEnabled ?? true;
        const enabled = (setting?.enabled ?? true) && envEnabled && (purpose === 'checkout' ? checkoutEnabled : payoutEnabled);
        const status = enabled
          ? (runtimeState.ready ? 'ready' : (runtimeState.configValid ? 'available' : 'unavailable'))
          : 'unavailable';
        return {
          ...gateway,
          enabled,
          envEnabled,
          runtimeAvailable: runtimeState.ready,
          ready: runtimeState.ready,
          configValid: runtimeState.configValid,
          configReasons: runtimeState.configReasons,
          status,
          paymentMode,
          configured: envEnabled,
          adminOverride: setting ? {
            enabled: setting.enabled,
            checkoutEnabled: setting.checkoutEnabled,
            payoutEnabled: setting.payoutEnabled,
            notes: setting.notes
          } : null
        };
      })
      .filter((gateway) => (admin ? true : gateway.enabled && gateway.configValid));
  },
  async resolveCheckoutGateway(selectedGatewayId) {
    const availableGateways = await this.listGateways({ purpose: 'checkout', admin: false });
    const requestedGatewayId = normalizeGatewayId(selectedGatewayId) || (availableGateways[0]?.id || getDefaultCheckoutGatewayId());
    const match = availableGateways.find((gateway) => gateway.id === requestedGatewayId);
    if (!match) {
      throw createPaymentError('Selected payment gateway is not enabled for checkout.', 400, 'GATEWAY_DISABLED');
    }
    return match;
  },
  async resolvePayoutGateway() {
    const availablePayoutGateways = await this.listGateways({ purpose: 'payout', admin: true });
    const targetId = getDefaultPayoutGatewayId();
    return availablePayoutGateways.find((gateway) => gateway.id === targetId) || this.getGatewayDefinition(targetId);
  },
  async updateGatewaySetting(gatewayId, payload, userId) {
    const normalizedGatewayId = normalizeGatewayId(gatewayId);
    const definition = this.getGatewayDefinition(normalizedGatewayId);
    if (!definition) {
      throw createPaymentError(`Unknown payment gateway: ${gatewayId}`, 404, 'UNKNOWN_GATEWAY');
    }

    const nextValues = {
      gatewayId: normalizedGatewayId,
      updatedBy: userId,
      ...(typeof payload.enabled === 'boolean' ? { enabled: payload.enabled } : {}),
      ...(typeof payload.checkoutEnabled === 'boolean' ? { checkoutEnabled: payload.checkoutEnabled } : {}),
      ...(typeof payload.payoutEnabled === 'boolean' ? { payoutEnabled: payload.payoutEnabled } : {}),
      ...(typeof payload.notes === 'string' ? { notes: payload.notes } : {})
    };

    return PaymentGatewaySetting.findOneAndUpdate(
      { gatewayId: normalizedGatewayId },
      nextValues,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};
