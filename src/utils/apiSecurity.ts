import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { ZodIssue } from 'zod';

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

// Input validation schemas
export const habitSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  target_count: z.number().int().positive(),
  attribute_type: z.enum(['strength', 'agility', 'wisdom', 'creativity']),
});

export const goalSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  target_date: z.string().refine((date: string) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  attribute_type: z.enum(['strength', 'agility', 'wisdom', 'creativity']),
});

export const characterSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  character_type: z.enum(['warrior', 'scout', 'sage', 'artist']),
  appearance: z.object({
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
    accessories: z.array(z.string()),
    achievements: z.array(z.string()),
  }),
  attributes: z.object({
    strength: z.number().int().min(1).max(10),
    agility: z.number().int().min(1).max(10),
    wisdom: z.number().int().min(1).max(10),
    creativity: z.number().int().min(1).max(10),
  }),
});

export const feedbackSchema = z.object({
  category: z.enum(['general', 'bug', 'feature', 'improvement']),
  feedback: z.string().min(1).max(1000).trim(),
});

// Types
export type HabitInput = z.infer<typeof habitSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type CharacterInput = z.infer<typeof characterSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

interface ErrorResponse {
  error: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

// Rate limiting
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimits.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return false;
  }

  userLimit.count += 1;
  return true;
};

// Security utility functions
export const validateAndSanitizeHabit = (data: unknown): HabitInput => {
  const validated = habitSchema.parse(data);
  return {
    ...validated,
    title: sanitizeInput(validated.title),
    description: validated.description ? sanitizeInput(validated.description) : undefined,
  };
};

export const validateAndSanitizeGoal = (data: unknown): GoalInput => {
  const validated = goalSchema.parse(data);
  return {
    ...validated,
    title: sanitizeInput(validated.title),
    description: validated.description ? sanitizeInput(validated.description) : undefined,
  };
};

export const validateAndSanitizeCharacter = (data: unknown): CharacterInput => {
  const validated = characterSchema.parse(data);
  return {
    ...validated,
    name: sanitizeInput(validated.name),
  };
};

export const validateAndSanitizeFeedback = (data: unknown): FeedbackInput => {
  const validated = feedbackSchema.parse(data);
  return {
    ...validated,
    feedback: sanitizeInput(validated.feedback),
  };
};

// Error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const handleSecurityError = (error: unknown): ErrorResponse => {
  if (error instanceof z.ZodError) {
    return {
      error: 'Validation Error',
      details: error.issues.map((issue: ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: 'Validation Error',
      message: error.message,
    };
  }

  console.error('Security Error:', error);
  return {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  };
};

// API route wrapper for security
export const withApiSecurity = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  allowedMethods: string[],
  requireAuth: boolean = true
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get client IP
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const clientIp = Array.isArray(ip) ? ip[0] : ip;

      // Check rate limit
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Please try again later',
        });
      }

      // Validate request method
      if (!allowedMethods.includes(req.method ?? '')) {
        throw new ValidationError(`Method ${req.method} not allowed`);
      }

      // Validate session if required
      if (requireAuth) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      }

      // Call the handler
      await handler(req, res);
    } catch (error) {
      const errorResponse = handleSecurityError(error);
      res.status(400).json(errorResponse);
    }
  };
};
