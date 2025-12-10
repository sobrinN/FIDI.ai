/**
 * Migration utilities for User ID type change (number -> string)
 * Handles existing localStorage data gracefully
 */

import { User } from '../types';

// Type for legacy user data during migration
interface LegacyUser {
  id: number | string;
  name: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Detect if user has legacy numeric ID
 */
export const hasLegacyUserId = (user: User): boolean => {
  // Check if ID looks like a number string (all digits)
  return /^\d+$/.test(user.id);
};

/**
 * Migrate legacy numeric user ID to new string format
 */
export const migrateLegacyUser = (legacyUser: LegacyUser): User => {
  const numericId = typeof legacyUser.id === 'number'
    ? legacyUser.id
    : parseInt(String(legacyUser.id), 10);

  return {
    id: `user-migrated-${numericId}-${Math.random().toString(36).substring(2, 11)}`,
    name: legacyUser.name,
    email: legacyUser.email
  };
};

/**
 * Migrate all users in localStorage
 */
export const migrateAllUsers = (): void => {
  try {
    const usersJson = localStorage.getItem('fidi_users');
    if (!usersJson) return;

    const users: LegacyUser[] = JSON.parse(usersJson);
    let migrated = false;

    const updatedUsers = users.map((user: LegacyUser) => {
      if (typeof user.id === 'number' || /^\d+$/.test(String(user.id))) {
        migrated = true;
        return migrateLegacyUser(user);
      }
      return user;
    });

    if (migrated) {
      localStorage.setItem('fidi_users', JSON.stringify(updatedUsers));
      console.log('[Migration] Migrated legacy users to new ID format');
    }
  } catch (error) {
    console.error('[Migration] Failed to migrate users:', error);
  }
};

/**
 * Migrate conversation localStorage keys for a user
 */
export const migrateConversationKeys = (oldId: string | number, newId: string): void => {
  try {
    const oldKey = `fidi_conversations_${oldId}`;
    const newKey = `fidi_conversations_${newId}`;

    const conversations = localStorage.getItem(oldKey);
    if (conversations) {
      localStorage.setItem(newKey, conversations);
      localStorage.removeItem(oldKey);
      console.log(`[Migration] Migrated conversations: ${oldKey} -> ${newKey}`);
    }
  } catch (error) {
    console.error('[Migration] Failed to migrate conversation keys:', error);
  }
};

/**
 * Run all migrations on app startup
 */
export const runMigrations = (): void => {
  console.log('[Migration] Running database migrations...');
  migrateAllUsers();
  console.log('[Migration] Migrations complete');
};
