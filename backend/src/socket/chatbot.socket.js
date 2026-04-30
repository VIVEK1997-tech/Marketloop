import { handleChatbotMessage } from '../controllers/chatbot.controller.js';

const requestBuckets = new Map();

const canSendChatbotMessage = (userId) => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 15;
  const bucket = requestBuckets.get(userId) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= maxRequests) {
    requestBuckets.set(userId, recent);
    return false;
  }

  recent.push(now);
  requestBuckets.set(userId, recent);
  return true;
};

export const registerChatbotSocket = (io, socket) => {
  const userId = socket.user._id.toString();
  const room = `chatbot:${userId}`;
  socket.join(room);

  socket.on('chatbot:send_message', async (payload, callback) => {
    try {
      if (!canSendChatbotMessage(userId)) {
        throw new Error('Too many chatbot messages. Please wait a moment.');
      }

      const text = payload?.text || '';
      const sessionContext = payload?.context || {};
      socket.emit('chatbot:typing', { isTyping: true });
      const { userMessage, botMessage } = await handleChatbotMessage({ user: socket.user, text, sessionContext });
      socket.emit('chatbot:receive_message', { message: userMessage });
      socket.emit('chatbot:receive_message', { message: botMessage });
      callback?.({ ok: true });
    } catch (error) {
      callback?.({ ok: false, error: error.message });
      socket.emit('chatbot:error', { message: error.message });
    } finally {
      socket.emit('chatbot:typing', { isTyping: false });
    }
  });
};
