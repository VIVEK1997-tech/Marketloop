import { io } from 'socket.io-client';
import { resolveSocketUrl } from '../config/env.js';

let socket;

export const getSocket = (token) => {
  if (!token) return null;
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling']
    });
  } else if (socket.auth?.token !== token) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
