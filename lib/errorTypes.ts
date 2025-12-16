/**
 * Shared Error Type Definitions
 * Used by both frontend and backend for consistent error handling
 */

export enum ErrorType {
    RATE_LIMIT = 'RATE_LIMIT',
    DATA_POLICY = 'DATA_POLICY',
    UNAVAILABLE = 'UNAVAILABLE',
    MISCONFIGURED = 'MISCONFIGURED',
    TIMEOUT = 'TIMEOUT',
    NETWORK = 'NETWORK',
    INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
    UNKNOWN = 'UNKNOWN'
}

export interface EnhancedError {
    errorType: ErrorType;
    userMessage: string;
    technicalMessage?: string;
    attemptedModels?: string[];
    fallbackUsed?: boolean;
    retryable: boolean;
}

export interface FallbackInfo {
    used: boolean;
    primaryModel: string;
    actualModel: string;
    message: string;
}
