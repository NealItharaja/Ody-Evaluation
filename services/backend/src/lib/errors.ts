import type { ApiErrorBody } from '@ody/types';

export class ApiError extends Error {
  constructor(
    public readonly status: 400 | 404 | 409 | 422 | 500,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toBody(): ApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export function notFound(entity: string): ApiError {
  return new ApiError(404, 'not_found', `${entity} not found`);
}

export function conflict(code: string, message: string): ApiError {
  return new ApiError(409, code, message);
}

export function unprocessable(
  code: string,
  message: string,
  details?: Record<string, string[]>,
): ApiError {
  return new ApiError(422, code, message, details);
}

export function validationFailed(message: string, details?: Record<string, string[]>): ApiError {
  return new ApiError(400, 'validation_failed', message, details);
}
