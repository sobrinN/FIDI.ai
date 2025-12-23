/**
 * Error Classification System
 * Classifies OpenRouter errors into user-friendly categories
 */

export enum ErrorType {
    RATE_LIMIT = 'RATE_LIMIT',
    DATA_POLICY = 'DATA_POLICY',
    UNAVAILABLE = 'UNAVAILABLE',
    MISCONFIGURED = 'MISCONFIGURED',
    TIMEOUT = 'TIMEOUT',
    NETWORK = 'NETWORK',
    INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
    EXTERNAL_BILLING = 'EXTERNAL_BILLING', // OpenRouter/external API billing issues
    UNKNOWN = 'UNKNOWN'
}

export interface ClassifiedError {
    type: ErrorType;
    statusCode: number;
    originalMessage: string;
    userFriendlyMessage: string;
    retryable: boolean;
    technicalDetails?: string;
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
    [ErrorType.RATE_LIMIT]:
        'This model is currently rate limited due to high demand. We\'re automatically trying alternative models.',
    [ErrorType.DATA_POLICY]:
        'Your request may violate the model\'s content policy. Please try rephrasing your message or use a different model.',
    [ErrorType.UNAVAILABLE]:
        'This model is temporarily unavailable. We\'re attempting to connect you with an alternative model.',
    [ErrorType.MISCONFIGURED]:
        'Server configuration issue detected. Please verify your API keys are correctly set in server/.env',
    [ErrorType.TIMEOUT]:
        'The request timed out. The model may be overloaded. We\'ll try an alternative.',
    [ErrorType.NETWORK]:
        'Network connection error. Please check your internet connection and try again.',
    [ErrorType.INSUFFICIENT_TOKENS]:
        'Insufficient tokens to complete this request. Your balance will reset at the start of next month.',
    [ErrorType.EXTERNAL_BILLING]:
        'The AI service (OpenRouter) has a billing issue. Please contact the administrator to add credits to the OpenRouter account.',
    [ErrorType.UNKNOWN]:
        'An unexpected error occurred. We\'re attempting to use alternative models.'
};

/**
 * Classify an error from OpenRouter or internal sources
 */
export function classifyError(error: unknown): ClassifiedError {
    const err = error as Record<string, unknown>;
    const statusCode = (err?.statusCode as number) || (err?.status as number) || 500;
    const message = (err?.message as string) || String(error);
    const errorName = (err?.name as string) || '';

    // Check for specific error patterns

    // 429 - Rate Limiting
    if (statusCode === 429 || message.toLowerCase().includes('rate limit')) {
        return {
            type: ErrorType.RATE_LIMIT,
            statusCode: 429,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.RATE_LIMIT],
            retryable: true,
            technicalDetails: 'OpenRouter rate limit exceeded for this model'
        };
    }

    // 404 - Model not found or Data Policy violation
    if (statusCode === 404) {
        // Check if it's specifically a data policy issue
        if (message.toLowerCase().includes('policy') ||
            message.toLowerCase().includes('content') ||
            message.toLowerCase().includes('moderation')) {
            return {
                type: ErrorType.DATA_POLICY,
                statusCode: 404,
                originalMessage: message,
                userFriendlyMessage: ERROR_MESSAGES[ErrorType.DATA_POLICY],
                retryable: false,
                technicalDetails: 'Content may violate model provider policy'
            };
        }

        return {
            type: ErrorType.UNAVAILABLE,
            statusCode: 404,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.UNAVAILABLE],
            retryable: true,
            technicalDetails: 'Model not found or temporarily disabled'
        };
    }

    // 401/403 - Authentication/Authorization
    if (statusCode === 401 || statusCode === 403 ||
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('forbidden') ||
        message.toLowerCase().includes('api key')) {
        return {
            type: ErrorType.MISCONFIGURED,
            statusCode: statusCode,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.MISCONFIGURED],
            retryable: false,
            technicalDetails: 'API authentication failed. Check OPENROUTER_API_KEY in server/.env'
        };
    }

    // 408 - Timeout
    if (statusCode === 408 || errorName === 'AbortError' ||
        message.toLowerCase().includes('timeout')) {
        return {
            type: ErrorType.TIMEOUT,
            statusCode: 408,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.TIMEOUT],
            retryable: true,
            technicalDetails: 'Request exceeded time limit (120 seconds)'
        };
    }

    // 402 - Distinguish between app's internal credits and OpenRouter billing
    if (statusCode === 402) {
        // Check if this is an OpenRouter billing error (external) vs our app's credit system (internal)
        const isOpenRouterError = message.toLowerCase().includes('openrouter') ||
            message.toLowerCase().includes('credit') ||
            message.toLowerCase().includes('billing') ||
            message.toLowerCase().includes('payment') ||
            // OpenRouter errors typically don't have our specific Portuguese message
            !message.includes('Créditos insuficientes');

        if (isOpenRouterError) {
            return {
                type: ErrorType.EXTERNAL_BILLING,
                statusCode: 402,
                originalMessage: message,
                userFriendlyMessage: ERROR_MESSAGES[ErrorType.EXTERNAL_BILLING],
                retryable: false,
                technicalDetails: 'OpenRouter account has insufficient credits. Add credits at openrouter.ai'
            };
        }

        // Our app's internal credit system
        return {
            type: ErrorType.INSUFFICIENT_TOKENS,
            statusCode: 402,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.INSUFFICIENT_TOKENS],
            retryable: false,
            technicalDetails: 'User token balance too low'
        };
    }

    // Also check for "insufficient tokens" text in non-402 errors (legacy support)
    if (message.toLowerCase().includes('insufficient tokens')) {
        return {
            type: ErrorType.INSUFFICIENT_TOKENS,
            statusCode: 402,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.INSUFFICIENT_TOKENS],
            retryable: false,
            technicalDetails: 'User token balance too low'
        };
    }

    // 500/503 - Server errors (model unavailable)
    if (statusCode >= 500 || message.toLowerCase().includes('internal server')) {
        return {
            type: ErrorType.UNAVAILABLE,
            statusCode: statusCode,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.UNAVAILABLE],
            retryable: true,
            technicalDetails: 'Model provider internal error'
        };
    }

    // Network errors
    if (errorName === 'NetworkError' ||
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('connection') ||
        message.toLowerCase().includes('econnrefused')) {
        return {
            type: ErrorType.NETWORK,
            statusCode: 0,
            originalMessage: message,
            userFriendlyMessage: ERROR_MESSAGES[ErrorType.NETWORK],
            retryable: true,
            technicalDetails: 'Network connectivity issue'
        };
    }

    // Unknown error
    return {
        type: ErrorType.UNKNOWN,
        statusCode: statusCode,
        originalMessage: message,
        userFriendlyMessage: ERROR_MESSAGES[ErrorType.UNKNOWN],
        retryable: true,
        technicalDetails: message
    };
}

/**
 * Determine if an error should trigger fallback
 */
export function shouldTriggerFallback(classified: ClassifiedError): boolean {
    // These error types should trigger fallback to alternative models
    const fallbackTriggers = [
        ErrorType.RATE_LIMIT,
        ErrorType.UNAVAILABLE,
        ErrorType.TIMEOUT,
        ErrorType.UNKNOWN
    ];

    return fallbackTriggers.includes(classified.type) && classified.retryable;
}

/**
 * Determine if an error is terminal (should not retry any model)
 */
export function isTerminalError(classified: ClassifiedError): boolean {
    const terminalTypes = [
        ErrorType.MISCONFIGURED,
        ErrorType.DATA_POLICY,
        ErrorType.INSUFFICIENT_TOKENS
    ];

    return terminalTypes.includes(classified.type);
}
