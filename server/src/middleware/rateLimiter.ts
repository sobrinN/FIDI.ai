import rateLimit from 'express-rate-limit';

// Constants for rate limit configuration
const MINUTE_MS = 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * MINUTE_MS;

/**
 * General API rate limiter
 * Applies to all /api/ routes
 */
export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: {
    error: 'Too many requests. Please try again in a few minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

/**
 * Strict limiter for expensive AI operations
 * Applies to chat and media generation
 */
export const aiLimiter = rateLimit({
  windowMs: MINUTE_MS, // 1 minute
  max: 20, // 20 AI requests per minute per IP
  message: {
    error: 'Request limit exceeded. Please wait 1 minute.',
    code: 'AI_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth limiter to prevent brute force login attacks
 * Strict: 5 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts. Please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT'
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Registration limiter - more lenient than login
 * Prevents mass account creation while allowing legitimate users
 */
export const registrationLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS, // 15 minutes
  max: 10, // 10 registration attempts per 15 minutes per IP
  message: {
    error: 'Too many registration attempts. Please try again in 15 minutes.',
    code: 'REGISTRATION_RATE_LIMIT'
  },
  skipSuccessfulRequests: false, // Count all attempts including successful ones
  standardHeaders: true,
  legacyHeaders: false,
});
