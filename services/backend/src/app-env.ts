import type { OpenAPIHono } from '@hono/zod-openapi';

import type { AppDb } from './db/types';

export type AppEnv = {
  Variables: {
    db: AppDb;
  };
};

export type App = OpenAPIHono<AppEnv>;
