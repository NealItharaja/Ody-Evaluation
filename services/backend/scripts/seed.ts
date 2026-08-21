import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { schema } from '../src/db/schema';
import { seedDatabase } from '../src/db/seed';
import { loadDevVars } from './load-env';

loadDevVars();

const url = process.env.DATABASE_URL ?? 'postgres://ody:ody@127.0.0.1:5432/ody';

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

const result = await seedDatabase(db);
await client.end();

console.log(
  result.seeded ? 'Seeded Rosemary & Vine demo data' : 'Database already seeded — skipped',
);
