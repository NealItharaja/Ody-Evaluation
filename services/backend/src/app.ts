import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';

import type { AppEnv } from './app-env';
import type { AppDb } from './db/types';
import { ApiError } from './lib/errors';
import { registerCustomers } from './routes/customers';
import { registerMenu } from './routes/menu';
import { registerOrders } from './routes/orders';
import { registerSettings } from './routes/settings';
import { registerSummary } from './routes/summary';

export function createApp(db: AppDb) {
  const app = new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        const details: Record<string, string[]> = {};
        for (const issue of result.error.issues) {
          const path = issue.path.join('.') || '_';
          details[path] ??= [];
          details[path].push(issue.message);
        }
        return c.json(
          {
            error: {
              code: 'validation_failed',
              message: 'Request validation failed',
              details,
            },
          },
          400,
        );
      }
    },
  });

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
    }),
  );

  app.use('*', async (c, next) => {
    c.set('db', db);
    await next();
  });

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json(err.toBody(), err.status);
    }
    console.error(err);
    return c.json({ error: { code: 'internal_error', message: 'Something went wrong' } }, 500);
  });

  app.get('/', (c) =>
    c.json({
      name: 'Odyssey Ops API',
      ok: true,
      health: '/health',
      dashboard: 'http://localhost:8081',
    }),
  );
  app.get('/health', (c) => c.json({ ok: true }));

  registerMenu(app);
  registerOrders(app);
  registerCustomers(app);
  registerSettings(app);
  registerSummary(app);

  return app;
}

export const openApiInfo = {
  openapi: '3.0.0' as const,
  info: {
    title: 'Odyssey Ops API',
    version: '0.1.0',
    description: 'Restaurant ordering API. Totals and status transitions are server-owned.',
  },
  servers: [{ url: 'http://localhost:8787', description: 'Local wrangler' }],
};
