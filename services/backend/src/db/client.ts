import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { schema, type DbSchema } from './schema';

export type Db = PostgresJsDatabase<DbSchema>;

/**
 * Workers isolate I/O per request, so the postgres.js socket cannot be cached
 * across fetches. Open a short-lived client for the duration of the handler.
 */
export function openDb(databaseUrl: string) {
  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 5,
    connect_timeout: 10,
  });
  const db = drizzle(sql, { schema });
  return {
    db,
    close: () => sql.end({ timeout: 5 }),
  };
}
