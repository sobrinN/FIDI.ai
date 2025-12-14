/**
 * Frontend Model Configuration
 * Provides display metadata and cost information for model selector
 */

export enum ModelTier {
  FREE = 'FREE',
  PAID = 'PAID',
  LEGACY = 'LEGACY'
}

export interface ModelInfo {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly tier: ModelTier;
  readonly costMultiplier: number;
  readonly provider: string;
  readonly badge: string;
  readonly badgeColor: string;
  readonly icon: string;
}

/**
 * FREE MODELS - Unlimited usage, no token deduction
 */
export const FREE_MODELS: readonly ModelInfo[] = [
  {
    id: 'mistralai/devstral-2512:free',
    displayName: 'Devstral 2512',
    description: 'Fast coding assistant optimized for development tasks',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Mistral AI',
    badge: 'FREE',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/30',
    icon: '⚡'
  },
  {
    id: 'kwaipilot/kat-coder-pro:free',
    displayName: 'KAT Coder Pro',
    description: 'Professional coding assistant with advanced context understanding',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Kwaipilot',
    badge: 'FREE',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/30',
    icon: '🚀'
  },
  {
    id: 'openai/gpt-oss-120b:free',
    displayName: 'GPT OSS 120B',
    description: 'Open-source optimized GPT model for general tasks',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'OpenAI',
    badge: 'FREE',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/30',
    icon: '🌟'
  },
  {
    id: 'qwen/qwen3-coder:free',
    displayName: 'Qwen3 Coder',
    description: 'Multilingual coding assistant with strong reasoning',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Qwen',
    badge: 'FREE',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/30',
    icon: '🔮'
  }
] as const;

/**
 * PAID MODELS - 1.5x token cost multiplier
 */
export const PAID_MODELS: readonly ModelInfo[] = [
  {
    id: 'openai/gpt-5.2',
    displayName: 'GPT-5.2',
    description: 'Latest GPT model with enhanced reasoning and creativity',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'OpenAI',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: '⭐'
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    displayName: 'Claude Sonnet 4.5',
    description: 'Balanced performance and intelligence for complex tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Anthropic',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: '🎭'
  },
  {
    id: 'anthropic/claude-opus-4.5',
    displayName: 'Claude Opus 4.5',
    description: 'Most capable Claude model for demanding tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Anthropic',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: '👑'
  },
  {
    id: 'google/gemini-3-pro-preview',
    displayName: 'Gemini 3 Pro',
    description: 'Next-generation multimodal AI with advanced capabilities',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Google',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: '💎'
  },
  {
    id: 'minimax/minimax-m2',
    displayName: 'MiniMax M2',
    description: 'Efficient model with strong performance on complex tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'MiniMax',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: '🔥'
  },
  {
    id: 'x-ai/glm-4.6',
    displayName: 'GLM 4.6',
    description: 'Advanced language model with strong reasoning capabilities',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'X.AI',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: '🧠'
  }
] as const;

/**
 * All user-selectable models (FREE + PAID)
 */
export const ALL_SELECTABLE_MODELS: readonly ModelInfo[] = [
  ...FREE_MODELS,
  ...PAID_MODELS
] as const;

/**
 * Model info lookup map for O(1) access
 */
const MODEL_INFO_MAP = new Map<string, ModelInfo>(
  ALL_SELECTABLE_MODELS.map(model => [model.id, model])
);

/**
 * Get model information by ID
 */
export function getModelInfo(modelId: string | null): ModelInfo | null {
  if (!modelId) return null;
  return MODEL_INFO_MAP.get(modelId) ?? null;
}

/**
 * Check if a model is in the free tier
 */
export function isFreeModel(modelId: string): boolean {
  return FREE_MODELS.some(model => model.id === modelId);
}

/**
 * Check if a model is in the paid tier
 */
export function isPaidModel(modelId: string): boolean {
  return PAID_MODELS.some(model => model.id === modelId);
}

/**
 * Get the tier of a model
 */
export function getModelTier(modelId: string): ModelTier | null {
  const info = getModelInfo(modelId);
  return info?.tier ?? null;
}

/**
 * Get the cost multiplier for a model
 */
export function getModelCostMultiplier(modelId: string): number {
  const info = getModelInfo(modelId);
  return info?.costMultiplier ?? 1.0;
}

/**
 * Get formatted cost description
 */
export function getModelCostDescription(modelId: string): string {
  const info = getModelInfo(modelId);
  if (!info) return 'Standard cost';

  if (info.costMultiplier === 0) {
    return 'Unlimited usage - no token cost';
  }

  if (info.costMultiplier === 1.5) {
    return '1.5x token cost multiplier';
  }

  return 'Standard cost';
}
