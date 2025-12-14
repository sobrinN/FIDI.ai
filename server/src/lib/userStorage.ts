/**
 * File-based user storage with JSON persistence
 * Replaces in-memory storage to persist users across server restarts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and file paths
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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
 * Write users to the JSON file
 */
function writeUsers(users: StoredUser[]): void {
  initializeStorage();

  try {
    const data: UsersData = {
      users,
      version: 1
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[UserStorage] Failed to write users:', error);
    throw new Error('Failed to save user data');
  }
}

/**
 * Get a user by email (with lazy migration for token fields)
 */
export function getUserByEmail(email: string): StoredUser | null {
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return null;
  }

  // Lazy migration: add token fields if they don't exist
  if (user.tokenBalance === undefined) {
    const migratedUser: StoredUser = {
      ...user,
      tokenBalance: 50000,
      tokenUsageTotal: 0,
      tokenUsageThisMonth: 0,
      lastTokenReset: Date.now(),
      isAdmin: false
    };
    updateUser(user.id, migratedUser);
    console.log('[UserStorage] Migrated user to token system:', user.id);
    return migratedUser;
  }

  return user;
}

/**
 * Get a user by ID (with lazy migration for token fields)
 */
export function getUserById(id: string): StoredUser | null {
  const users = readUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    return null;
  }

  // Lazy migration: add token fields if they don't exist
  if (user.tokenBalance === undefined) {
    const migratedUser: StoredUser = {
      ...user,
      tokenBalance: 50000,
      tokenUsageTotal: 0,
      tokenUsageThisMonth: 0,
      lastTokenReset: Date.now(),
      isAdmin: false
    };
    updateUser(user.id, migratedUser);
    console.log('[UserStorage] Migrated user to token system:', user.id);
    return migratedUser;
  }

  return user;
}

/**
 * Check if email is already registered
 */
export function emailExists(email: string): boolean {
  return getUserByEmail(email) !== null;
}

/**
 * Create a new user
 */
export function createUser(user: StoredUser): StoredUser {
  const users = readUsers();

  // Double-check email doesn't exist
  if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('Email already registered');
  }

  // Initialize token fields for new users
  const userWithTokens: StoredUser = {
    ...user,
    tokenBalance: 50000, // Default balance
    tokenUsageTotal: 0,
    tokenUsageThisMonth: 0,
    lastTokenReset: Date.now(),
    isAdmin: false
  };

  users.push(userWithTokens);
  writeUsers(users);

  console.log('[UserStorage] Created user:', { id: userWithTokens.id, email: userWithTokens.email, tokenBalance: userWithTokens.tokenBalance });
  return userWithTokens;
}

/**
 * Update an existing user
 */
export function updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
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
}

/**
 * Delete a user by ID
 */
export function deleteUser(id: string): boolean {
  const users = readUsers();
  const filteredUsers = users.filter(u => u.id !== id);

  if (filteredUsers.length === users.length) {
    return false; // User not found
  }

  writeUsers(filteredUsers);
  console.log('[UserStorage] Deleted user:', id);
  return true;
}

/**
 * Get total user count
 */
export function getUserCount(): number {
  return readUsers().length;
}
