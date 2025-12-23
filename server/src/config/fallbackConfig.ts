/**
 * Model Fallback Configuration
 * Defines fallback chains for each model when primary model fails
 * Strategy: Try same-tier models first, then fallback to free tier
 * 
 * UPDATED: 2025-12-19 to match current allowed models
 */


export const MAX_FALLBACK_ATTEMPTS = 3;

/**
 * Model fallback chains
 * Each model has a prioritized list of alternatives
 */
export const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
    // FREE MODELS - Only one free model available, no fallbacks
    'mistralai/devstral-2512:free': [],

    // PAID MODELS - Try other paid models first, then free tier
    'google/gemini-3-flash-preview': [
        'x-ai/grok-code-fast-1',
        'anthropic/claude-sonnet-4.5',
        'mistralai/devstral-2512:free'
    ],
    'x-ai/grok-code-fast-1': [
        'google/gemini-3-flash-preview',
        'deepseek/deepseek-v3.2',
        'mistralai/devstral-2512:free'
    ],
    'anthropic/claude-sonnet-4.5': [
        'google/gemini-3-flash-preview',
        'deepseek/deepseek-v3.2',
        'mistralai/devstral-2512:free'
    ],
    'openai/gpt-oss-120b': [
        'deepseek/deepseek-v3.2',
        'google/gemini-3-flash-preview',
        'mistralai/devstral-2512:free'
    ],
    'deepseek/deepseek-v3.2': [
        'openai/gpt-oss-120b',
        'google/gemini-3-flash-preview',
        'mistralai/devstral-2512:free'
    ],
    'minimax/minimax-m2': [
        'google/gemini-3-flash-preview',
        'deepseek/deepseek-v3.2',
        'mistralai/devstral-2512:free'
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
