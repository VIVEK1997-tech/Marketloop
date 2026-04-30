import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import { sendMessage } from '../controllers/chat.controller.js';
import { registerChatbotSocket } from './chatbot.socket.js';
import { getAllowedOrigins } from '../config/origins.js';

const onlineUsers = new Map();

export const configureSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: getAllowedOrigins(), credentials: true }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token is required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.isBanned) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { online: true });
    socket.broadcast.emit('userOnline', { userId });
    registerChatbotSocket(io, socket);

    socket.on('joinConversation', ({ conversationId }) => {
      socket.join(conversationId);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typing', { conversationId, userId, isTyping });
    });

    socket.on('sendMessage', async (payload, callback) => {
      try {
        const conversation = await Conversation.findOne({ _id: payload.conversationId, participants: userId });
        if (!conversation) throw new Error('Conversation not found');

        const receiverId = conversation.participants.find((participant) => participant.toString() !== userId)?.toString();
        const saved = await sendMessage({
          conversationId: payload.conversationId,
          senderId: userId,
          receiverId,
          message: payload.message
        });

        io.to(payload.conversationId).emit('receiveMessage', saved);
        const receiverSocket = onlineUsers.get(receiverId);
        const receiverAlreadyInRoom = io.sockets.adapter.rooms.get(payload.conversationId)?.has(receiverSocket);
        if (receiverSocket && !receiverAlreadyInRoom) io.to(receiverSocket).emit('receiveMessage', saved);
        callback?.({ ok: true, message: saved });
      } catch (error) {
        callback?.({ ok: false, error: error.message });
      }
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false });
      socket.broadcast.emit('userOffline', { userId });
    });
  });

  return io;
};
