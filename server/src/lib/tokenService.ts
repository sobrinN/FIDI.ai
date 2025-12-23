/**
 * Credit Service - Manages user credit balances, quotas, and monthly resets
 * Implements thread-safe operations using file-system locking
 * Note: "Credits" are the user-facing currency, not tied to LLM token counts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserById, updateUser, StoredUser, migrateUserCreditFields, PLAN_CONFIG } from './userStorage.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lock directory for thread-safe operations
const LOCK_DIR = path.join(__dirname, '../../data/locks');

// Credit costs constants - UNIVERSAL PRICING MODEL
// Note: "Credits" are user-facing currency, not tied to LLM token counts
export const CREDIT_COSTS = {
  // Media generation costs (fixed per operation)
  IMAGE_GENERATION: 5,           // 5 credits per image (Replicate API)
  VIDEO_GENERATION: 50,          // 50 credits per video (Replicate API)

  // Text model costs (per 1M LLM tokens from API) - 1:1 ratio (1 credit = 1 token)
  TEXT_INPUT_PER_1M: 1000000,    // 1M credits per 1M input tokens
  TEXT_OUTPUT_PER_1M: 1000000,   // 1M credits per 1M output tokens

  // Plan allowances
  FREE_PLAN_CREDITS: PLAN_CONFIG.free.monthlyCredits,   // 100 credits/month
  PRO_PLAN_CREDITS: PLAN_CONFIG.pro.monthlyCredits,     // 1000 credits/month

  // System configuration
  RESET_INTERVAL_DAYS: 30,
  MIN_CHAT_CREDITS: 1            // Minimum 1 credit per chat request
} as const;

// Backward compatibility alias (for imports from other files)
export const TOKEN_COSTS = CREDIT_COSTS;

/**
 * Initialize the lock directory if it doesn't exist
 */
async function initializeLockDir(): Promise<void> {
  try {
    await fs.promises.access(LOCK_DIR);
  } catch {
    await fs.promises.mkdir(LOCK_DIR, { recursive: true });
    console.log('[TokenService] Created lock directory:', LOCK_DIR);
  }
}

// Performance: Conditional debug logging
const DEBUG_TOKENS = process.env.DEBUG_TOKENS === 'true';

/**
 * Acquire a file-system lock for thread-safe operations
 * Returns unlock function if successful
 * Automatically cleans up stale locks (older than 30 seconds)
 * PERFORMANCE: Uses async fs.promises API to avoid blocking event loop
 */
async function acquireLock(userId: string): Promise<() => Promise<void>> {
  await initializeLockDir();

  const lockFile = path.join(LOCK_DIR, `${userId}.lock`);
  const maxRetries = 50;
  const retryDelay = 100;
  const STALE_LOCK_MS = 30000; // 30 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check if lock exists and if it's stale (using async stat)
      try {
        const stat = await fs.promises.stat(lockFile);
        const lockAge = Date.now() - stat.mtimeMs;

        // Clean up stale locks
        if (lockAge > STALE_LOCK_MS) {
          if (DEBUG_TOKENS) console.warn(`[TokenService] Removing stale lock for user ${userId} (age: ${lockAge}ms)`);
          try {
            await fs.promises.unlink(lockFile);
          } catch (unlinkError) {
            // Lock might have been removed by another process
            if (DEBUG_TOKENS) console.warn(`[TokenService] Failed to remove stale lock (may already be removed):`, unlinkError);
          }
        }
      } catch {
        // Lock file doesn't exist, which is fine - we'll create it
      }

      // Try to acquire lock atomically using writeFile with exclusive flag
      await fs.promises.writeFile(lockFile, Date.now().toString(), { flag: 'wx' });

      // Return async unlock function
      return async () => {
        try {
          await fs.promises.unlink(lockFile);
        } catch (error) {
          if (DEBUG_TOKENS) console.error(`[TokenService] Failed to release lock for user ${userId}:`, error);
        }
      };
    } catch (error) {
      // Lock exists or write failed, wait and retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(`Failed to acquire user lock after ${maxRetries} retries`);
}


/**
 * Check if user needs credit reset (30 days since last reset)
 * If yes, reset balance and usage counters based on user's plan
 */
export async function checkAndResetCredits(userId: string): Promise<StoredUser | null> {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  // Use centralized migration logic from userStorage
  const migratedUser = migrateUserCreditFields(user);

  const daysSinceReset = (Date.now() - (migratedUser.lastCreditReset || 0)) / (1000 * 60 * 60 * 24);

  if (daysSinceReset >= CREDIT_COSTS.RESET_INTERVAL_DAYS) {
    // Determine monthly allowance based on plan
    const plan = migratedUser.plan || 'free';
    const monthlyAllowance = plan === 'pro'
      ? CREDIT_COSTS.PRO_PLAN_CREDITS
      : CREDIT_COSTS.FREE_PLAN_CREDITS;

    // Reset credits with plan-aware balance
    const resetUser = {
      ...migratedUser,
      creditBalance: monthlyAllowance,
      creditUsageThisMonth: 0,
      lastCreditReset: Date.now(),
      planRenewDate: Date.now() + (CREDIT_COSTS.RESET_INTERVAL_DAYS * 24 * 60 * 60 * 1000)
    };

    console.log('[CreditService] Monthly reset for user:', {
      userId,
      plan,
      daysSinceReset: daysSinceReset.toFixed(1),
      newBalance: monthlyAllowance
    });

    return await updateUser(userId, resetUser);
  }

  // No reset needed, but save if migration occurred
  if (migratedUser !== user) {
    return await updateUser(userId, migratedUser);
  }

  return migratedUser;
}

// Backward compatibility alias
export const checkAndResetTokens = checkAndResetCredits;

/**
 * Get current credit balance with auto-reset
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const user = await checkAndResetCredits(userId);
  if (!user) {
    console.warn('[CreditService] User not found for balance check:', userId);
    return 0;
  }
  const plan = user.plan || 'free';
  const defaultBalance = plan === 'pro' ? CREDIT_COSTS.PRO_PLAN_CREDITS : CREDIT_COSTS.FREE_PLAN_CREDITS;
  const balance = user.creditBalance ?? defaultBalance;

  // Debug logging to trace balance retrieval
  console.log('[CreditService] getCreditBalance:', {
    userId,
    plan,
    rawCreditBalance: user.creditBalance,
    defaultBalance,
    returnedBalance: balance
  });

  return balance;
}

// Backward compatibility alias
export const getTokenBalance = getCreditBalance;

/**
 * Check if user has sufficient credits
 */
export async function hasCredits(userId: string, amount: number): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  return balance >= amount;
}

// Backward compatibility alias
export const hasTokens = hasCredits;

/**
 * Deduct credits from user balance (thread-safe)
 * CRITICAL: Only call after successful API operation
 * FIX: Moved user update INSIDE the lock to prevent TOCTOU race condition
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amount < 0) {
    console.error('[CreditService] Invalid credit amount:', amount);
    return { success: false, newBalance: 0, error: 'Quantidade de créditos inválida' };
  }

  // Allow zero-cost operations (e.g., free tier tracking)
  if (amount === 0) {
    const balance = await getCreditBalance(userId);
    console.log('[CreditService] Zero-cost operation (no deduction)', {
      userId,
      reason,
      currentBalance: balance
    });
    return { success: true, newBalance: balance };
  }

  // Acquire lock for thread-safe operation
  const unlock = await acquireLock(userId);

  try {
    // Check and reset credits if needed
    const user = await checkAndResetCredits(userId);
    if (!user) {
      return { success: false, newBalance: 0, error: 'Usuário não encontrado' };
    }

    // Get plan-aware default balance
    const plan = user.plan || 'free';
    const defaultBalance = plan === 'pro' ? CREDIT_COSTS.PRO_PLAN_CREDITS : CREDIT_COSTS.FREE_PLAN_CREDITS;

    // Use null coalescing for all optional credit fields
    const currentBalance = user.creditBalance ?? defaultBalance;
    const currentUsageTotal = user.creditUsageTotal ?? 0;
    const currentUsageMonth = user.creditUsageThisMonth ?? 0;

    // Check sufficient balance
    if (currentBalance < amount) {
      console.warn('[CreditService] Insufficient credits', {
        userId,
        plan,
        required: amount,
        available: currentBalance,
        reason
      });
      return {
        success: false,
        newBalance: currentBalance,
        error: 'Créditos insuficientes'
      };
    }

    // Calculate new values
    const newBalance = currentBalance - amount;
    const newUsageTotal = currentUsageTotal + amount;
    const newUsageThisMonth = currentUsageMonth + amount;

    // CRITICAL FIX: Update user BEFORE releasing lock to prevent race condition
    const updatedUser = await updateUser(userId, {
      creditBalance: newBalance,
      creditUsageTotal: newUsageTotal,
      creditUsageThisMonth: newUsageThisMonth
    });

    if (!updatedUser) {
      return { success: false, newBalance: currentBalance, error: 'Falha ao atualizar usuário' };
    }

    console.log('[CreditService] Credits deducted', {
      userId,
      plan,
      credits: amount,
      reason,
      previousBalance: currentBalance,
      newBalance,
      totalUsage: newUsageTotal
    });

    return { success: true, newBalance };
  } finally {
    // Lock is released AFTER user update completes
    await unlock();
  }
}

// Backward compatibility alias
export const deductTokens = deductCredits;

/**
 * Grant credits to user (admin only)
 * FIX: Moved user update INSIDE the lock to prevent TOCTOU race condition
 */
export async function grantCredits(
  userId: string,
  amount: number,
  adminId: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  // Check if admin has permission
  const admin = await getUserById(adminId);
  if (!admin?.isAdmin) {
    console.warn('[CreditService] Unauthorized credit grant attempt', { adminId, userId });
    return { success: false, newBalance: 0, error: 'Não autorizado' };
  }

  if (amount <= 0) {
    return { success: false, newBalance: 0, error: 'Quantidade inválida' };
  }

  const unlock = await acquireLock(userId);

  try {
    const user = await checkAndResetCredits(userId);
    if (!user) {
      return { success: false, newBalance: 0, error: 'Usuário não encontrado' };
    }

    // Get plan-aware default balance
    const plan = user.plan || 'free';
    const defaultBalance = plan === 'pro' ? CREDIT_COSTS.PRO_PLAN_CREDITS : CREDIT_COSTS.FREE_PLAN_CREDITS;

    // Use null coalescing for optional credit fields
    const currentBalance = user.creditBalance ?? defaultBalance;
    const newBalance = currentBalance + amount;

    // CRITICAL FIX: Update user BEFORE releasing lock
    const updatedUser = await updateUser(userId, {
      creditBalance: newBalance
    });

    if (!updatedUser) {
      return { success: false, newBalance: currentBalance, error: 'Falha ao atualizar usuário' };
    }

    console.log('[CreditService] Credits granted', {
      userId,
      amount,
      adminId,
      previousBalance: currentBalance,
      newBalance
    });

    return { success: true, newBalance };
  } finally {
    // Lock is released AFTER user update completes
    await unlock();
  }
}

// Backward compatibility alias
export const grantTokens = grantCredits;

/**
 * Get usage statistics for a user
 */
export interface UsageStats {
  creditBalance: number;
  creditUsageTotal: number;
  creditUsageThisMonth: number;
  lastCreditReset: number;
  daysUntilReset: number;
  plan: 'free' | 'pro';
  monthlyAllowance: number;
  planRenewDate: number;
}

export async function getUsageStats(userId: string): Promise<UsageStats | null> {
  const user = await checkAndResetCredits(userId);
  if (!user) {
    return null;
  }

  const plan = user.plan || 'free';
  const monthlyAllowance = plan === 'pro' ? CREDIT_COSTS.PRO_PLAN_CREDITS : CREDIT_COSTS.FREE_PLAN_CREDITS;
  const lastReset = user.lastCreditReset ?? Date.now();
  const daysSinceReset = (Date.now() - lastReset) / (1000 * 60 * 60 * 24);
  const daysUntilReset = Math.max(0, CREDIT_COSTS.RESET_INTERVAL_DAYS - daysSinceReset);

  return {
    creditBalance: user.creditBalance ?? monthlyAllowance,
    creditUsageTotal: user.creditUsageTotal ?? 0,
    creditUsageThisMonth: user.creditUsageThisMonth ?? 0,
    lastCreditReset: lastReset,
    daysUntilReset: Math.ceil(daysUntilReset),
    plan,
    monthlyAllowance,
    planRenewDate: user.planRenewDate ?? (Date.now() + (30 * 24 * 60 * 60 * 1000))
  };
}
