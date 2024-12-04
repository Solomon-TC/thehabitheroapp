import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-4 z-50">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Utility functions for common notifications
export function useGameNotifications() {
  const { showNotification } = useNotification();

  const notifyLevelUp = useCallback((level: number) => {
    showNotification(`Level Up! You've reached level ${level}! 🎉`, 'success');
  }, [showNotification]);

  const notifyAttributeIncrease = useCallback((attribute: string, value: number) => {
    showNotification(`${attribute} increased to ${value}! 💪`, 'success');
  }, [showNotification]);

  const notifyAchievement = useCallback((achievement: string) => {
    showNotification(`Achievement Unlocked: ${achievement} 🏆`, 'success');
  }, [showNotification]);

  const notifyStreak = useCallback((days: number) => {
    showNotification(`${days} Day Streak! Keep it up! 🔥`, 'success');
  }, [showNotification]);

  const notifyGoalComplete = useCallback((goalTitle: string) => {
    showNotification(`Goal Complete: ${goalTitle} ✨`, 'success');
  }, [showNotification]);

  const notifyError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  return {
    notifyLevelUp,
    notifyAttributeIncrease,
    notifyAchievement,
    notifyStreak,
    notifyGoalComplete,
    notifyError
  };
}

// Example usage:
// const { notifyLevelUp, notifyAchievement } = useGameNotifications();
// notifyLevelUp(5);
// notifyAchievement('First Step');
