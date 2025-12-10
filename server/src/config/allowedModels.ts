/**
 * Allowed AI Models Configuration
 *
 * SECURITY: Only models in this allowlist can be used via the API.
 * This prevents unauthorized usage of expensive models and protects against cost overruns.
 */

export const ALLOWED_MODELS = [
  // Google Models
  'google/gemini-flash-1.5',
  'google/gemini-pro-1.5',

  // Anthropic Claude Models
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-opus',

  // X.AI Grok Models (Free tier)
  'x-ai/grok-4.1-fast:free',
  'x-ai/grok-beta',

  // OpenAI Models (if needed)
  'openai/gpt-4-turbo',
  'openai/gpt-3.5-turbo',
] as const;

export type AllowedModel = typeof ALLOWED_MODELS[number];

/**
 * Type guard to check if a model string is in the allowlist
 */
export function isAllowedModel(model: unknown): model is AllowedModel {
  if (typeof model !== 'string') {
    return false;
  }
  return ALLOWED_MODELS.includes(model as AllowedModel);
}

/**
 * Get a formatted list of allowed models for error messages
 */
export function getAllowedModelsString(): string {
  return ALLOWED_MODELS.join(', ');
}
