/**
 * Token Service - Manages user token balances, quotas, and monthly resets
 * Implements thread-safe operations using file-system locking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserById, updateUser, StoredUser } from './userStorage.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lock directory for thread-safe operations
const LOCK_DIR = path.join(__dirname, '../../data/locks');

// Token costs constants
export const TOKEN_COSTS = {
  IMAGE_GENERATION: 5000,
  VIDEO_GENERATION: 20000,
  DEFAULT_BALANCE: 50000,
  RESET_INTERVAL_DAYS: 30
} as const;

/**
 * Initialize the lock directory if it doesn't exist
 */
function initializeLockDir(): void {
  if (!fs.existsSync(LOCK_DIR)) {
    fs.mkdirSync(LOCK_DIR, { recursive: true });
    console.log('[TokenService] Created lock directory:', LOCK_DIR);
  }
}

/**
 * Acquire a file-system lock for thread-safe operations
 * Returns unlock function if successful
 * Automatically cleans up stale locks (older than 30 seconds)
 */
async function acquireLock(userId: string): Promise<() => void> {
  initializeLockDir();

  const lockFile = path.join(LOCK_DIR, `${userId}.lock`);
  const maxRetries = 50;
  const retryDelay = 100;
  const STALE_LOCK_MS = 30000; // 30 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check if lock exists and if it's stale
      if (fs.existsSync(lockFile)) {
        const lockAge = Date.now() - fs.statSync(lockFile).mtimeMs;

        // Clean up stale locks
        if (lockAge > STALE_LOCK_MS) {
          console.warn(`[TokenService] Removing stale lock for user ${userId} (age: ${lockAge}ms)`);
          try {
            fs.unlinkSync(lockFile);
          } catch (unlinkError) {
            // Lock might have been removed by another process
            console.warn(`[TokenService] Failed to remove stale lock (may already be removed):`, unlinkError);
          }
        }
      }

      // Try to acquire lock atomically
      fs.writeFileSync(lockFile, Date.now().toString(), { flag: 'wx' });

      // Return unlock function
      return () => {
        try {
          if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
          }
        } catch (error) {
          console.error(`[TokenService] Failed to release lock for user ${userId}:`, error);
        }
      };
    } catch (error) {
      // Lock exists, wait and retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(`Failed to acquire user lock after ${maxRetries} retries`);
}


/**
 * Check if user needs token reset (30 days since last reset)
 * If yes, reset balance and usage counters
 */
export function checkAndResetTokens(userId: string): StoredUser | null {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  // Lazy migration: add token fields if they don't exist
  let migratedUser = user;
  if (migratedUser.tokenBalance === undefined) {
    migratedUser = {
      ...user,
      tokenBalance: TOKEN_COSTS.DEFAULT_BALANCE,
      tokenUsageTotal: 0,
      tokenUsageThisMonth: 0,
      lastTokenReset: Date.now(),
      isAdmin: false
    };
  }

  const daysSinceReset = (Date.now() - (migratedUser.lastTokenReset || 0)) / (1000 * 60 * 60 * 24);

  if (daysSinceReset >= TOKEN_COSTS.RESET_INTERVAL_DAYS) {
    // Reset tokens
    const resetUser = {
      ...migratedUser,
      tokenBalance: TOKEN_COSTS.DEFAULT_BALANCE,
      tokenUsageThisMonth: 0,
      lastTokenReset: Date.now()
    };

    console.log('[TokenService] Monthly reset for user:', {
      userId,
      daysSinceReset: daysSinceReset.toFixed(1),
      newBalance: TOKEN_COSTS.DEFAULT_BALANCE
    });

    return updateUser(userId, resetUser);
  }

  // No reset needed, but save if migration occurred
  if (migratedUser !== user) {
    return updateUser(userId, migratedUser);
  }

  return migratedUser;
}

/**
 * Get current token balance with auto-reset
 */
export function getTokenBalance(userId: string): number {
  const user = checkAndResetTokens(userId);
  if (!user) {
    return 0;
  }
  return user.tokenBalance ?? TOKEN_COSTS.DEFAULT_BALANCE;
}

/**
 * Check if user has sufficient tokens
 */
export function hasTokens(userId: string, amount: number): boolean {
  const balance = getTokenBalance(userId);
  return balance >= amount;
}

/**
 * Deduct tokens from user balance (thread-safe)
 * CRITICAL: Only call after successful API operation
 * FIX: Moved user update INSIDE the lock to prevent TOCTOU race condition
 *
 * @param costMultiplier - Cost multiplier (0 for FREE, 1.5 for PAID, 1.0 for LEGACY)
 */
export async function deductTokens(
  userId: string,
  amount: number,
  reason: string,
  costMultiplier: number = 1.0
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amount < 0) {
    console.error('[TokenService] Invalid token amount:', amount);
    return { success: false, newBalance: 0, error: 'Invalid token amount' };
  }

  // Acquire lock for thread-safe operation
  const unlock = await acquireLock(userId);

  try {
    // Check and reset tokens if needed
    const user = checkAndResetTokens(userId);
    if (!user) {
      return { success: false, newBalance: 0, error: 'User not found' };
    }

    // FIX: Use null coalescing for all optional token fields
    const currentBalance = user.tokenBalance ?? TOKEN_COSTS.DEFAULT_BALANCE;
    const currentUsageTotal = user.tokenUsageTotal ?? 0;
    const currentUsageMonth = user.tokenUsageThisMonth ?? 0;

    // FREE MODEL BYPASS: No deduction for free tier models (costMultiplier = 0)
    if (costMultiplier === 0) {
      console.log('[TokenService] Free model usage (no deduction)', {
        userId,
        baseTokens: amount,
        costMultiplier: 0,
        reason,
        currentBalance
      });
      return { success: true, newBalance: currentBalance };
    }

    // Calculate actual cost with multiplier
    const actualCost = Math.ceil(amount * costMultiplier);

    if (currentBalance < actualCost) {
      console.warn('[TokenService] Insufficient tokens', {
        userId,
        baseTokens: amount,
        costMultiplier,
        actualCost,
        available: currentBalance,
        reason
      });
      return {
        success: false,
        newBalance: currentBalance,
        error: 'Insufficient tokens'
      };
    }

    // Calculate new values with actual cost
    const newBalance = currentBalance - actualCost;
    const newUsageTotal = currentUsageTotal + actualCost;
    const newUsageThisMonth = currentUsageMonth + actualCost;

    // CRITICAL FIX: Update user BEFORE releasing lock to prevent race condition
    const updatedUser = updateUser(userId, {
      tokenBalance: newBalance,
      tokenUsageTotal: newUsageTotal,
      tokenUsageThisMonth: newUsageThisMonth
    });

    if (!updatedUser) {
      return { success: false, newBalance: currentBalance, error: 'Failed to update user' };
    }

    console.log('[TokenService] Tokens deducted', {
      userId,
      baseTokens: amount,
      costMultiplier,
      actualCost,
      reason,
      previousBalance: currentBalance,
      newBalance,
      totalUsage: newUsageTotal
    });

    return { success: true, newBalance };
  } finally {
    // Lock is released AFTER user update completes
    unlock();
  }
}

/**
 * Grant tokens to user (admin only)
 * FIX: Moved user update INSIDE the lock to prevent TOCTOU race condition
 */
export async function grantTokens(
  userId: string,
  amount: number,
  adminId: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  // Check if admin has permission
  const admin = getUserById(adminId);
  if (!admin?.isAdmin) {
    console.warn('[TokenService] Unauthorized token grant attempt', { adminId, userId });
    return { success: false, newBalance: 0, error: 'Unauthorized' };
  }

  if (amount <= 0) {
    return { success: false, newBalance: 0, error: 'Invalid amount' };
  }

  const unlock = await acquireLock(userId);

  try {
    const user = checkAndResetTokens(userId);
    if (!user) {
      return { success: false, newBalance: 0, error: 'User not found' };
    }

    // FIX: Use null coalescing for optional token fields
    const currentBalance = user.tokenBalance ?? TOKEN_COSTS.DEFAULT_BALANCE;
    const newBalance = currentBalance + amount;

    // CRITICAL FIX: Update user BEFORE releasing lock
    const updatedUser = updateUser(userId, {
      tokenBalance: newBalance
    });

    if (!updatedUser) {
      return { success: false, newBalance: currentBalance, error: 'Failed to update user' };
    }

    console.log('[TokenService] Tokens granted', {
      userId,
      amount,
      adminId,
      previousBalance: currentBalance,
      newBalance
    });

    return { success: true, newBalance };
  } finally {
    // Lock is released AFTER user update completes
    unlock();
  }
}

/**
 * Get usage statistics for a user
 */
export interface UsageStats {
  tokenBalance: number;
  tokenUsageTotal: number;
  tokenUsageThisMonth: number;
  lastTokenReset: number;
  daysUntilReset: number;
}

export function getUsageStats(userId: string): UsageStats | null {
  const user = checkAndResetTokens(userId);
  if (!user) {
    return null;
  }

  const lastReset = user.lastTokenReset ?? Date.now();
  const daysSinceReset = (Date.now() - lastReset) / (1000 * 60 * 60 * 24);
  const daysUntilReset = Math.max(0, TOKEN_COSTS.RESET_INTERVAL_DAYS - daysSinceReset);

  return {
    tokenBalance: user.tokenBalance ?? TOKEN_COSTS.DEFAULT_BALANCE,
    tokenUsageTotal: user.tokenUsageTotal ?? 0,
    tokenUsageThisMonth: user.tokenUsageThisMonth ?? 0,
    lastTokenReset: lastReset,
    daysUntilReset: Math.ceil(daysUntilReset)
  };
}
