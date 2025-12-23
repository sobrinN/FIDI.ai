/**
 * Application Constants
 * Centralized configuration for timeouts, limits, and UI settings
 */

// API Timeouts (in milliseconds)
export const TIMEOUTS = {
  STREAM: 120000,           // 120 seconds - Stream timeout for chat completions
  PREDICTION_POLL: 2000,    // 2 seconds - Polling interval for Replicate predictions
  PREDICTION_MAX: 60,       // 60 attempts - Maximum polling attempts (2 minutes total)
  ABORT_TIMEOUT: 60000,     // 60 seconds - Client-side abort timeout
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024,  // 10MB - Maximum file size
  MAX_SIZE_MB: 10,              // 10MB - For display purposes
} as const;

// Message Limits
export const MESSAGE_LIMITS = {
  MAX_MESSAGES_PER_CONVERSATION: 1000,  // Maximum messages allowed per conversation
  MAX_MESSAGE_LENGTH: 32000,             // 32KB - Maximum characters per message
} as const;

// UI Constants
export const UI = {
  SCROLL_NEAR_BOTTOM_THRESHOLD: 100,  // pixels from bottom to trigger auto-scroll
  TITLE_MAX_LENGTH: 30,                // Maximum characters for conversation title
  TYPING_DELAY: 50,                    // Delay for typing indicator (ms)
  ANIMATION_DURATION: 300,             // Default animation duration (ms)
} as const;

// Retry Configuration
export const RETRY = {
  MAX_ATTEMPTS: 3,                     // Maximum retry attempts
  INITIAL_DELAY: 1000,                 // Initial retry delay (ms)
  MAX_DELAY: 10000,                    // Maximum retry delay (ms)
  BACKOFF_MULTIPLIER: 2,               // Exponential backoff multiplier
} as const;

// View Types (type-safe)
export const VIEWS = ['landing', 'auth', 'chat'] as const;
export type ViewType = typeof VIEWS[number];
