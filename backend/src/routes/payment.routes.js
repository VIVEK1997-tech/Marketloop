import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import {
  createPaymentOrder,
  getMyOrders,
  getPaymentByOrder,
  markPaymentFailed,
  verifyPayment
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment attempts. Please try again later.' }
});

router.use(protect);
router.use(paymentLimiter);

router.post('/create-order', [body('productId').isMongoId().withMessage('Valid productId is required')], validate, createPaymentOrder);
router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required'),
    body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required'),
    body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required')
  ],
  validate,
  verifyPayment
);
router.post('/failed', markPaymentFailed);
router.get('/orders', getMyOrders);
router.get('/orders/:orderId', getPaymentByOrder);

export default router;
