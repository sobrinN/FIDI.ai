/// <reference types="vite/client" />

/**
 * Type definitions for environment variables
 * Ensures type safety when accessing import.meta.env
 */

interface ImportMetaEnv {
  /**
   * Backend API URL
   * Default: http://localhost:3001
   */
  readonly VITE_API_URL?: string;

  /**
   * Application environment
   * Default: development
   */
  readonly MODE: string;

  /**
   * Base URL for the application
   */
  readonly BASE_URL: string;

  /**
   * Whether the app is in production mode
   */
  readonly PROD: boolean;

  /**
   * Whether the app is in development mode
   */
  readonly DEV: boolean;

  /**
   * Whether the app is in SSR mode
   */
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
