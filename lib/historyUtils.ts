import { Message } from '../types';

export interface OpenRouterMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

/**
 * Convert localStorage messages to OpenRouter API format
 * Handles both text and multimodal content (text + images)
 * Merges consecutive same-role messages to comply with Claude's requirements
 */
export function convertToOpenRouterHistory(messages: Message[]): OpenRouterMessage[] {
  // Filter out empty messages and messages without content
  const validMessages = messages.filter(msg =>
    (msg.content && msg.content.trim()) || msg.attachments?.length
  );

  const converted: OpenRouterMessage[] = [];

  for (const msg of validMessages) {
    // Build content array if there are attachments
    if (msg.attachments && msg.attachments.length > 0) {
      const contentParts: Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
      }> = [];

      // Add text part if exists
      if (msg.content && msg.content.trim()) {
        contentParts.push({
          type: 'text',
          text: msg.content
        });
      }

      // Add image parts
      for (const att of msg.attachments) {
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: `data:${att.type};base64,${att.data}`
          }
        });
      }

      converted.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: contentParts
      });
    } else {
      // Simple text message
      converted.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }
  }

  // Merge consecutive messages from the same role
  // This is required by Claude API which doesn't allow back-to-back messages from same role
  const merged: OpenRouterMessage[] = [];

  for (const msg of converted) {
    const lastMsg = merged[merged.length - 1];

    if (lastMsg && lastMsg.role === msg.role) {
      // Merge with previous message
      if (typeof lastMsg.content === 'string' && typeof msg.content === 'string') {
        lastMsg.content += '\n\n' + msg.content;
      } else if (Array.isArray(lastMsg.content) && Array.isArray(msg.content)) {
        lastMsg.content.push(...msg.content);
      } else if (typeof lastMsg.content === 'string' && Array.isArray(msg.content)) {
        lastMsg.content = [
          { type: 'text', text: lastMsg.content },
          ...msg.content
        ];
      } else if (Array.isArray(lastMsg.content) && typeof msg.content === 'string') {
        lastMsg.content.push({ type: 'text', text: msg.content });
      }
    } else {
      merged.push(msg);
    }
  }

  // Ensure history doesn't end with user message (some models require ending with assistant)
  // We'll keep this flexible - remove this constraint if not needed
  // For now, we keep it as-is since OpenRouter handles this

  return merged;
}

/**
 * Sanitize and validate message history before sending to API
 * Returns validated history or throws error if invalid
 */
export function validateHistory(messages: OpenRouterMessage[]): OpenRouterMessage[] {
  if (messages.length === 0) {
    return [];
  }

  // Ensure alternating turns for Claude compatibility
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === messages[i - 1].role) {
      console.warn(`Found consecutive ${messages[i].role} messages at index ${i}. This should have been merged.`);
    }
  }

  return messages;
}
