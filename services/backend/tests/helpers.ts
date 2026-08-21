import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

import { createApp } from '../src/app';
import { INIT_SQL, schema } from '../src/db/schema';
import { seedDatabase } from '../src/db/seed';
import type { AppDb } from '../src/db/types';

export async function makeTestApp() {
  const client = new PGlite();
  await client.exec(INIT_SQL);
  const db = drizzle({ client, schema }) as unknown as AppDb;
  await seedDatabase(db);
  return { app: createApp(db), db };
}

export async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}
