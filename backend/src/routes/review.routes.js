import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import {
  addReview,
  getProductReviews,
  getReviewEligibility,
  getSellerReviews,
  markReviewHelpful,
  reportReview
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

const reviewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many review actions. Please try again later.' }
});

router.get('/product/:id', getProductReviews);
router.get('/seller/:id', getSellerReviews);
router.get('/eligibility/:productId', protect, getReviewEligibility);

router.post(
  '/',
  protect,
  reviewLimiter,
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('reviewType').isIn(['product', 'seller']).withMessage('reviewType must be product or seller'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').trim().isLength({ min: 3, max: 1000 }).withMessage('Review text must be 3-1000 characters')
  ],
  validate,
  addReview
);

router.patch('/:id/helpful', protect, [body('helpful').isBoolean().withMessage('helpful must be boolean')], validate, markReviewHelpful);
router.post('/:id/report', protect, [body('reason').optional().trim().isLength({ max: 300 })], validate, reportReview);

export default router;
