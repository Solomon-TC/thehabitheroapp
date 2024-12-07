import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const HASH_ITERATIONS = 100000;
const KEY_LENGTH = 32;

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

export class EncryptionService {
  private static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private static instance: EncryptionService;

  private constructor() {}

  /**
   * Encrypt sensitive data
   */
  static encrypt(text: string): EncryptedData {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const key = crypto.pbkdf2Sync(
      ENCRYPTION_KEY,
      salt,
      HASH_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt,
    };
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: EncryptedData): string {
    const { encrypted, iv, tag, salt } = encryptedData;
    
    const key = crypto.pbkdf2Sync(
      ENCRYPTION_KEY,
      salt,
      HASH_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash password with salt
   */
  static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      HASH_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    ).toString('hex');

    return { hash, salt };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const verifyHash = crypto.pbkdf2Sync(
      password,
      salt,
      HASH_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    ).toString('hex');

    return hash === verifyHash;
  }

  /**
   * Generate secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    isStrong: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    if (password.length < 12) {
      reasons.push('Password should be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      reasons.push('Password should contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      reasons.push('Password should contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      reasons.push('Password should contain at least one number');
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      reasons.push('Password should contain at least one special character');
    }
    
    // Check for common patterns
    const commonPatterns = [
      /^123/, /password/i, /qwerty/i, /abc/i,
      /admin/i, /letmein/i, /welcome/i
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      reasons.push('Password contains common patterns that are easily guessed');
    }

    return {
      isStrong: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Sanitize sensitive data from logs
   */
  static sanitizeForLogs(data: any): any {
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'credit_card'];
    
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeForLogs(sanitized[key]);
      }
    });

    return sanitized;
  }
}

// Export types for use in other files
export type { EncryptedData };
