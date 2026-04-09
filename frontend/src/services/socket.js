import { io } from 'socket.io-client';

let socket;

export const getSocket = (token) => {
  if (!token) return null;
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: true
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
