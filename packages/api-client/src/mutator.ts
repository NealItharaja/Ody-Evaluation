import { isApiErrorBody } from '@ody/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

/**
 * Single HTTP boundary for generated Orval hooks. Screens never call fetch.
 * Signature matches Orval's fetch client: (url, RequestInit) => Promise<body>.
 */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, options);

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (isApiErrorBody(body)) throw body;
    throw {
      error: {
        code: 'internal_error',
        message: `Request failed (${response.status})`,
      },
    };
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
