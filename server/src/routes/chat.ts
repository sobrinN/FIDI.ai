import { Router } from 'express';
import { OpenRouter } from '@openrouter/sdk';
import { APIError } from '../middleware/errorHandler.js';
import { formatMessagesForModel } from '../lib/modelAdapters.js';
import { isAllowedModel, getAllowedModelsString } from '../config/allowedModels.js';

export const chatRouter = Router();

// Constants for validation
const MAX_MESSAGES_PER_CONVERSATION = 1000;
const MAX_MESSAGE_LENGTH = 32000; // 32KB per message
const STREAM_TIMEOUT_MS = 120000; // 2 minutes

/**
 * Sanitize user input to prevent prompt injection
 * Removes or escapes potentially dangerous patterns
 */
function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove common prompt injection patterns
  let sanitized = input
    // Remove attempts to override system prompts
    .replace(/\[SYSTEM\]/gi, '[USER]')
    .replace(/\[INST\]/gi, '[USER]')
    .replace(/<<SYS>>/gi, '')
    .replace(/<\|im_start\|>/gi, '')
    .replace(/<\|im_end\|>/gi, '')
    // Remove markdown that could be used for injection
    .replace(/```system/gi, '```text')
    // Remove attempts to impersonate assistant
    .replace(/^(assistant|ai|bot|system):\s*/gim, 'user says: ')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
  }

  return sanitized;
}

/**
 * Validate and sanitize message array
 */
function validateMessages(messages: unknown[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(messages)) {
    throw new APIError('Messages must be an array', 400, 'INVALID_MESSAGES');
  }

  if (messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    throw new APIError(
      `Too many messages. Maximum ${MAX_MESSAGES_PER_CONVERSATION} messages per conversation.`,
      400,
      'TOO_MANY_MESSAGES'
    );
  }

  return messages.map((msg, index) => {
    if (!msg || typeof msg !== 'object') {
      throw new APIError(`Invalid message at index ${index}`, 400, 'INVALID_MESSAGE');
    }

    const message = msg as Record<string, unknown>;

    if (!message.role || typeof message.role !== 'string') {
      throw new APIError(`Invalid role at message ${index}`, 400, 'INVALID_ROLE');
    }

    // Only allow user and assistant roles from client
    const role = message.role.toLowerCase() as 'user' | 'assistant';
    if (!['user', 'assistant'].includes(role)) {
      throw new APIError(`Invalid role "${role}" at message ${index}`, 400, 'INVALID_ROLE');
    }

    // Sanitize content
    let content: string;
    if (typeof message.content === 'string') {
      content = role === 'user' ? sanitizeUserInput(message.content) : message.content;
    } else if (Array.isArray(message.content)) {
      // Handle multimodal content (text + images)
      content = message.content.map((part: { type?: string; text?: string }) => {
        if (part.type === 'text' && typeof part.text === 'string') {
          return role === 'user' ? sanitizeUserInput(part.text) : part.text;
        }
        return '';
      }).join(' ');
    } else {
      content = '';
    }

    return { role, content };
  });
}

const getOpenRouterClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'sk-or-v1-your-key-here') {
    throw new APIError(
      'OPENROUTER_API_KEY not configured on server',
      500,
      'MISSING_API_KEY'
    );
  }

  return new OpenRouter({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1'
  });
};

chatRouter.post('/stream', async (req, res, next) => {
  try {
    const { model, systemPrompt, messages } = req.body;

    // Validation
    if (!model || typeof model !== 'string') {
      throw new APIError('Invalid or missing model', 400, 'INVALID_MODEL');
    }

    // SECURITY: Validate model against allowlist to prevent unauthorized expensive model usage
    if (!isAllowedModel(model)) {
      throw new APIError(
        `Model "${model}" is not authorized. Allowed models: ${getAllowedModelsString()}`,
        400,
        'UNAUTHORIZED_MODEL'
      );
    }

    if (!systemPrompt || typeof systemPrompt !== 'string') {
      throw new APIError('Invalid or missing systemPrompt', 400, 'INVALID_PROMPT');
    }

    // Validate and sanitize messages (includes message count limit check)
    const validatedMessages = validateMessages(messages);

    const openRouter = getOpenRouterClient();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    try {
      // Use model adapter to format messages appropriately for each model
      const formattedMessages = formatMessagesForModel(model, systemPrompt, validatedMessages);

      const stream = await openRouter.chat.send({
        model,
        messages: formattedMessages,
        stream: true
      }, {
        signal: controller.signal
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        res.write(`data: ${JSON.stringify({
          error: 'Stream timeout - request exceeded 2 minute limit',
          code: 'TIMEOUT'
        })}\n\n`);
        res.end();
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    // For SSE, we need to handle errors differently
    if (!res.headersSent) {
      next(error);
    } else {
      // Send detailed error information to client for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      console.error('[SSE Stream Error]', {
        message: errorMessage,
        name: errorName,
        error
      });

      res.write(`data: ${JSON.stringify({
        error: `Stream error: ${errorMessage}`,
        code: errorName,
        details: 'Check server logs for full error details'
      })}\n\n`);
      res.end();
    }
  }
});
