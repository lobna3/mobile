import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context's type
interface NotificationContextType {
  hasNewNotifications: boolean;
  setHasNewNotifications: (value: boolean) => void;
}

// Create the context with a default value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Define the provider's props type
interface NotificationProviderProps {
  children: ReactNode;
}

// Create the provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [hasNewNotifications, setHasNewNotifications] = useState<boolean>(false);

  return (
    <NotificationContext.Provider value={{ hasNewNotifications, setHasNewNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
