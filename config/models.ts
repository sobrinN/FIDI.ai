/**
 * Frontend Model Configuration
 * Provides display metadata and cost information for model selector
 */

export enum ModelTier {
  FREE = 'FREE',
  PAID = 'PAID'
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
    description: 'Lightweight development model for rapid prototyping',
    tier: ModelTier.FREE,
    costMultiplier: 0,
    provider: 'Mistral AI',
    badge: 'FREE',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/30',
    icon: 'token-mistral'
  }
] as const;

/**
 * PAID MODELS - 1.5x token cost multiplier
 */
export const PAID_MODELS: readonly ModelInfo[] = [
  {
    id: 'google/gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash',
    description: 'Fast reasoning with token tracking - excellent for quick tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'Google',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: 'token-google'
  },
  {
    id: 'x-ai/grok-code-fast-1',
    displayName: 'Grok Code Fast 1',
    description: 'Code generation and debugging specialist',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'X.AI',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: 'token-x'
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    displayName: 'Claude Sonnet 4.5',
    description: 'Complex reasoning + multi-modal image support',
    tier: ModelTier.PAID,
    costMultiplier: 2.0,
    provider: 'Anthropic',
    badge: '2.0x COST',
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    icon: 'token-anthropic'
  },
  {
    id: 'openai/gpt-oss-120b',
    displayName: 'GPT OSS 120B',
    description: 'Large open-source model for deep reasoning',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'OpenAI',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: 'token-openai'
  },
  {
    id: 'deepseek/deepseek-v3.2',
    displayName: 'DeepSeek V3.2',
    description: 'Advanced reasoning model for analytical tasks',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'DeepSeek',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: 'token-deepseek'
  },
  {
    id: 'minimax/minimax-m2',
    displayName: 'MiniMax M2',
    description: 'Efficient reasoning with speed and quality balance',
    tier: ModelTier.PAID,
    costMultiplier: 1.5,
    provider: 'MiniMax',
    badge: '1.5x COST',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: 'token-minimax'
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

  if (info.costMultiplier > 1.0) {
    return `${info.costMultiplier}x token cost multiplier`;
  }

  return 'Standard cost';
}
