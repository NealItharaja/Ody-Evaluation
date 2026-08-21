import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { asc, eq } from 'drizzle-orm';

import { menuCategories, menuItems } from '../db/schema';
import type { AppEnv } from '../app-env';
import { notFound, validationFailed } from '../lib/errors';
import {
  errorResponses,
  IdParam,
  MenuCategoryCreate,
  MenuCategoryWithItems,
  MenuItemCreate,
  MenuItemPatch,
  MenuItemWithCategory,
} from '../schemas/http';
import { z } from '@hono/zod-openapi';

const MenuTree = z.array(MenuCategoryWithItems).openapi('MenuTree');

export function registerMenu(app: OpenAPIHono<AppEnv>) {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/menu',
      tags: ['Menu'],
      responses: {
        200: { description: 'Menu tree', content: { 'application/json': { schema: MenuTree } } },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const categories = await db
        .select()
        .from(menuCategories)
        .orderBy(asc(menuCategories.sortOrder));
      const items = await db.select().from(menuItems).orderBy(asc(menuItems.name));
      const grouped = new Map(categories.map((category) => [category.id, [] as typeof items]));
      for (const item of items) grouped.get(item.categoryId)?.push(item);

      return c.json(
        categories.map((category) => ({
          ...category,
          items: grouped.get(category.id) ?? [],
        })),
        200,
      );
    },
  );

  app.openapi(
    createRoute({
      method: 'post',
      path: '/menu/categories',
      tags: ['Menu'],
      request: {
        body: { required: true, content: { 'application/json': { schema: MenuCategoryCreate } } },
      },
      responses: {
        201: {
          description: 'Created category',
          content: { 'application/json': { schema: MenuCategoryWithItems } },
        },
        400: errorResponses[400],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const payload = c.req.valid('json');
      const name = payload.name.trim();
      if (!name) throw validationFailed('Name is required', { name: ['Name is required'] });

      const [created] = await db
        .insert(menuCategories)
        .values({
          id: crypto.randomUUID(),
          name,
          sortOrder: payload.sortOrder ?? 0,
        })
        .returning();

      return c.json({ ...created!, items: [] }, 201);
    },
  );

  app.openapi(
    createRoute({
      method: 'post',
      path: '/menu/items',
      tags: ['Menu'],
      request: {
        body: { required: true, content: { 'application/json': { schema: MenuItemCreate } } },
      },
      responses: {
        201: {
          description: 'Created item',
          content: { 'application/json': { schema: MenuItemWithCategory } },
        },
        400: errorResponses[400],
        404: errorResponses[404],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const payload = c.req.valid('json');
      if (payload.priceCents <= 0) {
        throw validationFailed('Price must be greater than zero', { priceCents: ['Must be > 0'] });
      }
      const [category] = await db
        .select()
        .from(menuCategories)
        .where(eq(menuCategories.id, payload.categoryId));
      if (!category) throw notFound('Category');

      const [created] = await db
        .insert(menuItems)
        .values({
          id: crypto.randomUUID(),
          categoryId: payload.categoryId,
          name: payload.name.trim(),
          description: payload.description?.trim() ?? '',
          priceCents: payload.priceCents,
          available: payload.available ?? true,
        })
        .returning();

      return c.json({ ...created!, categoryName: category.name }, 201);
    },
  );

  app.openapi(
    createRoute({
      method: 'patch',
      path: '/menu/items/{id}',
      tags: ['Menu'],
      request: {
        params: IdParam,
        body: { required: true, content: { 'application/json': { schema: MenuItemPatch } } },
      },
      responses: {
        200: {
          description: 'Updated item',
          content: { 'application/json': { schema: MenuItemWithCategory } },
        },
        404: errorResponses[404],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');
      const payload = c.req.valid('json');
      const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, id));
      if (!existing) throw notFound('Menu item');

      if (payload.priceCents !== undefined && payload.priceCents <= 0) {
        throw validationFailed('Price must be greater than zero', { priceCents: ['Must be > 0'] });
      }
      if (payload.categoryId) {
        const [category] = await db
          .select()
          .from(menuCategories)
          .where(eq(menuCategories.id, payload.categoryId));
        if (!category) throw notFound('Category');
      }

      const [updated] = await db
        .update(menuItems)
        .set({
          ...payload,
          name: payload.name?.trim() ?? existing.name,
          description: payload.description?.trim() ?? existing.description,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(menuItems.id, id))
        .returning();

      const [category] = await db
        .select()
        .from(menuCategories)
        .where(eq(menuCategories.id, updated!.categoryId));

      return c.json({ ...updated!, categoryName: category?.name ?? '' }, 200);
    },
  );
}
