/**
 * API Client for FIDI Backend
 * All API calls go through the backend proxy for security
 */

import { RETRY } from '../config/constants';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
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
    throw new APIError(
      error.error || 'Request failed',
      response.status,
      error.code || 'UNKNOWN'
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
}

export async function streamChatCompletion({
  model,
  systemPrompt,
  messages,
  onChunk,
  onComplete,
  onError
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
          if (parsed.error) {
            throw new APIError(parsed.error, 500, 'STREAM_ERROR');
          }
          if (parsed.content) {
            onChunk(parsed.content);
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
      onError(new APIError('Request timeout', 408, 'TIMEOUT'));
    } else {
      onError(error as Error);
    }
  }
}

export async function generateImage(prompt: string): Promise<string> {
  return retryWithBackoff(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/media/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ prompt })
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

export async function generateVideo(prompt: string): Promise<string> {
  return retryWithBackoff(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/media/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ prompt })
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
