import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth-store';

let socket: Socket | null = null;

export const getChatSocket = () => {
  const token = useAuthStore.getState().token;
  if (!socket && token) {
    socket = io(env.socketUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5
    });
  } else if (socket && token) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
  return socket;
};

export const disconnectChatSocket = () => {
  socket?.disconnect();
  socket = null;
};
