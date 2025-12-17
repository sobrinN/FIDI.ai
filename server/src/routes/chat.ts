import { Router } from 'express';
import { OpenRouter } from '@openrouter/sdk';
import { APIError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { formatMessagesForModel } from '../lib/modelAdapters.js';
import { isAllowedModel, getAllowedModelsString, getModelCostMultiplier } from '../config/allowedModels.js';
import { deductTokens, getTokenBalance } from '../lib/tokenService.js';
import { getModelsToAttempt } from '../config/fallbackConfig.js';
import { classifyError, shouldTriggerFallback, isTerminalError, ErrorType, ClassifiedError } from '../lib/errorClassifier.js';


export const chatRouter = Router();

// Constants for validation
const MAX_MESSAGES_PER_CONVERSATION = 1000;
const MAX_MESSAGE_LENGTH = 32000; // 32KB per message
const STREAM_TIMEOUT_MS = 120000; // 2 minutes
const MIN_TOKENS_FOR_CHAT = 100; // Minimum tokens required to start a chat

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
    apiKey
  });
};

chatRouter.post('/stream', async (req: AuthRequest, res, next) => {
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

    // Pre-flight token check: ensure user has minimum tokens before streaming
    // For FREE tier models (costMultiplier = 0), skip the check
    const costMultiplier = getModelCostMultiplier(model);
    if (costMultiplier > 0 && req.user) {
      const currentBalance = await getTokenBalance(req.user.id);
      if (currentBalance < MIN_TOKENS_FOR_CHAT) {
        throw new APIError(
          `Insufficient tokens. Required: at least ${MIN_TOKENS_FOR_CHAT}, Available: ${currentBalance}. Tokens reset monthly.`,
          402,
          'INSUFFICIENT_TOKENS'
        );
      }
    }

    const openRouter = getOpenRouterClient();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    // FALLBACK LOGIC: Get models to attempt (primary + fallbacks)
    const modelsToAttempt = getModelsToAttempt(model);
    const attemptedModels: string[] = [];
    // Use object wrapper to prevent TypeScript closure narrowing issues
    const errorState: { lastClassifiedError: ClassifiedError | null } = { lastClassifiedError: null };
    let successfulModel: string | null = null;

    /**
     * Helper function to attempt streaming with a specific model
     */
    async function attemptStreamWithModel(currentModel: string): Promise<boolean> {
      attemptedModels.push(currentModel);
      console.log(`[Chat Fallback] Attempting model: ${currentModel} (attempt ${attemptedModels.length}/${modelsToAttempt.length})`);

      try {
        // Use model adapter to format messages appropriately for each model
        const formattedMessages = formatMessagesForModel(currentModel, systemPrompt, validatedMessages);

        // Request usage data from OpenRouter
        // Cast messages to any to handle SDK type mismatch (our Message type is compatible at runtime)
        const stream = await openRouter.chat.send({
          model: currentModel,
          messages: formattedMessages as any,
          stream: true,
          streamOptions: {
            includeUsage: true
          }
        }, {
          signal: controller.signal
        });

        let totalTokensUsed = 0;
        let usageCaptured = false;

        // Stream content to client
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }

          // Capture token usage from final chunk
          if (chunk.usage?.totalTokens) {
            totalTokensUsed = chunk.usage.totalTokens;
            usageCaptured = true;
          }
        }

        // FIX: Handle missing usage data from OpenRouter
        if (!usageCaptured || totalTokensUsed === 0) {
          console.warn('[Chat] No usage data received from OpenRouter for request. Unable to deduct tokens.');
          res.write(`data: ${JSON.stringify({
            warning: 'Token usage could not be tracked for this request'
          })}\n\n`);
        }

        // Deduct tokens after successful stream completion (only if we have usage data)
        if (usageCaptured && totalTokensUsed > 0 && req.user) {
          try {
            // Get cost multiplier for this model (0 for FREE, 1.5 for PAID, 1.0 for LEGACY)
            const costMultiplier = getModelCostMultiplier(currentModel);
            const actualCost = Math.ceil(totalTokensUsed * costMultiplier);

            const deductionResult = await deductTokens(
              req.user.id,
              totalTokensUsed,
              `Chat completion (${currentModel})`,
              costMultiplier
            );

            // Send usage info to client with multiplier details
            if (deductionResult.success) {
              res.write(`data: ${JSON.stringify({
                usage: {
                  tokens: totalTokensUsed,
                  costMultiplier: costMultiplier,
                  actualCost: actualCost,
                  newBalance: deductionResult.newBalance
                }
              })}\n\n`);
            } else {
              console.error('[Chat] Failed to deduct tokens:', deductionResult.error);
              res.write(`data: ${JSON.stringify({
                warning: 'Token deduction failed',
                error: deductionResult.error
              })}\n\n`);
            }
          } catch (error) {
            console.error('[Chat] Exception during token deduction:', error);
            res.write(`data: ${JSON.stringify({
              warning: 'Token deduction failed due to exception'
            })}\n\n`);
          }
        }

        // Success! Mark which model was used
        successfulModel = currentModel;

        // Notify client if fallback was used
        if (currentModel !== model) {
          res.write(`data: ${JSON.stringify({
            fallback: {
              used: true,
              primaryModel: model,
              actualModel: currentModel,
              message: `Primary model unavailable. Response generated with ${currentModel}`
            }
          })}\n\n`);
        }

        return true; // Success
      } catch (error) {
        // Classify the error
        const classified = classifyError(error);
        errorState.lastClassifiedError = classified;

        console.error(`[Chat Fallback] Model ${currentModel} failed:`, {
          type: classified.type,
          message: classified.userFriendlyMessage,
          retryable: classified.retryable
        });

        // Check if this is a terminal error (should not retry)
        if (isTerminalError(classified)) {
          console.log(`[Chat Fallback] Terminal error detected, stopping fallback attempts`);
          throw new APIError(
            classified.userFriendlyMessage,
            classified.statusCode,
            classified.type,
            classified.type,
            classified.retryable,
            {
              attemptedModels,
              technicalDetails: classified.technicalDetails
            }
          );
        }

        // Check if we should trigger fallback
        if (!shouldTriggerFallback(classified)) {
          console.log(`[Chat Fallback] Error not suitable for fallback, stopping`);
          throw new APIError(
            classified.userFriendlyMessage,
            classified.statusCode,
            classified.type,
            classified.type,
            classified.retryable,
            {
              attemptedModels,
              technicalDetails: classified.technicalDetails
            }
          );
        }

        return false; // Failed but can retry
      }
    }

    try {
      // Try each model in sequence until one succeeds
      for (const currentModel of modelsToAttempt) {
        const success = await attemptStreamWithModel(currentModel);
        if (success) {
          break; // Success! Exit loop
        }

        // If not the last model, log that we're trying fallback
        const remainingModels = modelsToAttempt.slice(modelsToAttempt.indexOf(currentModel) + 1);
        if (remainingModels.length > 0) {
          console.log(`[Chat Fallback] Trying next fallback: ${remainingModels[0]}`);
        }
      }

      // If we exhausted all models without success
      if (!successfulModel) {
        console.error(`[Chat Fallback] All models exhausted. Attempted: ${attemptedModels.join(', ')}`);

        // Explicit typing for error data construction
        const classifiedErr = errorState.lastClassifiedError;
        const errorData = {
          error: classifiedErr?.userFriendlyMessage || 'All models failed to respond',
          code: classifiedErr?.type || ErrorType.UNKNOWN,
          errorType: classifiedErr?.type || ErrorType.UNKNOWN,
          attemptedModels,
          allFailed: true,
          retryable: false,
          technicalDetails: classifiedErr?.technicalDetails
        };

        res.write(`data: ${JSON.stringify(errorData)}\n\n`);
        res.end();
        clearTimeout(timeoutId);
        return;
      }

      // Successful completion
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const classified = classifyError(error);
        res.write(`data: ${JSON.stringify({
          error: classified.userFriendlyMessage,
          code: classified.type,
          errorType: classified.type,
          attemptedModels,
          retryable: classified.retryable
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
