import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    socket = io(apiUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

