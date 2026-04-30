import express from 'express';
import { body } from 'express-validator';
import { getOrderDetail, getStats, getUserDetail, getUsers, getWorkspace, markBillPaid, removeListing, setBanStatus, updateUserStatus } from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/stats', asyncHandler(getStats));
router.get('/workspace', asyncHandler(getWorkspace));
router.get('/users', asyncHandler(getUsers));
router.get('/users/:userId', asyncHandler(getUserDetail));
router.patch('/users/:userId/ban', body('isBanned').isBoolean().withMessage('isBanned must be a boolean'), validate, asyncHandler(setBanStatus));
router.patch('/users/:userId/status', body('accountStatus').isIn(['active', 'deactivated', 'kyc_pending', 'inactive']).withMessage('accountStatus must be active, deactivated, kyc_pending, or inactive'), validate, asyncHandler(updateUserStatus));
router.get('/orders/:orderId', asyncHandler(getOrderDetail));
router.delete('/products/:productId', asyncHandler(removeListing));
router.patch('/bills/:billId/pay', body('paymentReference').optional().trim(), validate, asyncHandler(markBillPaid));

export default router;
