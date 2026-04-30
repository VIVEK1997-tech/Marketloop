import express from 'express';
import { body } from 'express-validator';
import {
  addOrUpdateCartItem,
  addToWishlist,
  becomeSeller,
  clearCart,
  createSupportComplaint,
  getCart,
  getNotifications,
  getProfile,
  getSellerDashboardSummary,
  getSupportComplaintDetail,
  getSupportComplaints,
  getUserRatings,
  getWishlist,
  markNotificationRead,
  registerPushToken,
  removeFromWishlist,
  removeCartItem,
  switchActiveRole,
  updateProfile
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/:id/ratings', asyncHandler(getUserRatings));

router.use(protect);
router.get('/profile', asyncHandler(getProfile));
router.put('/profile', asyncHandler(updateProfile));
router.post('/push-token', [body('token').trim().notEmpty().withMessage('token is required'), body('platform').optional().isIn(['android', 'ios', 'web'])], validate, asyncHandler(registerPushToken));
router.get('/notifications', asyncHandler(getNotifications));
router.patch('/notifications/:notificationId/read', asyncHandler(markNotificationRead));
router.get('/support/complaints', asyncHandler(getSupportComplaints));
router.get('/support/complaints/:complaintId', asyncHandler(getSupportComplaintDetail));
router.post(
  '/support/complaints',
  [
    body('complaintType').trim().notEmpty().withMessage('complaintType is required'),
    body('against').trim().notEmpty().withMessage('against is required'),
    body('note').optional().isString(),
    body('linkedOrderId').optional().isString(),
    body('linkedPaymentId').optional().isString()
  ],
  validate,
  asyncHandler(createSupportComplaint)
);
router.post('/roles/become-seller', asyncHandler(becomeSeller));
router.post('/roles/switch', [body('role').isIn(['buyer', 'seller', 'admin']).withMessage('role must be buyer, seller, or admin')], validate, asyncHandler(switchActiveRole));
router.get('/seller-summary', asyncHandler(getSellerDashboardSummary));
router.get('/cart', asyncHandler(getCart));
router.put('/cart/:productId', [body('quantity').optional().isFloat({ min: 1 }).withMessage('quantity must be at least 1')], validate, asyncHandler(addOrUpdateCartItem));
router.delete('/cart/:productId', asyncHandler(removeCartItem));
router.delete('/cart', asyncHandler(clearCart));
router.get('/wishlist', asyncHandler(getWishlist));
router.post('/wishlist/:productId', asyncHandler(addToWishlist));
router.delete('/wishlist/:productId', asyncHandler(removeFromWishlist));

export default router;
