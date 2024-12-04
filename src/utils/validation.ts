import { z } from 'zod';

// Basic input validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Habit validation schema
export const habitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  target_count: z.number().min(1, 'Target count must be at least 1').max(100, 'Target count is too high'),
  reminder_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  category: z.enum(['health', 'productivity', 'learning', 'fitness', 'other']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
});

// Goal validation schema
export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  target_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  category: z.enum(['short_term', 'medium_term', 'long_term']),
  priority: z.enum(['low', 'medium', 'high']),
  milestones: z.array(z.string()).max(10, 'Maximum 10 milestones allowed').optional(),
});

// Character validation schema
export const characterSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(30, 'Name is too long'),
  class: z.enum(['warrior', 'mage', 'rogue', 'healer']),
  level: z.number().min(1, 'Level must be at least 1'),
  experience: z.number().min(0, 'Experience cannot be negative'),
  attributes: z.object({
    strength: z.number().min(1),
    intelligence: z.number().min(1),
    dexterity: z.number().min(1),
    constitution: z.number().min(1),
  }),
});

// Feedback validation schema
export const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'improvement', 'general']),
  message: z.string().min(10, 'Message is too short').max(1000, 'Message is too long'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  screenshot: z.string().url().optional(),
});

// Form data sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Data type validation
export function validateDataType<T>(value: unknown, type: string): value is T {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'date':
      return value instanceof Date && !isNaN(value.getTime());
    default:
      return false;
  }
}

// API response validation
export function validateApiResponse<T>(response: unknown, schema: z.ZodType<T>): T {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid API response: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Form validation helper
export function validateForm<T>(
  data: unknown,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path.join('.')] = err.message;
        }
      });
      return { success: false, errors };
    }
    throw error;
  }
}

// Date validation
export function isValidDate(date: string): boolean {
  const timestamp = Date.parse(date);
  if (isNaN(timestamp)) return false;
  
  const dateObj = new Date(timestamp);
  return dateObj.getTime() > new Date().getTime();
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Number range validation
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Array length validation
export function hasValidLength(arr: unknown[], min: number, max: number): boolean {
  return arr.length >= min && arr.length <= max;
}

// Object property validation
export function hasRequiredProperties<T extends object>(
  obj: T,
  requiredProps: (keyof T)[]
): boolean {
  return requiredProps.every(prop => 
    Object.prototype.hasOwnProperty.call(obj, prop) && 
    obj[prop] !== undefined && 
    obj[prop] !== null
  );
}

// Custom type guards
export function isHabit(value: unknown): value is z.infer<typeof habitSchema> {
  return habitSchema.safeParse(value).success;
}

export function isGoal(value: unknown): value is z.infer<typeof goalSchema> {
  return goalSchema.safeParse(value).success;
}

export function isCharacter(value: unknown): value is z.infer<typeof characterSchema> {
  return characterSchema.safeParse(value).success;
}

export function isFeedback(value: unknown): value is z.infer<typeof feedbackSchema> {
  return feedbackSchema.safeParse(value).success;
}
