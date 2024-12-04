// Security configuration and constants

export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  PASSWORD_RESET_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: {
    DEFAULT: 60, // 60 requests per minute
    AUTH: 5, // 5 auth attempts per minute
    API: 30, // 30 API requests per minute
    FRIEND_REQUESTS: 10, // 10 friend requests per minute
  },
};

export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  IV_LENGTH: 16,
  SALT_LENGTH: 64,
  TAG_LENGTH: 16,
  HASH_ITERATIONS: 100000,
  KEY_LENGTH: 32,
};

export const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co",
  ].join('; '),
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Protected routes configuration
export const PROTECTED_ROUTES = {
  AUTH_REQUIRED: [
    '/dashboard',
    '/account',
    '/character-stats',
    '/progress-report',
    '/feedback',
    '/friends'
  ],
  PUBLIC_ONLY: ['/', '/auth'],
  API: {
    PUBLIC: ['/api/auth'],
    PROTECTED: [
      '/api/habits',
      '/api/goals',
      '/api/character',
      '/api/feedback',
      '/api/friends'
    ],
  },
};

// Friend-related security settings
export const FRIEND_SECURITY = {
  MAX_FRIEND_REQUESTS_PER_DAY: 50,
  MAX_FRIENDS: 1000,
  MAX_PENDING_REQUESTS: 100,
  FRIEND_REQUEST_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Sensitive data fields that should be encrypted
export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'key',
  'secret',
  'credit_card',
  'ssn',
  'personal_info',
];

// Error messages
export const SECURITY_ERRORS = {
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  RATE_LIMITED: 'Too many requests, please try again later',
  INVALID_INPUT: 'Invalid input data',
  VALIDATION_FAILED: 'Validation failed',
  SESSION_EXPIRED: 'Session has expired',
  ACCOUNT_LOCKED: 'Account has been temporarily locked',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  FRIEND_REQUEST_LIMIT: 'Friend request limit reached',
  MAX_FRIENDS_REACHED: 'Maximum number of friends reached',
  INVALID_FRIEND_REQUEST: 'Invalid friend request',
};

// Security-related types
export interface SecurityConfig {
  auth: typeof AUTH_CONFIG;
  rateLimit: typeof RATE_LIMIT_CONFIG;
  encryption: typeof ENCRYPTION_CONFIG;
  headers: typeof SECURITY_HEADERS;
  protectedRoutes: typeof PROTECTED_ROUTES;
  friendSecurity: typeof FRIEND_SECURITY;
  sensitiveFields: typeof SENSITIVE_FIELDS;
  errors: typeof SECURITY_ERRORS;
}

export interface LoginAttempt {
  timestamp: number;
  success: boolean;
  ip: string;
}

export interface SecurityContext {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
  session?: {
    token: string;
    expiresAt: number;
  };
}

// Environment variables validation
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'ENCRYPTION_KEY',
];

export const validateSecurityEnv = (): void => {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Export default configuration
export const securityConfig: SecurityConfig = {
  auth: AUTH_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  encryption: ENCRYPTION_CONFIG,
  headers: SECURITY_HEADERS,
  protectedRoutes: PROTECTED_ROUTES,
  friendSecurity: FRIEND_SECURITY,
  sensitiveFields: SENSITIVE_FIELDS,
  errors: SECURITY_ERRORS,
};
