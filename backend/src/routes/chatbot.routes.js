import express from 'express';
import rateLimit from 'express-rate-limit';
import { clearChatbotHistory, getChatbotHistory } from '../controllers/chatbot.controller.js';
import { protect } from '../middleware/auth.middleware.js';

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
router.delete('/history', clearChatbotHistory);

export default router;
