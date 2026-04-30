import mongoose from 'mongoose';
import ChatbotChat from '../models/ChatbotChat.js';
import { createChatbotReply, sanitizeChatbotContext, sanitizeChatbotMessage, storeChatbotInteraction, updateInteractionFeedback } from '../services/chatbot.service.js';

const toObjectId = (value) => (value && mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : undefined);

const normalizeMessageContext = (context = {}) => {
  const sanitized = sanitizeChatbotContext(context);
  return {
    pageType: sanitized.pageType || undefined,
    currentPath: sanitized.currentPath || undefined,
    productId: toObjectId(sanitized.productId),
    orderId: toObjectId(sanitized.orderId),
    conversationId: toObjectId(sanitized.conversationId),
    searchQuery: sanitized.searchQuery || undefined
  };
};

export const getChatbotHistory = async (req, res) => {
  const chat = await ChatbotChat.findOne({ user: req.user._id });
  res.json({ messages: chat?.messages || [] });
};

export const clearChatbotHistory = async (req, res) => {
  await ChatbotChat.findOneAndUpdate({ user: req.user._id }, { messages: [] }, { upsert: true });
  res.json({ message: 'Chatbot history cleared' });
};

export const submitChatbotFeedback = async (req, res) => {
  const { interactionId, helpful, note, rating } = req.body;
  const interaction = await updateInteractionFeedback({
    interactionId,
    userId: req.user._id,
    helpful,
    note,
    rating
  });

  if (!interaction) {
    return res.status(404).json({ message: 'Chatbot interaction not found' });
  }

  await ChatbotChat.updateOne(
    { user: req.user._id, 'messages.interactionId': interaction._id },
    {
      $set: {
        'messages.$.feedback': {
          helpful,
          note: note || '',
          submittedAt: new Date()
        }
      }
    }
  );

  return res.json({ message: 'Feedback saved', interaction });
};

export const handleChatbotMessage = async ({ user, text, sessionContext = {} }) => {
  const safeText = sanitizeChatbotMessage(text);
  if (!safeText) {
    throw new Error('Message cannot be empty');
  }

  const normalizedContext = normalizeMessageContext(sessionContext);

  const chat = await ChatbotChat.findOneAndUpdate(
    { user: user._id },
    {
      $push: {
        messages: {
          sender: 'user',
          text: safeText,
          context: normalizedContext,
          timestamp: new Date()
        }
      }
    },
    { upsert: true, new: true }
  );

  const reply = await createChatbotReply({
    user,
    text: safeText,
    history: chat.messages,
    sessionContext: normalizedContext
  });

  const interaction = await storeChatbotInteraction({
    userId: user._id,
    logPayload: reply.logPayload
  });

  const botMessage = {
    sender: 'bot',
    text: reply.text,
    intent: reply.intent,
    confidence: reply.confidence,
    contextSummary: reply.contextSummary,
    sources: reply.sources,
    interactionId: interaction._id,
    context: normalizedContext,
    quickReplies: reply.quickReplies,
    products: reply.products,
    timestamp: new Date()
  };

  await ChatbotChat.findOneAndUpdate(
    { user: user._id },
    { $push: { messages: botMessage } },
    { upsert: true }
  );

  return { userMessage: chat.messages.at(-1), botMessage };
};
