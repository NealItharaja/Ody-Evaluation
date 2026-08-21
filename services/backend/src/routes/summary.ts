import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { desc, eq, gte, inArray, sql } from 'drizzle-orm';

import { customers, menuCategories, menuItems, orderItems, orders, settings } from '../db/schema';
import type { AppEnv } from '../app-env';
import { notFound } from '../lib/errors';
import { itemCountByOrderIds, OPEN_STATUSES, toOrderListItem } from '../lib/mappers';
import { startOfLocalDay } from '../lib/time';
import { Summary } from '../schemas/http';

export function registerSummary(app: OpenAPIHono<AppEnv>) {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/summary',
      tags: ['Summary'],
      responses: {
        200: { description: 'Home KPIs', content: { 'application/json': { schema: Summary } } },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const [current] = await db.select().from(settings).where(eq(settings.id, 'default'));
      if (!current) throw notFound('Settings');

      const since = startOfLocalDay(current.timezone).toISOString();

      const todayOrders = await db.select().from(orders).where(gte(orders.createdAt, since));
      const completedToday = todayOrders.filter((order) => order.status === 'completed');
      const revenueCents = completedToday.reduce((sum, order) => sum + order.totalCents, 0);
      const openOrders = todayOrders.filter((order) =>
        (OPEN_STATUSES as readonly string[]).includes(order.status),
      ).length;

      const liveRows = await db
        .select({ order: orders, customerName: customers.name })
        .from(orders)
        .innerJoin(customers, eq(customers.id, orders.customerId))
        .where(inArray(orders.status, [...OPEN_STATUSES]))
        .orderBy(desc(orders.createdAt))
        .limit(8);
      const counts = await itemCountByOrderIds(
        db,
        liveRows.map((row) => row.order.id),
      );

      const popular = await db
        .select({
          menuItemId: orderItems.menuItemId,
          name: menuItems.name,
          categoryName: menuCategories.name,
          priceCents: menuItems.priceCents,
          quantitySold: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .innerJoin(menuItems, eq(menuItems.id, orderItems.menuItemId))
        .innerJoin(menuCategories, eq(menuCategories.id, menuItems.categoryId))
        .where(eq(orders.status, 'completed'))
        .groupBy(orderItems.menuItemId, menuItems.name, menuCategories.name, menuItems.priceCents)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(4);

      return c.json(
        {
          ordersToday: todayOrders.length,
          revenueCents,
          openOrders,
          averageOrderCents:
            completedToday.length === 0 ? 0 : Math.round(revenueCents / completedToday.length),
          popularItems: popular.map((row) => ({
            ...row,
            quantitySold: Number(row.quantitySold),
          })),
          liveOrders: liveRows.map((row) =>
            toOrderListItem(row.order, row.customerName, counts.get(row.order.id) ?? 0),
          ),
        },
        200,
      );
    },
  );
}
