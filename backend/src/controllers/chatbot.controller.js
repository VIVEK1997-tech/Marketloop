import ChatbotChat from '../models/ChatbotChat.js';
import { createChatbotReply, sanitizeChatbotMessage } from '../services/chatbot.service.js';

export const getChatbotHistory = async (req, res) => {
  const chat = await ChatbotChat.findOne({ user: req.user._id });
  res.json({ messages: chat?.messages || [] });
};

export const clearChatbotHistory = async (req, res) => {
  await ChatbotChat.findOneAndUpdate({ user: req.user._id }, { messages: [] }, { upsert: true });
  res.json({ message: 'Chatbot history cleared' });
};

export const handleChatbotMessage = async ({ user, text }) => {
  const safeText = sanitizeChatbotMessage(text);
  if (!safeText) {
    throw new Error('Message cannot be empty');
  }

  const chat = await ChatbotChat.findOneAndUpdate(
    { user: user._id },
    {
      $push: {
        messages: {
          sender: 'user',
          text: safeText,
          timestamp: new Date()
        }
      }
    },
    { upsert: true, new: true }
  );

  const reply = await createChatbotReply({ user, text: safeText, history: chat.messages });
  const botMessage = {
    sender: 'bot',
    text: reply.text,
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
