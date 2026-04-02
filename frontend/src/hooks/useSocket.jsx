import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
    // Use environment variable if available, otherwise default to localhost
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    socketRef.current = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    console.log('[SOCKET] Creating socket connection to', backendUrl);
    console.log('[SOCKET] Accessed from hostname:', window.location.hostname);

    // Listen for connection events
    socketRef.current.on('connect', () => {
      console.log('[SOCKET] Connected with ID:', socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[SOCKET] Disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('[SOCKET] Connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    console.warn('useSocket called outside SocketProvider');
    return { 
      socket: null, 
      isConnected: false,
      emit: () => {}, 
      on: () => {}, 
      off: () => {} 
    };
  }

  const { socket, isConnected } = context;

  return {
    socket,
    isConnected,
    emit: (event, data) => {
      if (socket) {
        console.log('[SOCKET] Emitting event:', event, data);
        socket.emit(event, data);
      } else {
        console.warn('[SOCKET] Cannot emit - socket is null');
      }
    },
    on: (event, handler) => {
      if (socket) {
        socket.on(event, handler);
      }
    },
    off: (event, handler) => {
      if (socket) {
        socket.off(event, handler);
      }
    },
  };
}
