/**
 * Type-safe localStorage utilities with error handling
 * Prevents quota exceeded errors and provides consistent error handling
 */

import { User, Conversation } from '../types';

export class StorageError extends Error {
  constructor(message: string, public code: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'NOT_FOUND') {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Safely get an item from localStorage with type checking
 */
export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage item: ${key}`, error);
    throw new StorageError(`Failed to parse stored data for key: ${key}`, 'PARSE_ERROR');
  }
}

/**
 * Safely set an item in localStorage with quota handling
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);

    // Check approximate size (rough estimate: 2 bytes per char)
    const sizeInBytes = serialized.length * 2;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    // Warn if data is large (>2MB)
    if (sizeInMB > 2) {
      console.warn(`Large localStorage write: ${key} is approximately ${sizeInMB.toFixed(2)}MB`);
    }

    localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError('Storage quota exceeded. Please clear some data.', 'QUOTA_EXCEEDED');
    }
    throw error;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeStorageItem(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Clear all localStorage items (use with caution)
 */
export function clearStorage(): void {
  localStorage.clear();
}

/**
 * Runtime type guard for User
 */
function isValidUser(data: unknown): data is User {
  if (!data || typeof data !== 'object') return false;

  const user = data as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string'
  );
}

/**
 * Runtime type guard for Conversation
 */
function isValidConversation(data: unknown): data is Conversation {
  if (!data || typeof data !== 'object') return false;

  const conv = data as Record<string, unknown>;
  return (
    typeof conv.id === 'string' &&
    typeof conv.agentId === 'string' &&
    typeof conv.title === 'string' &&
    Array.isArray(conv.messages) &&
    typeof conv.createdAt === 'number' &&
    typeof conv.lastModified === 'number'
  );
}

/**
 * Get user session from localStorage with runtime validation
 */
export function getUserSession(): User | null {
  const data = getStorageItem<User>('fidi_session');

  if (!data) return null;

  if (!isValidUser(data)) {
    console.warn('[Storage] Invalid user session data, clearing corrupted session');
    clearUserSession();
    throw new StorageError('Invalid user session data structure', 'PARSE_ERROR');
  }

  return data;
}

/**
 * Save user session to localStorage
 */
export function setUserSession(user: User): void {
  setStorageItem('fidi_session', user);
}

/**
 * Remove user session from localStorage
 */
export function clearUserSession(): void {
  removeStorageItem('fidi_session');
}

/**
 * Get conversations for a specific user with runtime validation
 */
export function getUserConversations(userId: string): Conversation[] {
  const key = `fidi_conversations_${userId}`;
  const data = getStorageItem<Conversation[]>(key);

  if (!data) return [];

  if (!Array.isArray(data)) {
    console.warn('[Storage] Invalid conversations data (not an array), clearing');
    removeStorageItem(key);
    return [];
  }

  // Filter out invalid conversations and keep only valid ones
  const validConversations = data.filter(conv => {
    const valid = isValidConversation(conv);
    if (!valid) {
      console.warn('[Storage] Skipping invalid conversation', conv);
    }
    return valid;
  });

  // If we had to filter out invalid data, save the cleaned version
  if (validConversations.length !== data.length) {
    console.log('[Storage] Cleaned up invalid conversations');
    setStorageItem(key, validConversations);
  }

  return validConversations;
}

/**
 * Save conversations for a specific user
 */
export function setUserConversations(userId: string, conversations: Conversation[]): void {
  const key = `fidi_conversations_${userId}`;
  setStorageItem(key, conversations);
}

/**
 * Get available storage quota information
 */
export async function getStorageQuota(): Promise<{usage: number; quota: number} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    } catch (error) {
      console.error('Failed to get storage quota', error);
      return null;
    }
  }
  return null;
}
