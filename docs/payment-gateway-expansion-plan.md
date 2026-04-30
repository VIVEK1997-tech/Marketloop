# MarketLoop Multi-Gateway Payment Integration Guide

## Goal
Expand the current checkout stack from Razorpay and PayU to a unified multi-gateway layer that also supports PayPal and Stripe, while keeping provider-specific logic isolated.

## Target Gateways
- Razorpay
- PayU
- Stripe
- PayPal
- Optional later:
  - Cashfree
  - PhonePe
  - Paytm

## Unified Abstraction

### Interface
Create a provider contract like:

```ts
interface PaymentGatewayAdapter {
  createOrder(input): Promise<GatewayOrder>;
  verifyPayment(input): Promise<GatewayVerification>;
  parseWebhook(payload, signature): Promise<GatewayWebhookEvent>;
  refund?(input): Promise<GatewayRefund>;
}
```

### Suggested backend structure
- `backend/src/payments/adapters/razorpay.adapter.js`
- `backend/src/payments/adapters/payu.adapter.js`
- `backend/src/payments/adapters/stripe.adapter.js`
- `backend/src/payments/adapters/paypal.adapter.js`
- `backend/src/payments/payment-gateway.factory.js`
- `backend/src/payments/payment-webhook.service.js`

## Environment Variables

```env
PAYMENT_DEFAULT_GATEWAY=razorpay

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

PAYU_ENV=test
PAYU_BASE_URL=https://test.payu.in
PAYU_PAYMENT_URL=https://test.payu.in/_payment
PAYU_MERCHANT_KEY=
PAYU_MERCHANT_SALT=

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
```

## Security Rules
- Keep all secrets in backend env only
- Verify every payment on backend before marking orders paid
- Validate webhook signatures for every provider
- Record raw provider payloads in an audit-safe way without leaking secrets
- Never log merchant salts, client secrets, or webhook secrets

## Supported Payment Methods
- Cards
- UPI
- Wallets
- Net banking
- International cards where provider supports them
- PayPal wallet / card depending on region

## Checkout UI Guidance
- Let users choose exactly one payment option
- Keep selected payment method visually highlighted
- Show provider-specific payment copy only after gateway selection
- Treat order creation and payment verification as separate states
- Show success only after backend verification succeeds

## Webhooks
Implement webhook endpoints for:
- Razorpay payment captured / failed
- Stripe payment intent success / failure
- PayPal checkout order approved / captured
- PayU success / failure callback plus any server webhook support

Suggested routes:
- `POST /api/payment/webhooks/razorpay`
- `POST /api/payment/webhooks/stripe`
- `POST /api/payment/webhooks/paypal`
- `POST /api/payment/webhooks/payu`

## Data Model Guidance
Keep provider-specific fields optional and isolated:
- `paymentGateway`
- `gatewayVariant`
- `gatewayOrderId`
- `gatewayPaymentId`
- `gatewaySignature`
- `gatewayStatus`
- `providerPayload`

Avoid unique indexes on nullable provider fields unless using partial indexes.

## Rollout Plan
1. Refactor current Razorpay and PayU into adapters
2. Add Stripe sandbox support
3. Add PayPal sandbox support
4. Add webhook reconciliation jobs
5. Add refund support and finance reporting
