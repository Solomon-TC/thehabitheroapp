import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

// Rate limiting cache with automatic cleanup
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const CACHE_CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  rateLimitCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_CLEANUP_INTERVAL) {
      rateLimitCache.delete(key);
    }
  });
}, CACHE_CLEANUP_INTERVAL);

// Session validation with retry logic
export async function validateSessionWithRetry(
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Session | null> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * retries));
    }
  }
  return null;
}

// Database operation retry wrapper
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}

// Rate limiting with IP and user-based tracking
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const cache = rateLimitCache.get(identifier) || { count: 0, timestamp: now };

  if (now - cache.timestamp > windowMs) {
    cache.count = 1;
    cache.timestamp = now;
  } else {
    cache.count++;
  }

  rateLimitCache.set(identifier, cache);
  return cache.count <= limit;
}

// Debounce function for UI operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Error types for better error handling
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Data validation utilities
export function validateHabitData(data: any): boolean {
  return !!(
    data &&
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    typeof data.frequency === 'string' &&
    ['daily', 'weekly', 'monthly'].includes(data.frequency) &&
    typeof data.target_count === 'number' &&
    data.target_count > 0
  );
}

export function validateGoalData(data: any): boolean {
  return !!(
    data &&
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    typeof data.target_date === 'string' &&
    !isNaN(Date.parse(data.target_date))
  );
}

// Connection state management
export class ConnectionStateManager {
  private static instance: ConnectionStateManager;
  private connectionState: boolean = true;
  private listeners: Set<(online: boolean) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateConnectionState(true));
      window.addEventListener('offline', () => this.updateConnectionState(false));
    }
  }

  static getInstance(): ConnectionStateManager {
    if (!ConnectionStateManager.instance) {
      ConnectionStateManager.instance = new ConnectionStateManager();
    }
    return ConnectionStateManager.instance;
  }

  private updateConnectionState(online: boolean) {
    this.connectionState = online;
    this.listeners.forEach(listener => listener(online));
  }

  addListener(listener: (online: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isOnline(): boolean {
    return this.connectionState;
  }
}

// Data consistency checker
export async function checkDataConsistency(userId: string): Promise<boolean> {
  try {
    // Check character data
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (characterError) throw characterError;

    // Check habits data
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;

    // Check goals data
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    // Verify data relationships
    const hasValidCharacter = character && 
      typeof character.level === 'number' && 
      typeof character.experience === 'number';

    const hasValidHabits = habits?.every(habit => 
      typeof habit.current_streak === 'number' &&
      Array.isArray(habit.completed_dates)
    );

    const hasValidGoals = goals?.every(goal =>
      typeof goal.progress === 'number' &&
      goal.progress >= 0 &&
      goal.progress <= 100
    );

    return hasValidCharacter && hasValidHabits && hasValidGoals;
  } catch (error) {
    console.error('Data consistency check failed:', error);
    return false;
  }
}
