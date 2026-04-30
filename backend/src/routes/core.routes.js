import express from 'express';
import { body } from 'express-validator';
import { me } from '../controllers/auth.controller.js';
import { getWorkspace } from '../controllers/admin.controller.js';
import {
  createCheckoutOrder,
  getMyOrders,
  getPaymentByOrder
} from '../controllers/payment.controller.js';
import {
  addOrUpdateCartItem,
  addToWishlist,
  getBuyerDashboardSummary,
  getCart,
  getProfile,
  getSellerDashboardSummary,
  getWishlist,
  removeCartItem,
  removeFromWishlist,
  updateProfile,
  clearCart
} from '../controllers/user.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/me', protect, asyncHandler(me));
router.put('/me', protect, asyncHandler(updateProfile));

router.get('/cart', protect, asyncHandler(getCart));
router.post('/cart', protect, [body('productId').trim().notEmpty().withMessage('productId is required'), body('quantity').optional().isFloat({ min: 1 }).withMessage('quantity must be at least 1')], validate, asyncHandler((req, res) => {
  req.params.productId = req.body.productId;
  return addOrUpdateCartItem(req, res);
}));
router.put('/cart/:productId', protect, [body('quantity').optional().isFloat({ min: 1 }).withMessage('quantity must be at least 1')], validate, asyncHandler(addOrUpdateCartItem));
router.delete('/cart/:productId', protect, asyncHandler(removeCartItem));
router.delete('/cart', protect, asyncHandler(clearCart));

router.get('/wishlist', protect, asyncHandler(getWishlist));
router.post('/wishlist', protect, [body('productId').trim().notEmpty().withMessage('productId is required')], validate, asyncHandler((req, res) => {
  req.params.productId = req.body.productId;
  return addToWishlist(req, res);
}));
router.delete('/wishlist/:id', protect, asyncHandler((req, res) => {
  req.params.productId = req.params.id;
  return removeFromWishlist(req, res);
}));

router.get('/orders', protect, asyncHandler(getMyOrders));
router.post('/orders', protect, [body('productId').trim().notEmpty().withMessage('productId is required'), body('quantity').optional().isFloat({ min: 1 }).withMessage('quantity must be at least 1')], validate, asyncHandler(createCheckoutOrder));
router.get('/orders/:id', protect, asyncHandler((req, res) => {
  req.params.orderId = req.params.id;
  return getPaymentByOrder(req, res);
}));

router.get('/seller/dashboard', protect, authorize('seller', 'admin'), asyncHandler(getSellerDashboardSummary));
router.get('/buyer/dashboard', protect, asyncHandler(getBuyerDashboardSummary));
router.get('/admin/dashboard', protect, authorize('admin'), asyncHandler(getWorkspace));
router.get('/profile', protect, asyncHandler(getProfile));

export default router;
