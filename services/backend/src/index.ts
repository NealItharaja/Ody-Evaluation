import { createApp } from './app';
import { openDb } from './db/client';

export type Env = {
  DATABASE_URL: string;
};

export default {
  async fetch(request: Request, env: Env) {
    if (!env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: { code: 'internal_error', message: 'DATABASE_URL is not set' } }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }

    const { db, close } = openDb(env.DATABASE_URL);
    try {
      return await createApp(db).fetch(request, env);
    } finally {
      await close();
    }
  },
};
