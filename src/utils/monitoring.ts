import { supabase } from '../lib/supabase';
import { debounce } from './errorHandling';

interface PerformanceMetrics {
  loadTime: number;
  responseTime: number;
  memoryUsage: number;
  errorCount: number;
  apiLatency: Record<string, number>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  path: string;
  metadata: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    responseTime: 0,
    memoryUsage: 0,
    errorCount: 0,
    apiLatency: {},
  };

  private errorReports: ErrorReport[] = [];
  private readonly MAX_ERROR_REPORTS = 100;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializePerformanceMonitoring();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializePerformanceMonitoring(): void {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
      this.reportMetrics();
    });

    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
        this.reportMetrics();
      }, 30000);
    }

    // Monitor API latency
    this.setupAPILatencyMonitoring();

    // Monitor unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error);
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });
  }

  private setupAPILatencyMonitoring(): void {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo, init?: RequestInit) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const url = typeof input === 'string' ? input : input.url;
        this.recordAPILatency(url, endTime - startTime);
        return response;
      } catch (error) {
        this.handleError(error);
        throw error;
      }
    };
  }

  private recordAPILatency(url: string, latency: number): void {
    const endpoint = new URL(url).pathname;
    this.metrics.apiLatency[endpoint] = 
      (this.metrics.apiLatency[endpoint] || 0) * 0.7 + latency * 0.3; // Exponential moving average
  }

  private async reportMetrics(): Promise<void> {
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert([{
          ...this.metrics,
          timestamp: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }

  handleError(error: Error | unknown, metadata: Record<string, any> = {}): void {
    this.metrics.errorCount++;

    const errorReport: ErrorReport = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    this.errorReports.push(errorReport);
    if (this.errorReports.length > this.MAX_ERROR_REPORTS) {
      this.errorReports.shift();
    }

    this.reportError(errorReport);
  }

  private reportError = debounce(async (errorReport: ErrorReport): Promise<void> => {
    try {
      const { error } = await supabase
        .from('error_reports')
        .insert([errorReport]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }, 1000);

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  clearErrorReports(): void {
    this.errorReports = [];
    this.metrics.errorCount = 0;
  }
}

// Memory leak detection
export function detectMemoryLeaks(): void {
  if (typeof window === 'undefined') return;

  const eventListeners = new WeakMap();
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

  EventTarget.prototype.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!eventListeners.has(this)) {
      eventListeners.set(this, new Map());
    }
    const listeners = eventListeners.get(this);
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type).add(listener);
    originalAddEventListener.call(this, type, listener, options);
  };

  EventTarget.prototype.removeEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    const listeners = eventListeners.get(this);
    if (listeners?.has(type)) {
      listeners.get(type).delete(listener);
    }
    originalRemoveEventListener.call(this, type, listener, options);
  };

  // Check for potential memory leaks periodically
  setInterval(() => {
    eventListeners.forEach((typeListeners, target) => {
      typeListeners.forEach((listeners, type) => {
        if (listeners.size > 10) {
          console.warn(
            `Potential memory leak detected: ${listeners.size} listeners for event type "${type}"`,
            target
          );
        }
      });
    });
  }, 60000);
}

// Network error handling with retry
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}

// Initialize monitoring
export const monitor = PerformanceMonitor.getInstance();

// Export utility functions
export function trackAPICall(endpoint: string, latency: number): void {
  monitor.getMetrics().apiLatency[endpoint] = latency;
}

export function reportError(error: Error | unknown, metadata: Record<string, any> = {}): void {
  monitor.handleError(error, metadata);
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return monitor.getMetrics();
}

export function getErrorReports(): ErrorReport[] {
  return monitor.getErrorReports();
}
