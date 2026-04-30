import express from 'express';
import { body, query } from 'express-validator';
import {
  createPayment,
  getPaymentPage,
  listAdminPayments,
  simulatePaymentWebhook,
  updatePaymentStatus
} from '../controllers/paymentLink.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post(
  '/create-payment',
  [
    body('user_id').trim().notEmpty().withMessage('user_id is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0'),
    body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }).withMessage('currency must be a 3-letter code'),
    body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('notes must be 500 characters or fewer')
  ],
  validate,
  asyncHandler(createPayment)
);

router.post(
  '/update-payment-status',
  [
    body('payment_id').trim().notEmpty().withMessage('payment_id is required'),
    body('status').trim().isIn(['PENDING', 'SUCCESS', 'FAILED']).withMessage('status must be PENDING, SUCCESS, or FAILED'),
    body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('notes must be 500 characters or fewer')
  ],
  validate,
  asyncHandler(updatePaymentStatus)
);

router.get('/payment/:paymentId', asyncHandler(getPaymentPage));

router.get(
  '/admin/payments',
  [
    query('status').optional().trim().isIn(['PENDING', 'SUCCESS', 'FAILED']).withMessage('status must be PENDING, SUCCESS, or FAILED'),
    query('user_id').optional().isString().trim()
  ],
  validate,
  asyncHandler(listAdminPayments)
);

router.post(
  '/payments/:paymentId/simulate-webhook',
  [
    body('status').optional().trim().isIn(['PENDING', 'SUCCESS', 'FAILED']).withMessage('status must be PENDING, SUCCESS, or FAILED')
  ],
  validate,
  asyncHandler(simulatePaymentWebhook)
);

export default router;
