import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { EncryptionService } from '../utils/encryption';
import { securityConfig, type SecurityContext, validateSecurityEnv } from '../config/security';
import { useNotification } from './NotificationContext';

interface SecurityContextType extends SecurityContext {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPasswordStrength: (password: string) => { isStrong: boolean; reasons: string[] };
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  isLoading: boolean;
}

const SecurityContextInstance = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SecurityContext['user']>();
  const [session, setSession] = useState<SecurityContext['session']>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showNotification } = useNotification();

  // Validate environment variables
  useEffect(() => {
    try {
      validateSecurityEnv();
    } catch (error) {
      console.error('Security configuration error:', error);
      showNotification('Security configuration error', 'error');
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        handleAuthChange(session);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          handleAuthChange(session);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        showNotification('Authentication error', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthChange = async (session: any) => {
    if (session) {
      setIsAuthenticated(true);
      setUser({
        id: session.user.id,
        email: session.user.email,
        roles: session.user.app_metadata.roles || [],
      });
      setSession({
        token: session.access_token,
        expiresAt: new Date(session.expires_at).getTime(),
      });
    } else {
      setIsAuthenticated(false);
      setUser(undefined);
      setSession(undefined);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store session token securely
      if (data.session) {
        const encryptedToken = EncryptionService.encrypt(data.session.access_token);
        localStorage.setItem('secure_token', JSON.stringify(encryptedToken));
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('secure_token');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const checkPasswordStrength = (password: string) => {
    return EncryptionService.checkPasswordStrength(password);
  };

  const validateSession = async () => {
    if (!session) return false;

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await refreshSession();
      return false;
    }

    return true;
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      handleAuthChange(session);
    } catch (error) {
      console.error('Session refresh error:', error);
      await logout();
    }
  };

  // Auto refresh session before expiry
  useEffect(() => {
    if (session) {
      const timeUntilExpiry = session.expiresAt - Date.now();
      const refreshBuffer = 5 * 60 * 1000; // 5 minutes

      if (timeUntilExpiry > 0 && timeUntilExpiry < refreshBuffer) {
        const timeout = setTimeout(refreshSession, timeUntilExpiry - refreshBuffer);
        return () => clearTimeout(timeout);
      }
    }
  }, [session]);

  // Monitor for security events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        validateSession();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'secure_token' && !e.newValue) {
        logout();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session]);

  const value = {
    isAuthenticated,
    user,
    session,
    login,
    logout,
    checkPasswordStrength,
    validateSession,
    refreshSession,
    isLoading,
  };

  return (
    <SecurityContextInstance.Provider value={value}>
      {children}
    </SecurityContextInstance.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContextInstance);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

// Export types
export type { SecurityContextType };
