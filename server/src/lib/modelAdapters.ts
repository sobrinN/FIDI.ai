/**
 * Model Adapters
 * Handles model-specific message formatting and system prompt injection
 */

/**
 * Multimodal content types for vision-enabled models
 */
interface TextContent {
  type: 'text';
  text: string;
}

interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

type MessageContent = string | Array<TextContent | ImageContent>;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
}

/**
 * Model-specific parameters (e.g., temperature, max_tokens)
 * Reserved for future use when model-specific parameter tuning is implemented
 */
interface _ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// Export to prevent unused warning (reserved for future use)
export type ModelParams = _ModelParams;

/**
 * Adapter function type
 */
type AdapterFunction = (systemPrompt: string, messages: Message[]) => Message[];

/**
 * Universal adapter - Prepends system prompt to first user message
 * OpenRouter expects NO system role - system prompt should be prepended to first user message
 * This matches the pattern shown in api-manipulator-skill documentation
 */
const prependSystemPromptAdapter: AdapterFunction = (systemPrompt, messages) => {
  // If no system prompt provided, return messages unchanged
  if (!systemPrompt || systemPrompt.trim() === '') {
    return messages;
  }

  const formattedMessages = [...messages];

  if (formattedMessages.length > 0 && formattedMessages[0].role === 'user') {
    const firstMessage = formattedMessages[0];

    // Handle string content
    if (typeof firstMessage.content === 'string') {
      formattedMessages[0] = {
        ...firstMessage,
        content: `${systemPrompt}\n\n${firstMessage.content}`
      };
    }
    // Handle multimodal content
    else if (Array.isArray(firstMessage.content)) {
      formattedMessages[0] = {
        ...firstMessage,
        content: [
          { type: 'text', text: systemPrompt },
          ...firstMessage.content
        ]
      };
    }
  }

  return formattedMessages;
};

/**
 * All adapters now use the same prepend pattern
 * This ensures consistent routing across all models on OpenRouter
 */
const grokAdapter: AdapterFunction = prependSystemPromptAdapter;
const geminiAdapter: AdapterFunction = prependSystemPromptAdapter;
const claudeAdapter: AdapterFunction = prependSystemPromptAdapter;
const openaiAdapter: AdapterFunction = prependSystemPromptAdapter;
const deepseekAdapter: AdapterFunction = prependSystemPromptAdapter;
const minimaxAdapter: AdapterFunction = prependSystemPromptAdapter;
const mistralAdapter: AdapterFunction = prependSystemPromptAdapter;
const qwenAdapter: AdapterFunction = prependSystemPromptAdapter;

/**
 * Model adapter registry
 * Maps model prefixes to their respective adapter functions
 */
const adapterRegistry: Record<string, AdapterFunction> = {
  // X.AI models
  'x-ai': grokAdapter,
  'x-ai/grok': grokAdapter,
  'x-ai/grok-code': grokAdapter, // Grok Code models also need the adapter

  // Google Gemini models
  'google': geminiAdapter,
  'google/gemini': geminiAdapter,
  'google/gemini-3-flash-preview': geminiAdapter, // Specific model variant

  // Anthropic models
  'anthropic': claudeAdapter,
  'anthropic/claude': claudeAdapter,
  'anthropic/claude-sonnet': claudeAdapter, // Specific model variant

  // OpenAI models
  'openai': openaiAdapter,
  'openai/gpt': openaiAdapter,
  'openai/gpt-oss': openaiAdapter, // Specific model variant

  // DeepSeek models
  'deepseek': deepseekAdapter,
  'deepseek/deepseek': deepseekAdapter, // Specific model variant
  'deepseek/deepseek-v3': deepseekAdapter, // Specific version variant

  // MiniMax models
  'minimax': minimaxAdapter,
  'minimax/minimax': minimaxAdapter, // Specific model variant
  'minimax/minimax-m': minimaxAdapter, // Specific version variant

  // Mistral models
  'mistralai': mistralAdapter,
  'mistralai/devstral': mistralAdapter, // Specific model variant

  // Qwen models
  'qwen': qwenAdapter,

  // Default fallback - use universal prepend adapter
  'default': prependSystemPromptAdapter
};

/**
 * Get the appropriate adapter function for a model
 * @param model - Model identifier (e.g., 'x-ai/grok-2', 'google/gemini-flash-1.5')
 * @returns Adapter function
 */
export const getModelAdapter = (model: string): AdapterFunction => {
  // Try exact match first
  if (adapterRegistry[model]) {
    return adapterRegistry[model];
  }

  // Try prefix match (e.g., 'x-ai/grok-2' matches 'x-ai')
  for (const prefix in adapterRegistry) {
    if (model.startsWith(prefix)) {
      return adapterRegistry[prefix];
    }
  }

  // Fallback to default adapter
  return adapterRegistry.default;
};

/**
 * Format messages for a specific model
 * Convenience function that gets the adapter and formats in one step
 */
export const formatMessagesForModel = (
  model: string,
  systemPrompt: string,
  messages: Message[]
): Message[] => {
  const adapter = getModelAdapter(model);
  return adapter(systemPrompt, messages);
};
