import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://192.168.10.20:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 5000,
    });
  
    setSocket(newSocket);
  
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });
  
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  
    return () => {
      newSocket.close();
      console.log('Socket connection closed');
    };
  }, []);
  

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);




