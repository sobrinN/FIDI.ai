/**
 * API Client for FIDI Backend
 * All API calls go through the backend proxy for security
 */

import { RETRY } from '../config/constants';
import { ErrorType } from './errorTypes';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public errorType?: ErrorType,
    public attemptedModels?: string[],
    public fallbackUsed?: boolean,
    public retryable?: boolean,
    public technicalDetails?: string,
    public currentBalance?: number // Actual balance from backend for credit errors
  ) {
    super(message);
    this.name = 'APIError';
  }
}


async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Unknown error',
      code: 'UNKNOWN'
    }));

    // Special handling for insufficient credits/tokens (HTTP 402)
    if (response.status === 402) {
      // Preserve the original error code from backend (INSUFFICIENT_CREDITS or INSUFFICIENT_TOKENS)
      const errorCode = error.code || 'INSUFFICIENT_CREDITS';
      throw new APIError(
        error.error || 'Créditos insuficientes',
        402,
        errorCode,
        ErrorType.INSUFFICIENT_TOKENS,
        error.attemptedModels,
        false,
        false,
        error.technicalDetails,
        error.currentBalance // Include actual balance from backend
      );
    }

    // Special handling for authentication errors (HTTP 401)
    // Don't redirect automatically - let the user know their session expired
    if (response.status === 401) {
      throw new APIError(
        error.error || 'Sessão expirada. Por favor, recarregue a página e faça login novamente.',
        401,
        error.code || 'SESSION_EXPIRED',
        undefined, // errorType
        undefined, // attemptedModels
        false,     // fallbackUsed
        false,     // retryable
        'Authentication token expired or invalid'
      );
    }

    // Enhanced error with all metadata from backend
    throw new APIError(
      error.error || 'Request failed',
      response.status,
      error.code || 'UNKNOWN',
      error.errorType,
      error.attemptedModels,
      error.fallbackUsed,
      error.retryable,
      error.technicalDetails
    );
  }
  return response;
}


export interface StreamChatParams {
  model: string;
  systemPrompt: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }>;
  onChunk: (text: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  onFallback?: (primaryModel: string, actualModel: string, message: string) => void;
}


export async function streamChatCompletion({
  model,
  systemPrompt,
  messages,
  onChunk,
  onComplete,
  onError,
  onFallback
}: StreamChatParams): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    const response = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ model, systemPrompt, messages }),
      signal: controller.signal
    });

    await handleResponse(response);

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6);
        if (data === '[DONE]') {
          clearTimeout(timeoutId);
          onComplete();
          return;
        }

        try {
          const parsed = JSON.parse(data);

          // Handle error responses
          if (parsed.error) {
            throw new APIError(
              parsed.error,
              parsed.statusCode || 500,
              parsed.code || 'STREAM_ERROR',
              parsed.errorType,
              parsed.attemptedModels,
              parsed.fallbackUsed,
              parsed.retryable,
              parsed.technicalDetails,
              parsed.currentBalance // Include actual balance from backend for credit errors
            );
          }

          // Handle content chunks
          if (parsed.content) {
            onChunk(parsed.content);
          }

          // Handle fallback notification
          if (parsed.fallback?.used && onFallback) {
            onFallback(
              parsed.fallback.primaryModel,
              parsed.fallback.actualModel,
              parsed.fallback.message
            );
          }
        } catch (e) {
          if (e instanceof APIError) throw e;

          // Log JSON parse failures for debugging (may be incomplete chunks or malformed data)
          if (e instanceof SyntaxError) {
            console.warn('[Stream] Failed to parse SSE data chunk:', {
              rawData: data.substring(0, 100), // First 100 chars for debugging
              error: e.message,
              lineLength: data.length
            });
          } else {
            // Re-throw unexpected errors
            throw e;
          }
        }
      }
    }

    clearTimeout(timeoutId);
    onComplete();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      onError(new APIError('Request timeout', 408, 'TIMEOUT', ErrorType.TIMEOUT));
    } else {
      onError(error as Error);
    }
  }
}


// Image generation parameters
export interface ImageGenerationParams {
  prompt: string;
  model?: string;
  aspectRatio?: string;
  resolution?: string;
}

// Video generation parameters
export interface VideoGenerationParams {
  prompt: string;
  model?: string;
  aspectRatio?: string;
  resolution?: string;
  duration?: string;
}

export async function generateImage(params: ImageGenerationParams | string): Promise<string> {
  // Support both old string signature and new object signature
  const body = typeof params === 'string'
    ? { prompt: params }
    : {
      prompt: params.prompt,
      model: params.model,
      aspectRatio: params.aspectRatio,
      resolution: params.resolution
    };

  return retryWithBackoff(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/media/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      await handleResponse(response);
      const data = await response.json();
      return data.url;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Image generation failed', 500, 'GENERATION_FAILED');
    }
  });
}

export async function generateVideo(params: VideoGenerationParams | string): Promise<string> {
  // Support both old string signature and new object signature
  const body = typeof params === 'string'
    ? { prompt: params }
    : {
      prompt: params.prompt,
      model: params.model,
      aspectRatio: params.aspectRatio,
      resolution: params.resolution,
      duration: params.duration
    };

  return retryWithBackoff(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/media/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      await handleResponse(response);
      const data = await response.json();
      return data.url;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Video generation failed', 500, 'GENERATION_FAILED');
    }
  });
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = RETRY.MAX_ATTEMPTS,
  baseDelay = RETRY.INITIAL_DELAY
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors (4xx)
      if (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      if (i < maxRetries - 1) {
        const delay = Math.min(
          baseDelay * Math.pow(RETRY.BACKOFF_MULTIPLIER, i),
          RETRY.MAX_DELAY
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
