import { Router } from 'express';
import { APIError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { checkTokenQuota } from '../middleware/tokenQuota.js';
import { deductTokens, TOKEN_COSTS } from '../lib/tokenService.js';

export const mediaRouter = Router();

const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

// FIX: Use proper Replicate version hashes instead of model names
// Note: These are version-specific hashes. Update when using different model versions.
const MODELS = {
  // FLUX 1.1 Pro - Fast, high-quality image generation
  IMAGE: 'black-forest-labs/flux-1.1-pro',
  // MiniMax Video-01 - Text-to-video generation
  VIDEO: 'minimax/video-01'
};

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  urls: {
    get: string;
    cancel: string;
  };
}

async function pollPrediction(getUrl: string, apiKey: string): Promise<ReplicatePrediction> {
  let attempts = 0;
  const maxAttempts = 60;
  const startTime = Date.now();

  console.log('[Replicate] Starting prediction polling', {
    maxAttempts,
    pollInterval: '2 seconds',
    maxDuration: '2 minutes'
  });

  while (attempts < maxAttempts) {
    const response = await fetch(getUrl, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('[Replicate] Poll request failed', {
        status: response.status,
        statusText: response.statusText,
        attempt: attempts + 1
      });
      throw new APIError(`Failed to poll prediction: ${response.statusText}`, 500, 'POLL_FAILED');
    }

    const prediction: ReplicatePrediction = await response.json();
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('[Replicate] Poll attempt', {
      attempt: attempts + 1,
      status: prediction.status,
      elapsedSeconds: `${elapsedSeconds}s`
    });

    if (prediction.status === 'succeeded') {
      console.log('[Replicate] Prediction succeeded', {
        totalAttempts: attempts + 1,
        totalDuration: `${elapsedSeconds}s`
      });
      return prediction;
    }

    if (prediction.status === 'failed') {
      console.error('[Replicate] Prediction failed', {
        error: prediction.error,
        attempts: attempts + 1,
        duration: `${elapsedSeconds}s`
      });
      throw new APIError(prediction.error || 'Prediction failed', 500, 'PREDICTION_FAILED');
    }

    if (prediction.status === 'canceled') {
      console.warn('[Replicate] Prediction canceled', {
        attempts: attempts + 1,
        duration: `${elapsedSeconds}s`
      });
      throw new APIError('Prediction was canceled', 500, 'PREDICTION_CANCELED');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  const finalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.error('[Replicate] Prediction timeout', {
    attempts: maxAttempts,
    duration: `${finalDuration}s`
  });
  throw new APIError('Prediction timed out after 2 minutes', 408, 'TIMEOUT');
}

mediaRouter.post('/image', checkTokenQuota(TOKEN_COSTS.IMAGE_GENERATION), async (req: AuthRequest, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      throw new APIError('Invalid or missing prompt', 400, 'INVALID_PROMPT');
    }

    if (!req.user) {
      throw new APIError('Authentication required', 401, 'NO_USER');
    }

    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey || apiKey === 'r8_your-key-here') {
      throw new APIError('REPLICATE_API_KEY not configured', 500, 'MISSING_API_KEY');
    }

    const enhancedPrompt = `${prompt}, high quality, detailed, professional photography, 8k resolution`;

    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        model: MODELS.IMAGE,
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: '1:1',
          output_format: 'png',
          output_quality: 90
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new APIError(
        error.detail || `Failed to start image generation: ${response.statusText}`,
        response.status,
        'IMAGE_GENERATION_FAILED'
      );
    }

    const prediction: ReplicatePrediction = await response.json();
    const result = await pollPrediction(prediction.urls.get, apiKey);

    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    if (!imageUrl) {
      throw new APIError('No image URL in prediction output', 500, 'NO_OUTPUT');
    }

    // FIX: Wrap token deduction in try-catch to handle partial failures
    // If deduction fails, user still gets their image but with a warning
    try {
      const deductionResult = await deductTokens(
        req.user.id,
        TOKEN_COSTS.IMAGE_GENERATION,
        'Image generation'
      );

      if (!deductionResult.success) {
        console.error('[Media] Token deduction failed but image was generated:', deductionResult.error);
        return res.json({
          url: imageUrl,
          warning: 'Image generated successfully but token deduction failed. Please contact support.',
          tokensUsed: TOKEN_COSTS.IMAGE_GENERATION,
          deductionFailed: true
        });
      }

      res.json({
        url: imageUrl,
        tokensUsed: TOKEN_COSTS.IMAGE_GENERATION,
        newBalance: deductionResult.newBalance
      });
    } catch (deductError) {
      // Log error but still return the image
      console.error('[Media] Token deduction exception but image was generated:', deductError);

      res.json({
        url: imageUrl,
        warning: 'Image generated successfully but token deduction failed. Please contact support.',
        tokensUsed: TOKEN_COSTS.IMAGE_GENERATION,
        deductionFailed: true
      });
    }
  } catch (error) {
    next(error);
  }
});

mediaRouter.post('/video', checkTokenQuota(TOKEN_COSTS.VIDEO_GENERATION), async (req: AuthRequest, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      throw new APIError('Invalid or missing prompt', 400, 'INVALID_PROMPT');
    }

    if (!req.user) {
      throw new APIError('Authentication required', 401, 'NO_USER');
    }

    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey || apiKey === 'r8_your-key-here') {
      throw new APIError('REPLICATE_API_KEY not configured', 500, 'MISSING_API_KEY');
    }

    const enhancedPrompt = `${prompt}, cinematic, smooth motion, high quality, professional`;

    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        model: MODELS.VIDEO,
        input: {
          prompt: enhancedPrompt
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new APIError(
        error.detail || `Failed to start video generation: ${response.statusText}`,
        response.status,
        'VIDEO_GENERATION_FAILED'
      );
    }

    const prediction: ReplicatePrediction = await response.json();
    const result = await pollPrediction(prediction.urls.get, apiKey);

    const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    if (!videoUrl) {
      throw new APIError('No video URL in prediction output', 500, 'NO_OUTPUT');
    }

    // FIX: Wrap token deduction in try-catch to handle partial failures
    // If deduction fails, user still gets their video but with a warning
    try {
      const deductionResult = await deductTokens(
        req.user.id,
        TOKEN_COSTS.VIDEO_GENERATION,
        'Video generation'
      );

      if (!deductionResult.success) {
        console.error('[Media] Token deduction failed but video was generated:', deductionResult.error);
        return res.json({
          url: videoUrl,
          warning: 'Video generated successfully but token deduction failed. Please contact support.',
          tokensUsed: TOKEN_COSTS.VIDEO_GENERATION,
          deductionFailed: true
        });
      }

      res.json({
        url: videoUrl,
        tokensUsed: TOKEN_COSTS.VIDEO_GENERATION,
        newBalance: deductionResult.newBalance
      });
    } catch (deductError) {
      // Log error but still return the video
      console.error('[Media] Token deduction exception but video was generated:', deductError);

      res.json({
        url: videoUrl,
        warning: 'Video generated successfully but token deduction failed. Please contact support.',
        tokensUsed: TOKEN_COSTS.VIDEO_GENERATION,
        deductionFailed: true
      });
    }
  } catch (error) {
    next(error);
  }
});
