/**
 * File-based user storage with JSON persistence
 * Replaces in-memory storage to persist users across server restarts
 *
 * CRITICAL: Uses file locking to prevent race conditions under concurrent load
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and file paths
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USER_LOCK_FILE = path.join(DATA_DIR, 'users.lock');

// Lock configuration
const STALE_LOCK_MS = 30000; // Consider lock stale after 30 seconds
const LOCK_MAX_RETRIES = 50;
const LOCK_RETRY_DELAY_MS = 100;

// Default token balance for new/migrated users
export const DEFAULT_TOKEN_BALANCE = 50000;

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: number;
  updatedAt: number;
  // Token system fields
  tokenBalance?: number;
  tokenUsageTotal?: number;
  tokenUsageThisMonth?: number;
  lastTokenReset?: number;
  isAdmin?: boolean;
}

interface UsersData {
  users: StoredUser[];
  version: number;
}

/**
 * Initialize the data directory and users file if they don't exist
 */
function initializeStorage(): void {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('[UserStorage] Created data directory:', DATA_DIR);
    }

    // Create users file if it doesn't exist
    if (!fs.existsSync(USERS_FILE)) {
      const initialData: UsersData = {
        users: [],
        version: 1
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      console.log('[UserStorage] Created users file:', USERS_FILE);
    }
  } catch (error) {
    console.error('[UserStorage] Failed to initialize storage:', error);
    throw new Error('Failed to initialize user storage');
  }
}

/**
 * Acquire a file lock for user storage operations
 * Prevents race conditions when multiple requests modify user data
 *
 * @returns A release function to call when done
 */
async function acquireUserLock(): Promise<() => void> {
  initializeStorage();

  for (let i = 0; i < LOCK_MAX_RETRIES; i++) {
    try {
      // Check for stale lock
      if (fs.existsSync(USER_LOCK_FILE)) {
        const lockAge = Date.now() - fs.statSync(USER_LOCK_FILE).mtimeMs;
        if (lockAge > STALE_LOCK_MS) {
          console.warn('[UserStorage] Removing stale lock file (age: ' + lockAge + 'ms)');
          fs.unlinkSync(USER_LOCK_FILE);
        }
      }

      // Try to acquire lock atomically using 'wx' flag (exclusive create)
      fs.writeFileSync(USER_LOCK_FILE, Date.now().toString(), { flag: 'wx' });

      // Lock acquired - return release function
      return () => {
        try {
          if (fs.existsSync(USER_LOCK_FILE)) {
            fs.unlinkSync(USER_LOCK_FILE);
          }
        } catch (e) {
          console.error('[UserStorage] Failed to release lock:', e);
        }
      };
    } catch (err) {
      // Lock exists, wait and retry
      if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
        await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Failed to acquire user storage lock after ' + LOCK_MAX_RETRIES + ' retries');
}

/**
 * Migrate user to include token system fields
 * Called lazily when accessing users without token fields
 * CENTRALIZED: Single source of truth for migration logic
 */
export function migrateUserTokenFields(user: StoredUser): StoredUser {
  // Already migrated
  if (user.tokenBalance !== undefined) {
    return user;
  }

  return {
    ...user,
    tokenBalance: DEFAULT_TOKEN_BALANCE,
    tokenUsageTotal: 0,
    tokenUsageThisMonth: 0,
    lastTokenReset: Date.now(),
    isAdmin: user.isAdmin ?? false
  };
}

/**
 * Read all users from the JSON file
 */
function readUsers(): StoredUser[] {
  initializeStorage();

  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed: UsersData = JSON.parse(data);
    return parsed.users || [];
  } catch (error) {
    console.error('[UserStorage] Failed to read users:', error);
    return [];
  }
}

/**
 * Write users to the JSON file using atomic write (temp file + rename)
 * This prevents data corruption if the process crashes mid-write
 */
function writeUsers(users: StoredUser[]): void {
  initializeStorage();

  try {
    const data: UsersData = {
      users,
      version: 1
    };

    // Write to temp file first
    const tempFile = path.join(os.tmpdir(), `fidi-users-${Date.now()}-${process.pid}.tmp`);
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');

    // Atomic rename (overwrites destination)
    fs.renameSync(tempFile, USERS_FILE);
  } catch (error) {
    console.error('[UserStorage] Failed to write users:', error);
    throw new Error('Failed to save user data');
  }
}

/**
 * Get a user by email (with lazy migration for token fields)
 */
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return null;
  }

  // Use centralized migration logic
  const migratedUser = migrateUserTokenFields(user);

  // Only persist if migration occurred
  if (migratedUser !== user) {
    await updateUser(user.id, migratedUser);
    console.log('[UserStorage] Migrated user to token system:', user.id);
  }

  return migratedUser;
}

/**
 * Get a user by ID (with lazy migration for token fields)
 */
export async function getUserById(id: string): Promise<StoredUser | null> {
  const users = readUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    return null;
  }

  // Use centralized migration logic
  const migratedUser = migrateUserTokenFields(user);

  // Only persist if migration occurred
  if (migratedUser !== user) {
    await updateUser(user.id, migratedUser);
    console.log('[UserStorage] Migrated user to token system:', user.id);
  }

  return migratedUser;
}

/**
 * Check if email is already registered
 */
export async function emailExists(email: string): Promise<boolean> {
  return (await getUserByEmail(email)) !== null;
}

/**
 * Create a new user (with file locking)
 */
export async function createUser(user: StoredUser): Promise<StoredUser> {
  const releaseLock = await acquireUserLock();

  try {
    const users = readUsers();

    // Double-check email doesn't exist
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    // Initialize token fields for new users using centralized constant
    const userWithTokens: StoredUser = {
      ...user,
      tokenBalance: DEFAULT_TOKEN_BALANCE,
      tokenUsageTotal: 0,
      tokenUsageThisMonth: 0,
      lastTokenReset: Date.now(),
      isAdmin: false
    };

    users.push(userWithTokens);
    writeUsers(users);

    console.log('[UserStorage] Created user:', { id: userWithTokens.id, email: userWithTokens.email, tokenBalance: userWithTokens.tokenBalance });
    return userWithTokens;
  } finally {
    releaseLock();
  }
}

/**
 * Update an existing user (with file locking)
 */
export async function updateUser(id: string, updates: Partial<StoredUser>): Promise<StoredUser | null> {
  const releaseLock = await acquireUserLock();

  try {
    const users = readUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return null;
    }

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: Date.now()
    };

    writeUsers(users);
    return users[index];
  } finally {
    releaseLock();
  }
}

/**
 * Delete a user by ID (with file locking)
 */
export async function deleteUser(id: string): Promise<boolean> {
  const releaseLock = await acquireUserLock();

  try {
    const users = readUsers();
    const filteredUsers = users.filter(u => u.id !== id);

    if (filteredUsers.length === users.length) {
      return false; // User not found
    }

    writeUsers(filteredUsers);
    console.log('[UserStorage] Deleted user:', id);
    return true;
  } finally {
    releaseLock();
  }
}

/**
 * Get total user count
 */
export function getUserCount(): number {
  return readUsers().length;
}
