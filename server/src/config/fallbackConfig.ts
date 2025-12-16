/**
 * Model Fallback Configuration
 * Defines fallback chains for each model when primary model fails
 * Strategy: Try same-tier models first, then fallback to free tier
 */


export const MAX_FALLBACK_ATTEMPTS = 3;

/**
 * Model fallback chains
 * Each model has a prioritized list of alternatives
 */
export const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
    // FREE MODELS - Fallback to other free coding models
    'mistralai/devstral-2512:free': [
        'kwaipilot/kat-coder-pro:free',
        'qwen/qwen3-coder:free'
    ],
    'kwaipilot/kat-coder-pro:free': [
        'mistralai/devstral-2512:free',
        'qwen/qwen3-coder:free'
    ],
    'openai/gpt-oss-120b:free': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'qwen/qwen3-coder:free': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],

    // PAID MODELS - Try other paid models first, then free tier
    'openai/gpt-5.2': [
        'anthropic/claude-sonnet-4.5',
        'google/gemini-3-pro-preview',
        'mistralai/devstral-2512:free'
    ],
    'anthropic/claude-sonnet-4.5': [
        'anthropic/claude-opus-4.5',
        'openai/gpt-5.2',
        'mistralai/devstral-2512:free'
    ],
    'anthropic/claude-opus-4.5': [
        'anthropic/claude-sonnet-4.5',
        'google/gemini-3-pro-preview',
        'mistralai/devstral-2512:free'
    ],
    'google/gemini-3-pro-preview': [
        'anthropic/claude-sonnet-4.5',
        'openai/gpt-5.2',
        'mistralai/devstral-2512:free'
    ],
    'minimax/minimax-m2': [
        'anthropic/claude-sonnet-4.5',
        'google/gemini-3-pro-preview',
        'mistralai/devstral-2512:free'
    ],
    'x-ai/glm-4.6': [
        'anthropic/claude-sonnet-4.5',
        'openai/gpt-5.2',
        'mistralai/devstral-2512:free'
    ],

    // LEGACY MODELS - Fallback to free tier
    'google/gemini-flash-1.5': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'google/gemini-pro-1.5': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'anthropic/claude-3.5-sonnet': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'anthropic/claude-3-opus': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'x-ai/grok-4.1-fast:free': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'x-ai/grok-beta': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'openai/gpt-4-turbo': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ],
    'openai/gpt-3.5-turbo': [
        'mistralai/devstral-2512:free',
        'kwaipilot/kat-coder-pro:free'
    ]
};

/**
 * Get fallback chain for a model
 * @param modelId - Primary model ID
 * @returns Array of fallback model IDs (max 3)
 */
export function getFallbackChain(modelId: string): string[] {
    const chain = MODEL_FALLBACK_CHAINS[modelId] || [];

    // Limit to MAX_FALLBACK_ATTEMPTS
    return chain.slice(0, MAX_FALLBACK_ATTEMPTS);
}

/**
 * Get all models to attempt (primary + fallbacks)
 * @param modelId - Primary model ID
 * @returns Array with primary model first, then fallbacks
 */
export function getModelsToAttempt(modelId: string): string[] {
    return [modelId, ...getFallbackChain(modelId)];
}

/**
 * Check if a model has fallback options
 */
export function hasFallbackOptions(modelId: string): boolean {
    const chain = getFallbackChain(modelId);
    return chain.length > 0;
}
