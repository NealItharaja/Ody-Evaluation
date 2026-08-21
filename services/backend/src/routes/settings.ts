import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';

import { settings } from '../db/schema';
import type { AppEnv } from '../app-env';
import { notFound, validationFailed } from '../lib/errors';
import { assertAtLeastOneChannel } from '../lib/ordering-rules';
import { errorResponses, SettingsPatch, SettingsSelect } from '../schemas/http';

export function registerSettings(app: OpenAPIHono<AppEnv>) {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/settings',
      tags: ['Settings'],
      responses: {
        200: {
          description: 'Ordering settings',
          content: { 'application/json': { schema: SettingsSelect } },
        },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const [row] = await db.select().from(settings).where(eq(settings.id, 'default'));
      if (!row) throw notFound('Settings');
      return c.json(row, 200);
    },
  );

  app.openapi(
    createRoute({
      method: 'put',
      path: '/settings',
      tags: ['Settings'],
      request: {
        body: { required: true, content: { 'application/json': { schema: SettingsPatch } } },
      },
      responses: {
        200: {
          description: 'Updated settings',
          content: { 'application/json': { schema: SettingsSelect } },
        },
        400: errorResponses[400],
        422: errorResponses[422],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const payload = c.req.valid('json');
      const [existing] = await db.select().from(settings).where(eq(settings.id, 'default'));
      if (!existing) throw notFound('Settings');

      const next = { ...existing, ...payload };
      if (next.prepTimeMinutes <= 0) {
        throw validationFailed('Prep time must be at least 1 minute', {
          prepTimeMinutes: ['Must be > 0'],
        });
      }
      assertAtLeastOneChannel(next);

      const [updated] = await db
        .update(settings)
        .set({ ...payload, updatedAt: new Date().toISOString() })
        .where(eq(settings.id, 'default'))
        .returning();

      return c.json(updated!, 200);
    },
  );
}
