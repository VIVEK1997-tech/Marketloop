# MarketLoop Payment Gateways

## Overview
MarketLoop now uses a registry-driven payment architecture that supports:
- single gateway mode
- multiple gateway mode
- multiple gateway products from the same company
- separate buyer payment and seller payout gateway defaults

Core checkout routes are mounted on both:
- `/api/payment/*`
- `/api/payments/*`

## Gateway mode

### Single gateway mode
```env
PAYMENT_GATEWAY_MODE=single
PAYMENT_GATEWAY=razorpay_checkout
```

### Multiple gateway mode
```env
PAYMENT_GATEWAY_MODE=multiple
ENABLED_PAYMENT_GATEWAYS=razorpay_checkout,payu_india,cashfree_payments,stripe,paypal_india
```

## Payment mode
```env
PAYMENT_MODE=test
```
or
```env
PAYMENT_MODE=live
```

`test` is recommended until every required live gateway credential is installed and webhooks are configured.

## Implemented status

### Fully implemented
- `razorpay_checkout`
- `payu_india`

### Test-mode implemented
- `cashfree_payments`
- `hdfc_smartgateway`
- `stripe`
- `paypal_india`

### Registry placeholders
- `razorpay_upi`
- `razorpayx_payouts`
- `cashfree_payouts`
- `phonepe_pg`
- `phonepe_upi`
- `paytm_pg`
- `paytm_upi`
- `ccavenue`
- `billdesk`
- `icici_payment_gateway`
- `atom_paynet`
- `payglocal`
- `skydo`
- `instamojo`
- `paykun`
- `zaakpay`
- `mobikwik`
- `pine_labs`
- `cred_pay`
- `bharatpe`
- `airpay`
- `ippopay`
- `mintoak`
- `easebuzz`
- `juspay`

Placeholder gateways can be enabled in admin config and kept in the registry, but they will not appear in buyer checkout unless they are runtime-supported for the active `PAYMENT_MODE`.

## Required environment variables
Use [backend/.env.example](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/.env.example) as the source of truth.

Important top-level variables:
- `PAYMENT_MODE`
- `PAYMENT_GATEWAY_MODE`
- `PAYMENT_GATEWAY`
- `ENABLED_PAYMENT_GATEWAYS`
- `DEFAULT_PAYMENT_GATEWAY`
- `DEFAULT_PAYOUT_GATEWAY`

## Webhook setup

### Generic webhook endpoint
```txt
POST /api/payments/webhook/:gatewayId
```

Examples:
- `/api/payments/webhook/razorpay_checkout`
- `/api/payments/webhook/stripe`

### PayU callback
```txt
POST /api/payment/payu/callback
```

Notes:
- Razorpay webhooks validate `x-razorpay-signature`
- webhook events are stored with an idempotency key
- duplicate webhook deliveries are ignored after successful processing

## Checkout flow
1. Buyer opens product checkout
2. Frontend fetches `GET /api/payment/gateways`
3. Buyer selects an enabled gateway
4. Frontend creates the order:
   - `POST /api/payment/orders`
5. Backend validates the gateway is enabled for the current mode
6. Adapter creates the provider order and checkout payload
7. Frontend launches provider checkout
8. Backend verifies payment
9. Seller payout stays on hold until payment is verified

## Refund flow
```txt
POST /api/payment/refund
```

Payload:
```json
{
  "orderId": "mongo-order-id",
  "amount": 500,
  "reason": "Buyer cancelled before dispatch"
}
```

Refund responses are stored in `PaymentRefund`.

## Admin controls

List gateways:
```txt
GET /api/payment/admin/gateways
```

Update gateway flags:
```txt
PATCH /api/payment/admin/gateways/:gatewayId
```

Body example:
```json
{
  "enabled": true,
  "checkoutEnabled": true,
  "payoutEnabled": false,
  "notes": "Keep for testing only"
}
```

## Test mode details

### Razorpay
- real checkout if credentials exist
- falls back to simulation when credentials are absent in `test` mode

### Cashfree, Stripe, PayPal
- `test` mode returns an instant simulated checkout payload
- buyer checkout can complete end-to-end in local development

### HDFC SmartGateway
- use only `HDFC_ENV=test`
- `HDFC_MOCK_MODE=true` gives you a browser-based mock hosted payment page without hitting HDFC
- you can also place a local backend config file at:
  - [backend/config/hdfc-smartgateway.config.json](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/config/hdfc-smartgateway.config.json)
- an example template is available at:
  - [backend/config/hdfc-smartgateway.config.example.json](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/config/hdfc-smartgateway.config.example.json)
- if you want to call the real sandbox Session API, set:
  - `HDFC_MOCK_MODE=false`
  - `HDFC_SMARTGATEWAY_CONFIG_PATH`
  - `HDFC_MERCHANT_ID`
  - `HDFC_API_KEY`
  - `HDFC_SECRET_KEY`
  - `HDFC_SESSION_API_URL`
  - `HDFC_ORDER_STATUS_API_URL`
  - `HDFC_RETURN_URL`
- checkout flow:
  1. `POST /api/payment/hdfc/create-session`
  2. frontend redirects to the returned payment link
  3. HDFC returns to `/payment/hdfc/return`
  4. frontend calls `POST /api/payment/hdfc/status`
  5. backend verifies final status server-to-server before the order is treated as paid

## Live mode notes
- only gateways marked fully implemented should be used in live deployments
- placeholders remain intentionally unavailable at runtime
- do not enable placeholder gateways in live buyer flows

## Security notes
- frontend amounts are never trusted
- product amount is recalculated from backend product data
- signatures are validated server-side
- webhook processing is idempotent
- secrets are never returned in responses
- refund amount cannot exceed captured amount
