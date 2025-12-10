import { Request, Response, NextFunction } from 'express';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err);

  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    });
    return;
  }

  // Handle specific errors
  if (err.message?.includes('timeout')) {
    res.status(408).json({
      error: 'Request timeout',
      code: 'TIMEOUT'
    });
    return;
  }

  if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
    res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  // Generic error
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
}
