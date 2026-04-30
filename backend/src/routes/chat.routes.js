import express from 'express';
import { body } from 'express-validator';
import { createConversation, getConversations, getMessages, postConversationMessage } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);
router.get('/conversations', asyncHandler(getConversations));
router.post(
  '/conversations',
  [
    body('sellerId').isMongoId().withMessage('sellerId is required'),
    body('productId').isMongoId().withMessage('productId is required')
  ],
  validate,
  asyncHandler(createConversation)
);
router.get('/conversations/:conversationId/messages', asyncHandler(getMessages));
router.post(
  '/conversations/:conversationId/messages',
  [body('message').trim().notEmpty().withMessage('message is required')],
  validate,
  asyncHandler(postConversationMessage)
);

export default router;
