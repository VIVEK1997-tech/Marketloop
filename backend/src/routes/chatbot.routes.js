import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { clearChatbotHistory, getChatbotHistory, submitChatbotFeedback } from '../controllers/chatbot.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many chatbot requests. Please slow down.' }
});

router.use(protect);
router.use(chatbotLimiter);
router.get('/history', getChatbotHistory);
router.post(
  '/feedback',
  [
    body('interactionId').isMongoId().withMessage('interactionId is required'),
    body('helpful').isBoolean().withMessage('helpful must be true or false'),
    body('note').optional().isString().withMessage('note must be text'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5')
  ],
  validate,
  submitChatbotFeedback
);
router.delete('/history', clearChatbotHistory);

export default router;
