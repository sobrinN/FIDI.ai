import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { APIError } from './errorHandler.js';

// Constants
const MIN_JWT_SECRET_LENGTH = 32;

/**
 * Get JWT secret with runtime validation
 * Validates at runtime (not module load time) to allow dotenv.config() to run first
 */
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new APIError(
      'FATAL: JWT_SECRET environment variable is required. ' +
      'Add JWT_SECRET to server/.env file (minimum 32 characters).',
      500,
      'MISSING_JWT_SECRET'
    );
  }

  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new APIError(
      `FATAL: JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters. ` +
      `Current length: ${secret.length}`,
      500,
      'INVALID_JWT_SECRET'
    );
  }

  return secret;
};

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    getJWTSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): User {
  try {
    return jwt.verify(token, getJWTSecret()) as User;
  } catch (error) {
    throw new APIError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies.auth_token;

  if (!token) {
    throw new APIError('Authentication required', 401, 'NO_TOKEN');
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
