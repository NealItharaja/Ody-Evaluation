import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { desc, eq, ilike, or, sql } from 'drizzle-orm';

import { customers, orders } from '../db/schema';
import type { AppEnv } from '../app-env';
import { notFound } from '../lib/errors';
import { itemCountByOrderIds, toOrderListItem } from '../lib/mappers';
import {
  CustomerDetail,
  CustomerList,
  errorResponses,
  IdParam,
  SearchQuery,
} from '../schemas/http';

export function registerCustomers(app: OpenAPIHono<AppEnv>) {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/customers',
      tags: ['Customers'],
      request: { query: SearchQuery },
      responses: {
        200: {
          description: 'Customer list',
          content: { 'application/json': { schema: CustomerList } },
        },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const { search } = c.req.valid('query');
      const where = search?.trim()
        ? or(
            ilike(customers.name, `%${search.trim()}%`),
            ilike(customers.email, `%${search.trim()}%`),
          )
        : undefined;

      const rows = await db.select().from(customers).where(where);

      const stats = await db
        .select({
          customerId: orders.customerId,
          orderCount: sql<number>`cast(count(*) as int)`,
          lifetimeSpendCents: sql<number>`cast(coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalCents} else 0 end), 0) as int)`,
          lastOrderAt: sql<string>`max(${orders.createdAt})`,
        })
        .from(orders)
        .groupBy(orders.customerId);
      const statsById = new Map(stats.map((row) => [row.customerId, row]));

      const items = rows
        .map((customer) => {
          const row = statsById.get(customer.id);
          return {
            ...customer,
            orderCount: Number(row?.orderCount ?? 0),
            lifetimeSpendCents: Number(row?.lifetimeSpendCents ?? 0),
            lastOrderAt: row?.lastOrderAt ?? null,
          };
        })
        .sort((a, b) => b.lifetimeSpendCents - a.lifetimeSpendCents);

      const lifetimeSpendCents = items.reduce((sum, item) => sum + item.lifetimeSpendCents, 0);
      const repeatRate =
        items.length === 0 ? 0 : items.filter((item) => item.orderCount > 1).length / items.length;

      return c.json(
        {
          items,
          total: items.length,
          lifetimeSpendCents,
          repeatRate,
        },
        200,
      );
    },
  );

  app.openapi(
    createRoute({
      method: 'get',
      path: '/customers/{id}',
      tags: ['Customers'],
      request: { params: IdParam },
      responses: {
        200: {
          description: 'Customer detail',
          content: { 'application/json': { schema: CustomerDetail } },
        },
        404: errorResponses[404],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');
      const [customer] = await db.select().from(customers).where(eq(customers.id, id));
      if (!customer) throw notFound('Customer');

      const orderRows = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, id))
        .orderBy(desc(orders.createdAt));
      const counts = await itemCountByOrderIds(
        db,
        orderRows.map((order) => order.id),
      );

      const completed = orderRows.filter((order) => order.status === 'completed');
      const lifetimeSpendCents = completed.reduce((sum, order) => sum + order.totalCents, 0);

      return c.json(
        {
          ...customer,
          orderCount: orderRows.length,
          lifetimeSpendCents,
          lastOrderAt: orderRows[0]?.createdAt ?? null,
          recentOrders: orderRows
            .slice(0, 8)
            .map((order) => toOrderListItem(order, customer.name, counts.get(order.id) ?? 0)),
        },
        200,
      );
    },
  );
}
