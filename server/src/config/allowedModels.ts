/**
 * Allowed AI Models Configuration with FREE/PAID Tier System
 *
 * SECURITY: Only models in this allowlist can be used via the API.
 * This prevents unauthorized usage of expensive models and protects against cost overruns.
 *
 * TIER SYSTEM:
 * - FREE: Unlimited usage, no token deduction (costMultiplier = 0)
 * - PAID: 1.5x token cost multiplier on actual API usage
 */

export enum ModelTier {
  FREE = 'FREE',
  PAID = 'PAID'
}

export interface ModelMetadata {
  id: string;
  displayName: string;
  description: string;
  tier: ModelTier;
  costMultiplier: number; // 0 for FREE, 1.5 for PAID
  provider: string;
  capabilities?: string[];
}

/**
 * FREE MODELS - Unlimited usage, no token deduction
 */
export const FREE_MODELS = [
  'mistralai/devstral-2512:free'
] as const;

/**
 * PAID MODELS - 1.5x token cost multiplier
 */
export const PAID_MODELS = [
  'google/gemini-3-flash-preview',
  'x-ai/grok-code-fast-1',
  'anthropic/claude-sonnet-4.5',
  'openai/gpt-oss-120b',
  'deepseek/deepseek-v3.2',
  'minimax/minimax-m2'
] as const;



/**
 * Combined allowed models array
 */
export const ALLOWED_MODELS = [
  ...FREE_MODELS,
  ...PAID_MODELS
] as const;

export type AllowedModel = typeof ALLOWED_MODELS[number];

/**
 * Model metadata mapping
 * Provides display information and cost multipliers for all models
 */
export const MODEL_METADATA: Record<string, ModelMetadata> = {
  // FREE MODELS
  'mistralai/devstral-2512:free': {
    id: 'mistralai/devstral-2512:free',
    displayName: 'Devstral 2512',
    description: 'Lightweight development model for rapid prototyping',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Mistral AI',
    capabilities: ['coding', 'development', 'prototyping']
  },

  // PAID MODELS
  'google/gemini-3-flash-preview': {
    id: 'google/gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash',
    description: 'Fast reasoning with token tracking - excellent for quick tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Google',
    capabilities: ['fast', 'reasoning', 'token-tracking']
  },
  'x-ai/grok-code-fast-1': {
    id: 'x-ai/grok-code-fast-1',
    displayName: 'Grok Code Fast 1',
    description: 'Code generation and debugging specialist',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'X.AI',
    capabilities: ['coding', 'debugging', 'fast']
  },
  'anthropic/claude-sonnet-4.5': {
    id: 'anthropic/claude-sonnet-4.5',
    displayName: 'Claude Sonnet 4.5',
    description: 'Complex reasoning + multi-modal image support',
    tier: ModelTier.PAID,
    costMultiplier: 2.0,
    provider: 'Anthropic',
    capabilities: ['reasoning', 'multimodal', 'images', 'analysis']
  },
  'openai/gpt-oss-120b': {
    id: 'openai/gpt-oss-120b',
    displayName: 'GPT OSS 120B',
    description: 'Large open-source model for deep reasoning',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'OpenAI',
    capabilities: ['reasoning', 'general', 'large-context']
  },
  'deepseek/deepseek-v3.2': {
    id: 'deepseek/deepseek-v3.2',
    displayName: 'DeepSeek V3.2',
    description: 'Advanced reasoning model for analytical tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'DeepSeek',
    capabilities: ['reasoning', 'analysis', 'research']
  },
  'minimax/minimax-m2': {
    id: 'minimax/minimax-m2',
    displayName: 'MiniMax M2',
    description: 'Efficient reasoning with speed and quality balance',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'MiniMax',
    capabilities: ['reasoning', 'efficient', 'balanced']
  }
};

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
 * Check if a model is a free tier model
 */
export function isFreeModel(model: string): boolean {
  return FREE_MODELS.includes(model as typeof FREE_MODELS[number]);
}

/**
 * Check if a model is a paid tier model
 */
export function isPaidModel(model: string): boolean {
  return PAID_MODELS.includes(model as typeof PAID_MODELS[number]);
}

/**
 * Get the tier of a model
 */
export function getModelTier(model: string): ModelTier | null {
  const metadata = MODEL_METADATA[model];
  return metadata?.tier ?? null;
}

/**
 * Get the cost multiplier for a model
 * Returns 0 for FREE, 1.5 for PAID, 1.0 for LEGACY
 */
export function getModelCostMultiplier(model: string): number {
  const metadata = MODEL_METADATA[model];
  return metadata?.costMultiplier ?? 1.0;
}

/**
 * Get full metadata for a model
 */
export function getModelMetadata(model: string): ModelMetadata | null {
  return MODEL_METADATA[model] ?? null;
}

/**
 * Get all models of a specific tier
 */
export function getModelsByTier(tier: ModelTier): string[] {
  return Object.values(MODEL_METADATA)
    .filter(metadata => metadata.tier === tier)
    .map(metadata => metadata.id);
}

/**
 * Get a formatted list of allowed models for error messages
 */
export function getAllowedModelsString(): string {
  return ALLOWED_MODELS.join(', ');
}
