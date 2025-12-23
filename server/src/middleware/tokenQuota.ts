/**
 * Token Quota Middleware - Pre-flight token balance checks
 * Returns 402 Payment Required if user has insufficient tokens
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { APIError } from './errorHandler.js';
import { hasTokens, getTokenBalance } from '../lib/tokenService.js';

/**
 * Check if user has sufficient tokens before processing request
 * Returns 402 Payment Required if insufficient tokens
 */
export function checkTokenQuota(requiredTokens: number) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401, 'NO_USER');
      }

      const userId = req.user.id;
      const currentBalance = await getTokenBalance(userId);

      if (!(await hasTokens(userId, requiredTokens))) {
        console.warn('[TokenQuota] Insufficient tokens', {
          userId,
          required: requiredTokens,
          available: currentBalance
        });

        throw new APIError(
          `Créditos insuficientes. Necessário: ${requiredTokens}, Disponível: ${currentBalance}. Os créditos renovam mensalmente.`,
          402,
          'INSUFFICIENT_CREDITS',
          undefined, // errorType
          false, // retryable
          { currentBalance, required: requiredTokens } // metadata
        );
      }

      console.log('[TokenQuota] Pre-flight check passed', {
        userId,
        required: requiredTokens,
        available: currentBalance
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Mark request for dynamic token deduction (for LLM usage)
 * Actual deduction happens after API response includes usage data
 */
export function prepareDynamicTokenDeduction() {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new APIError('Authentication required', 401, 'NO_USER');
    }

    // Set flag for dynamic deduction
    (req as any).dynamicTokenDeduction = true;

    console.log('[TokenQuota] Prepared for dynamic token deduction', {
      userId: req.user.id
    });

    next();
  };
}
