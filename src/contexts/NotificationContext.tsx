import React, { createContext, useContext, useState, useCallback } from 'react';

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  notifications: Array<{ id: number; message: string; type: string }>;
  clearNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => clearNotification(id), 5000);
  }, []);

  const clearNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Provide a default value during server-side rendering
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <NotificationContext.Provider value={{ showNotification, notifications, clearNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`p-4 rounded-lg shadow-lg ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white`}
          >
            {message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  
  // Provide a no-op implementation during server-side rendering
  if (!context) {
    return {
      showNotification: () => {},
      notifications: [],
      clearNotification: () => {},
    };
  }
  
  return context;
}
