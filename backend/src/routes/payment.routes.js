import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import {
  createCashfreeCheckout,
  createCheckoutOrder,
  createHdfcCheckout,
  createPayuCheckout,
  createPhonePeCheckout,
  createRazorpayCheckout,
  getAdminGatewayStatus,
  getGatewayStatus,
  getMyOrders,
  getOrderPaymentStatus,
  getPaymentByOrder,
  handleCashfreeWebhook,
  handleHdfcWebhook,
  handlePaymentWebhook,
  handlePhonePeWebhook,
  handlePayuCallback,
  listAdminGateways,
  listCheckoutGateways,
  recordCheckoutFailure,
  renderMobileHdfcBridge,
  renderMobileRazorpayBridge,
  refundPayment,
  updateAdminGateway,
  verifyCashfreeCheckout,
  verifyHdfcCheckout,
  verifyPhonePeCheckout,
  verifyCheckoutPayment
} from '../controllers/payment.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();
const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment attempts. Please try again later.' }
});

router.post('/payu/callback', asyncHandler(handlePayuCallback));
router.post('/cashfree/webhook', asyncHandler(handleCashfreeWebhook));
router.post('/phonepe/webhook', asyncHandler(handlePhonePeWebhook));
router.post('/hdfc/webhook', asyncHandler(handleHdfcWebhook));
router.post('/webhook/:gatewayId', asyncHandler(handlePaymentWebhook));
router.get('/mobile-bridge/hdfc', asyncHandler(renderMobileHdfcBridge));
router.get('/mobile-bridge/razorpay', asyncHandler(renderMobileRazorpayBridge));
router.get('/gateways', asyncHandler(listCheckoutGateways));
router.get('/gateways/status', asyncHandler(getGatewayStatus));

router.use(protect);
router.use(paymentLimiter);

router.post(
  '/orders',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be at least 1'),
    body('gatewayId').optional().isString().trim().notEmpty().withMessage('gatewayId must be a non-empty string')
  ],
  validate,
  asyncHandler(createCheckoutOrder)
);

router.post(
  '/razorpay/create',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be at least 1')
  ],
  validate,
  asyncHandler(createRazorpayCheckout)
);

router.post(
  '/payu/create',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be at least 1')
  ],
  validate,
  asyncHandler(createPayuCheckout)
);

router.post(
  '/cashfree/create',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be at least 1')
  ],
  validate,
  asyncHandler(createCashfreeCheckout)
);

router.post(
  '/hdfc/create-session',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be at least 1')
  ],
  validate,
  asyncHandler(createHdfcCheckout)
);

router.post(
  '/phonepe/create',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be at least 1')
  ],
  validate,
  asyncHandler(createPhonePeCheckout)
);

router.post(
  '/verify',
  [
    body('gatewayId').optional().isString(),
    body('orderId').optional().isMongoId(),
    body('payload').optional()
  ],
  validate,
  asyncHandler(verifyCheckoutPayment)
);

router.post(
  '/cashfree/verify',
  [
    body('orderId').isMongoId().withMessage('Valid orderId is required'),
    body('cashfreeOrderId').optional().isString().trim().notEmpty().withMessage('cashfreeOrderId must be a non-empty string')
  ],
  validate,
  asyncHandler(verifyCashfreeCheckout)
);

router.post(
  '/phonepe/verify',
  [
    body('orderId').isMongoId().withMessage('Valid orderId is required'),
    body('transactionId').optional().isString().trim().notEmpty().withMessage('transactionId must be a non-empty string'),
    body('merchantTransactionId').optional().isString().trim().notEmpty().withMessage('merchantTransactionId must be a non-empty string')
  ],
  validate,
  asyncHandler(verifyPhonePeCheckout)
);

router.post(
  '/hdfc/status',
  [
    body('orderId').optional().isMongoId().withMessage('Valid orderId is required when supplied'),
    body('localOrderId').optional().isMongoId().withMessage('Valid localOrderId is required when supplied'),
    body('gatewayOrderId').optional().isString().trim().notEmpty().withMessage('gatewayOrderId must be a non-empty string when supplied'),
    body('receipt').optional().isString().trim().notEmpty().withMessage('receipt must be a non-empty string when supplied')
  ],
  validate,
  asyncHandler(verifyHdfcCheckout)
);

router.get('/hdfc/status', asyncHandler(verifyHdfcCheckout));

router.post(
  '/refund',
  [
    body('orderId').isMongoId().withMessage('Valid orderId is required'),
    body('amount').optional().isFloat({ gt: 0 }).withMessage('amount must be greater than zero'),
    body('reason').optional().isString()
  ],
  validate,
  asyncHandler(refundPayment)
);

router.post('/failed', asyncHandler(recordCheckoutFailure));
router.get('/orders', asyncHandler(getMyOrders));
router.get('/orders/:orderId', asyncHandler(getPaymentByOrder));
router.get('/status/:orderId', asyncHandler(getOrderPaymentStatus));

router.get('/admin/gateways', authorize('admin'), asyncHandler(listAdminGateways));
router.get('/admin/gateways/status', authorize('admin'), asyncHandler(getAdminGatewayStatus));
router.patch(
  '/admin/gateways/:gatewayId',
  authorize('admin'),
  [
    body('enabled').optional().isBoolean(),
    body('checkoutEnabled').optional().isBoolean(),
    body('payoutEnabled').optional().isBoolean(),
    body('notes').optional().isString()
  ],
  validate,
  asyncHandler(updateAdminGateway)
);

router.post(
  '/create-order',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('paymentGateway').optional().isString()
  ],
  validate,
  asyncHandler((req, res) => {
    req.body.gatewayId = 'razorpay_checkout';
    return createCheckoutOrder(req, res);
  })
);

router.post(
  '/payu/create-order',
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('gateway').optional().isIn(['primary', 'secondary']).withMessage('gateway must be primary or secondary'),
    body('gatewayVariant').optional().isIn(['primary', 'secondary']).withMessage('gatewayVariant must be primary or secondary')
  ],
  validate,
  asyncHandler((req, res) => {
    req.body.gatewayId = 'payu_india';
    return createCheckoutOrder(req, res);
  })
);

router.post(
  '/verify-payment',
  [
    body('razorpay_order_id').optional().notEmpty(),
    body('razorpay_payment_id').optional().notEmpty(),
    body('razorpay_signature').optional().notEmpty(),
    body('orderId').optional().isMongoId()
  ],
  validate,
  asyncHandler((req, res) => {
    req.body.gatewayId = req.body.gatewayId || 'razorpay_checkout';
    return verifyCheckoutPayment(req, res);
  })
);

router.post(
  '/payu/verify-payment',
  [
    body('txnid').optional().notEmpty(),
    body('status').optional().notEmpty(),
    body('hash').optional().notEmpty(),
    body('orderId').optional().isMongoId()
  ],
  validate,
  asyncHandler((req, res) => {
    req.body.gatewayId = 'payu_india';
    return verifyCheckoutPayment(req, res);
  })
);

export default router;
