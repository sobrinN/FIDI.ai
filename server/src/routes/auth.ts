import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { APIError } from '../middleware/errorHandler.js';
import {
  getUserByEmail,
  emailExists,
  createUser,
  StoredUser
} from '../lib/userStorage.js';

export const authRouter = Router();

// Constants for validation
const EMAIL_MAX_LENGTH = 254; // RFC 5321
const NAME_MAX_LENGTH = 100;
const NAME_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Validate email format and length
 * Returns null if valid, error message if invalid
 */
function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }

  const trimmed = email.trim();

  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return `Email must be less than ${EMAIL_MAX_LENGTH} characters`;
  }

  // RFC 5322 compliant email regex (simplified but effective)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return 'Invalid email format';
  }

  return null;
}

/**
 * Validate and sanitize name
 * Strips HTML tags and limits length
 */
function validateAndSanitizeName(name: string): { valid: boolean; sanitized: string; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, sanitized: '', error: 'Name is required' };
  }

  // Strip HTML tags to prevent XSS
  const sanitized = name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '')    // Remove any remaining angle brackets
    .trim();

  if (sanitized.length < NAME_MIN_LENGTH) {
    return {
      valid: false,
      sanitized,
      error: `Name must be at least ${NAME_MIN_LENGTH} characters`
    };
  }

  if (sanitized.length > NAME_MAX_LENGTH) {
    return {
      valid: false,
      sanitized,
      error: `Name must be less than ${NAME_MAX_LENGTH} characters`
    };
  }

  // Check for potentially malicious patterns
  const dangerousPatterns = [
    /javascript:/i,
    /on\w+\s*=/i,      // Event handlers like onclick=
    /data:/i,
    /vbscript:/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return {
        valid: false,
        sanitized: '',
        error: 'Name contains invalid characters'
      };
    }
  }

  return { valid: true, sanitized };
}

/**
 * Validate password strength
 */
function validatePassword(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be less than ${PASSWORD_MAX_LENGTH} characters`;
  }

  return null;
}

/**
 * Generate a secure UUID for user IDs
 */
function generateUserId(): string {
  return `user-${randomUUID()}`;
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate all fields
    if (!email || !password || !name) {
      throw new APIError('Missing required fields', 400, 'MISSING_FIELDS');
    }

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      throw new APIError(emailError, 400, 'INVALID_EMAIL');
    }

    // Validate and sanitize name
    const nameValidation = validateAndSanitizeName(name);
    if (!nameValidation.valid) {
      throw new APIError(nameValidation.error || 'Invalid name', 400, 'INVALID_NAME');
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      throw new APIError(passwordError, 400, 'WEAK_PASSWORD');
    }

    // Check if email already exists
    if (emailExists(email.trim().toLowerCase())) {
      throw new APIError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create user with UUID and sanitized data
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = Date.now();

    const user: StoredUser = {
      id: generateUserId(),
      email: email.trim().toLowerCase(),
      name: nameValidation.sanitized,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };

    createUser(user);

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to allow cross-site requests with cookies
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new APIError('Missing email or password', 400, 'MISSING_FIELDS');
    }

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
      throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Find user by email
    const user = getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to allow cross-site requests with cookies
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});

authRouter.get('/me', (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify token signature and expiration
    const user = verifyToken(token);

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    return next(error);
  }
});
