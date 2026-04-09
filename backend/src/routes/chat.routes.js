import express from 'express';
import { body } from 'express-validator';
import { createConversation, getConversations, getMessages } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/conversations', getConversations);
router.post(
  '/conversations',
  [
    body('sellerId').isMongoId().withMessage('sellerId is required'),
    body('productId').isMongoId().withMessage('productId is required')
  ],
  validate,
  createConversation
);
router.get('/conversations/:conversationId/messages', getMessages);

export default router;
