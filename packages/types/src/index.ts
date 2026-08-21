/**
 * Cross-cutting types shared by the API and the dashboard.
 *
 * Deliberately small: anything derived from persisted data lives in the Drizzle
 * schema and reaches the frontend through the generated OpenAPI client, never
 * through hand-written duplicates in here.
 */

export * from './api';
export * from './primitives';
