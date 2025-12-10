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
 */
interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Adapter function type
 */
type AdapterFunction = (systemPrompt: string, messages: Message[]) => Message[];

/**
 * Default adapter - Uses standard system role
 */
const defaultAdapter: AdapterFunction = (systemPrompt, messages) => [
  { role: 'system', content: systemPrompt },
  ...messages
];

/**
 * X.AI Grok adapter - Prepends system prompt to first user message
 * Grok models don't properly support the 'system' role
 */
const grokAdapter: AdapterFunction = (systemPrompt, messages) => {
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
 * Anthropic Claude adapter - Uses standard system role
 * Claude models support system role natively
 */
const claudeAdapter: AdapterFunction = defaultAdapter;

/**
 * OpenAI adapter - Uses standard system role
 */
const openaiAdapter: AdapterFunction = defaultAdapter;

/**
 * Model adapter registry
 * Maps model prefixes to their respective adapter functions
 */
const adapterRegistry: Record<string, AdapterFunction> = {
  // X.AI models
  'x-ai': grokAdapter,
  'x-ai/grok': grokAdapter,

  // Anthropic models
  'anthropic': claudeAdapter,
  'anthropic/claude': claudeAdapter,

  // OpenAI models
  'openai': openaiAdapter,
  'openai/gpt': openaiAdapter,

  // Default fallback
  'default': defaultAdapter
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
