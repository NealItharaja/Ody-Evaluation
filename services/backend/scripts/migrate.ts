import postgres from 'postgres';

import { INIT_SQL } from '../src/db/schema';
import { loadDevVars } from './load-env';

loadDevVars();

const url = process.env.DATABASE_URL ?? 'postgres://ody:ody@127.0.0.1:5432/ody';

const client = postgres(url, { max: 1 });
await client.unsafe(INIT_SQL);
await client.end();

console.log('Schema applied to', url.replace(/:[^:@]+@/, ':***@'));
