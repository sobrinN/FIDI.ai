/**
 * Allowed AI Models Configuration with FREE/PAID Tier System
 *
 * SECURITY: Only models in this allowlist can be used via the API.
 * This prevents unauthorized usage of expensive models and protects against cost overruns.
 *
 * TIER SYSTEM:
 * - FREE: Unlimited usage, no token deduction (costMultiplier = 0)
 * - PAID: 1.5x token cost multiplier on actual API usage
 * - LEGACY: Existing agent models with 1.0x multiplier
 */

export enum ModelTier {
  FREE = 'FREE',
  PAID = 'PAID',
  LEGACY = 'LEGACY'
}

export interface ModelMetadata {
  id: string;
  displayName: string;
  description: string;
  tier: ModelTier;
  costMultiplier: number; // 0 for FREE, 1.5 for PAID, 1.0 for LEGACY
  provider: string;
  capabilities?: string[];
}

/**
 * FREE MODELS - Unlimited usage, no token deduction
 */
export const FREE_MODELS = [
  'mistralai/devstral-2512:free',
  'kwaipilot/kat-coder-pro:free',
  'openai/gpt-oss-120b:free',
  'qwen/qwen3-coder:free'
] as const;

/**
 * PAID MODELS - 1.5x token cost multiplier
 */
export const PAID_MODELS = [
  'openai/gpt-5.2',
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-opus-4.5',
  'google/gemini-3-pro-preview',
  'minimax/minimax-m2',
  'x-ai/glm-4.6'
] as const;

/**
 * LEGACY MODELS - Existing agent models with 1.0x multiplier
 * Kept for backward compatibility with existing conversations
 */
export const LEGACY_MODELS = [
  // Google Models
  'google/gemini-flash-1.5',
  'google/gemini-pro-1.5',

  // Anthropic Claude Models
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-opus',

  // X.AI Grok Models (Free tier)
  'x-ai/grok-4.1-fast:free',
  'x-ai/grok-beta',

  // OpenAI Models
  'openai/gpt-4-turbo',
  'openai/gpt-3.5-turbo',
] as const;

/**
 * Combined allowed models array
 */
export const ALLOWED_MODELS = [
  ...FREE_MODELS,
  ...PAID_MODELS,
  ...LEGACY_MODELS
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
    description: 'Fast coding assistant optimized for development tasks',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Mistral AI',
    capabilities: ['coding', 'debugging', 'refactoring']
  },
  'kwaipilot/kat-coder-pro:free': {
    id: 'kwaipilot/kat-coder-pro:free',
    displayName: 'KAT Coder Pro',
    description: 'Professional coding assistant with advanced context understanding',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Kwaipilot',
    capabilities: ['coding', 'architecture', 'testing']
  },
  'openai/gpt-oss-120b:free': {
    id: 'openai/gpt-oss-120b:free',
    displayName: 'GPT OSS 120B',
    description: 'Open-source optimized GPT model for general tasks',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'OpenAI',
    capabilities: ['general', 'coding', 'writing']
  },
  'qwen/qwen3-coder:free': {
    id: 'qwen/qwen3-coder:free',
    displayName: 'Qwen3 Coder',
    description: 'Multilingual coding assistant with strong reasoning',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Qwen',
    capabilities: ['coding', 'multilingual', 'reasoning']
  },

  // PAID MODELS
  'openai/gpt-5.2': {
    id: 'openai/gpt-5.2',
    displayName: 'GPT-5.2',
    description: 'Latest GPT model with enhanced reasoning and creativity',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'OpenAI',
    capabilities: ['general', 'reasoning', 'creative', 'coding']
  },
  'anthropic/claude-sonnet-4.5': {
    id: 'anthropic/claude-sonnet-4.5',
    displayName: 'Claude Sonnet 4.5',
    description: 'Balanced performance and intelligence for complex tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Anthropic',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing']
  },
  'anthropic/claude-opus-4.5': {
    id: 'anthropic/claude-opus-4.5',
    displayName: 'Claude Opus 4.5',
    description: 'Most capable Claude model for demanding tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Anthropic',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative']
  },
  'google/gemini-3-pro-preview': {
    id: 'google/gemini-3-pro-preview',
    displayName: 'Gemini 3 Pro',
    description: 'Next-generation multimodal AI with advanced capabilities',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Google',
    capabilities: ['multimodal', 'reasoning', 'coding', 'analysis']
  },
  'minimax/minimax-m2': {
    id: 'minimax/minimax-m2',
    displayName: 'MiniMax M2',
    description: 'Efficient model with strong performance on complex tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'MiniMax',
    capabilities: ['reasoning', 'coding', 'general']
  },
  'x-ai/glm-4.6': {
    id: 'x-ai/glm-4.6',
    displayName: 'GLM 4.6',
    description: 'Advanced language model with strong reasoning capabilities',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'X.AI',
    capabilities: ['reasoning', 'coding', 'analysis']
  },

  // LEGACY MODELS
  'google/gemini-flash-1.5': {
    id: 'google/gemini-flash-1.5',
    displayName: 'Gemini Flash 1.5',
    description: 'Fast multimodal model for quick responses',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'Google',
    capabilities: ['multimodal', 'fast']
  },
  'google/gemini-pro-1.5': {
    id: 'google/gemini-pro-1.5',
    displayName: 'Gemini Pro 1.5',
    description: 'Balanced multimodal model',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'Google',
    capabilities: ['multimodal', 'balanced']
  },
  'anthropic/claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    description: 'Previous generation Claude model',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'Anthropic',
    capabilities: ['reasoning', 'coding']
  },
  'anthropic/claude-3-opus': {
    id: 'anthropic/claude-3-opus',
    displayName: 'Claude 3 Opus',
    description: 'Previous generation flagship Claude model',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'Anthropic',
    capabilities: ['reasoning', 'coding', 'creative']
  },
  'x-ai/grok-4.1-fast:free': {
    id: 'x-ai/grok-4.1-fast:free',
    displayName: 'Grok 4.1 Fast',
    description: 'Fast and efficient Grok model',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'X.AI',
    capabilities: ['fast', 'general']
  },
  'x-ai/grok-beta': {
    id: 'x-ai/grok-beta',
    displayName: 'Grok Beta',
    description: 'Beta version of Grok',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'X.AI',
    capabilities: ['general', 'experimental']
  },
  'openai/gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    description: 'Fast GPT-4 variant',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'OpenAI',
    capabilities: ['reasoning', 'coding', 'general']
  },
  'openai/gpt-3.5-turbo': {
    id: 'openai/gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    description: 'Efficient GPT-3.5 model',
    tier: ModelTier.LEGACY,
    costMultiplier: 1.0,
    provider: 'OpenAI',
    capabilities: ['general', 'fast']
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
