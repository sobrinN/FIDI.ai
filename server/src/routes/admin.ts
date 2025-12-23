/**
 * Admin Routes - Token management and user administration
 * Requires admin authentication
 */

import { Router, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthRequest } from '../middleware/auth.js';
import { APIError } from '../middleware/errorHandler.js';
import { grantTokens, getUsageStats } from '../lib/tokenService.js';
import { getUserById, StoredUser } from '../lib/userStorage.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export const adminRouter = Router();

/**
 * Middleware to check if user is admin
 */
async function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new APIError('Authentication required', 401, 'NO_USER');
    }

    const user = await getUserById(req.user.id);
    if (!user?.isAdmin) {
      console.warn('[Admin] Unauthorized access attempt', { userId: req.user.id });
      throw new APIError('Admin access required', 403, 'FORBIDDEN');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Grant tokens to a user (admin only)
 * POST /api/admin/tokens/grant
 * Body: { userId: string, amount: number }
 */
adminRouter.post('/tokens/grant', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || typeof userId !== 'string') {
      throw new APIError('Invalid or missing userId', 400, 'INVALID_USER_ID');
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new APIError('Invalid amount. Must be a positive number', 400, 'INVALID_AMOUNT');
    }

    if (amount > 1000000) {
      throw new APIError('Amount too large. Maximum 1,000,000 tokens', 400, 'AMOUNT_TOO_LARGE');
    }

    // Verify target user exists
    const targetUser = await getUserById(userId);
    if (!targetUser) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Grant tokens
    const result = await grantTokens(userId, amount, req.user!.id);

    if (!result.success) {
      throw new APIError(result.error || 'Failed to grant tokens', 500, 'GRANT_FAILED');
    }

    console.log('[Admin] Tokens granted', {
      adminId: req.user!.id,
      targetUserId: userId,
      amount,
      newBalance: result.newBalance
    });

    res.json({
      success: true,
      message: `Granted ${amount} tokens to user ${userId}`,
      newBalance: result.newBalance
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get token statistics for a specific user (admin only)
 * GET /api/admin/tokens/stats/:userId
 */
adminRouter.get('/tokens/stats/:userId', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new APIError('Missing userId', 400, 'MISSING_USER_ID');
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    const stats = await getUsageStats(userId);
    if (!stats) {
      throw new APIError('Failed to get usage stats', 500, 'STATS_ERROR');
    }

    res.json({
      userId,
      email: user.email,
      name: user.name,
      stats: {
        creditBalance: stats.creditBalance,
        creditUsageTotal: stats.creditUsageTotal,
        creditUsageThisMonth: stats.creditUsageThisMonth,
        lastCreditReset: stats.lastCreditReset,
        daysUntilReset: stats.daysUntilReset
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get overview of all users' token balances (admin only)
 * GET /api/admin/tokens/overview
 * FIX: Removed nested dynamic imports, simplified to direct file read
 */
adminRouter.get('/tokens/overview', requireAdmin, (_req: AuthRequest, res, next): void => {
  try {
    // Check if users file exists
    if (!fs.existsSync(USERS_FILE)) {
      res.json({ users: [] });
      return;
    }

    // Read and parse users file
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const users = parsed.users || [];

    // Map users to overview format with proper null coalescing
    const overview = (users as StoredUser[]).map((user) => ({
      userId: user.id,
      email: user.email,
      name: user.name,
      creditBalance: user.creditBalance ?? 100,
      creditUsageThisMonth: user.creditUsageThisMonth ?? 0,
      creditUsageTotal: user.creditUsageTotal ?? 0,
      lastCreditReset: user.lastCreditReset ?? Date.now(),
      isAdmin: user.isAdmin ?? false
    }));

    res.json({ users: overview });
  } catch (error) {
    next(error);
  }
});
