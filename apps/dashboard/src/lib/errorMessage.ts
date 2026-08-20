import { isApiErrorBody } from '@ody/types';

export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isApiErrorBody(error)) return error.error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
