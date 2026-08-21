/**
 * The single error envelope every endpoint returns on failure. Keeping one
 * shape means the dashboard has exactly one place that turns an error into UI.
 */
export type ApiErrorBody = {
  error: {
    /** Stable, machine-readable code, e.g. `order.invalid_transition`. */
    code: string;
    message: string;
    /** Field-level validation problems, keyed by dotted field path. */
    details?: Record<string, string[]>;
  };
};

export type ApiErrorCode =
  'validation_failed' | 'not_found' | 'conflict' | 'unprocessable' | 'internal_error';

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = (value as { error?: unknown }).error;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof (candidate as { code?: unknown }).code === 'string' &&
    typeof (candidate as { message?: unknown }).message === 'string'
  );
}
