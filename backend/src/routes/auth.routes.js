import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { login, me, register, resendOtp, verifyOtp } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please try again in 10 minutes.' }
});

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
    body('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller')
  ],
  otpLimiter,
  validate,
  asyncHandler(register)
);

router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  otpLimiter,
  validate,
  asyncHandler(verifyOtp)
);

router.post(
  '/resend-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
  ],
  otpLimiter,
  validate,
  asyncHandler(resendOtp)
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['buyer', 'seller', 'admin']).withMessage('Role must be buyer, seller, or admin')
  ],
  validate,
  asyncHandler(login)
);

router.get('/me', protect, asyncHandler(me));

export default router;
