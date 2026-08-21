import { createRoute, type OpenAPIHono } from '@hono/zod-openapi';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import { customers, menuItems, orderItems, orders, settings } from '../db/schema';
import { notFound, unprocessable, validationFailed } from '../lib/errors';
import { itemCountByOrderIds, OPEN_STATUSES, toOrderListItem } from '../lib/mappers';
import { allowedActions, applyOrderAction } from '../lib/order-state';
import { assertChannelAllowed } from '../lib/ordering-rules';
import { computeOrderTotals, lineTotalCents } from '../lib/totals';
import {
  CreateOrder,
  errorResponses,
  IdParam,
  OrderActionRequest,
  OrderDetail,
  OrderList,
  OrderListQuery,
} from '../schemas/http';
import type { AppEnv } from '../app-env';

export function registerOrders(app: OpenAPIHono<AppEnv>) {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/orders',
      tags: ['Orders'],
      request: { query: OrderListQuery },
      responses: {
        200: { description: 'Order list', content: { 'application/json': { schema: OrderList } } },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const query = c.req.valid('query');

      const filters = [];
      if (query.status === 'open') filters.push(inArray(orders.status, [...OPEN_STATUSES]));
      else if (query.status) filters.push(eq(orders.status, query.status));
      if (query.channel) filters.push(eq(orders.channel, query.channel));
      if (query.search?.trim()) {
        const term = `%${query.search.trim()}%`;
        filters.push(or(ilike(orders.reference, term), ilike(customers.name, term)));
      }

      const where = filters.length ? and(...filters) : undefined;

      const rows = await db
        .select({ order: orders, customerName: customers.name })
        .from(orders)
        .innerJoin(customers, eq(customers.id, orders.customerId))
        .where(where)
        .orderBy(desc(orders.createdAt));

      const counts = await itemCountByOrderIds(
        db,
        rows.map((row) => row.order.id),
      );

      const allStatuses = await db
        .select({
          status: orders.status,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(orders)
        .groupBy(orders.status);

      const statusCounts = Object.fromEntries(
        allStatuses.map((row) => [row.status, Number(row.count)]),
      );
      const openCount = OPEN_STATUSES.reduce((sum, status) => sum + (statusCounts[status] ?? 0), 0);

      return c.json(
        {
          items: rows.map((row) =>
            toOrderListItem(row.order, row.customerName, counts.get(row.order.id) ?? 0),
          ),
          total: rows.length,
          openCount,
          completedCount: statusCounts.completed ?? 0,
          cancelledCount: statusCounts.cancelled ?? 0,
        },
        200,
      );
    },
  );

  app.openapi(
    createRoute({
      method: 'get',
      path: '/orders/{id}',
      tags: ['Orders'],
      request: { params: IdParam },
      responses: {
        200: {
          description: 'Order detail',
          content: { 'application/json': { schema: OrderDetail } },
        },
        404: errorResponses[404],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');
      const detail = await loadOrderDetail(db, id);
      if (!detail) throw notFound('Order');
      return c.json(detail, 200);
    },
  );

  app.openapi(
    createRoute({
      method: 'post',
      path: '/orders',
      tags: ['Orders'],
      request: {
        body: { required: true, content: { 'application/json': { schema: CreateOrder } } },
      },
      responses: {
        201: {
          description: 'Created order',
          content: { 'application/json': { schema: OrderDetail } },
        },
        400: errorResponses[400],
        422: errorResponses[422],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const payload = c.req.valid('json');
      const [currentSettings] = await db.select().from(settings).where(eq(settings.id, 'default'));
      if (!currentSettings) throw notFound('Settings');

      assertChannelAllowed(payload.channel, currentSettings);

      const uniqueIds = [...new Set(payload.items.map((item) => item.menuItemId))];
      const catalog = await db.select().from(menuItems).where(inArray(menuItems.id, uniqueIds));
      const byId = new Map(catalog.map((item) => [item.id, item]));

      for (const line of payload.items) {
        const item = byId.get(line.menuItemId);
        if (!item)
          throw unprocessable('order.unknown_item', `Unknown menu item ${line.menuItemId}`);
        if (!item.available) {
          throw unprocessable('order.unavailable_item', `${item.name} is not available`);
        }
      }

      const priced = payload.items.map((line) => {
        const item = byId.get(line.menuItemId)!;
        return {
          menuItemId: item.id,
          nameSnapshot: item.name,
          unitPriceCents: item.priceCents,
          quantity: line.quantity,
          lineTotalCents: lineTotalCents(item.priceCents, line.quantity),
        };
      });
      const totals = computeOrderTotals(priced, currentSettings.taxRateBps);
      const status = currentSettings.autoAccept ? 'accepted' : 'pending';

      const orderId = crypto.randomUUID();

      await db.transaction(async (tx) => {
        let customerId = payload.customerId;
        if (customerId) {
          const [existing] = await tx.select().from(customers).where(eq(customers.id, customerId));
          if (!existing) throw notFound('Customer');
        } else if (payload.customer) {
          const [existing] = await tx
            .select()
            .from(customers)
            .where(eq(customers.email, payload.customer.email.toLowerCase()));
          if (existing) {
            customerId = existing.id;
          } else {
            customerId = crypto.randomUUID();
            await tx.insert(customers).values({
              id: customerId,
              name: payload.customer.name.trim(),
              email: payload.customer.email.toLowerCase(),
            });
          }
        } else {
          throw validationFailed('Provide customerId or customer');
        }

        const [numberRow] = await tx
          .update(settings)
          .set({ nextOrderNumber: sql`${settings.nextOrderNumber} + 1` })
          .where(eq(settings.id, 'default'))
          .returning();
        if (!numberRow) throw notFound('Settings');
        const reference = `RV-${numberRow.nextOrderNumber - 1}`;

        await tx.insert(orders).values({
          id: orderId,
          reference,
          customerId: customerId!,
          status,
          channel: payload.channel,
          ...totals,
        });

        await tx.insert(orderItems).values(
          priced.map((line) => ({
            id: crypto.randomUUID(),
            orderId,
            ...line,
          })),
        );
      });

      const created = await loadOrderDetail(db, orderId);
      return c.json(created!, 201);
    },
  );

  app.openapi(
    createRoute({
      method: 'post',
      path: '/orders/{id}/actions',
      tags: ['Orders'],
      request: {
        params: IdParam,
        body: { required: true, content: { 'application/json': { schema: OrderActionRequest } } },
      },
      responses: {
        200: {
          description: 'Updated order',
          content: { 'application/json': { schema: OrderDetail } },
        },
        404: errorResponses[404],
        409: errorResponses[409],
      },
    }),
    async (c) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');
      const { action } = c.req.valid('json');
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      if (!order) throw notFound('Order');

      const nextStatus = applyOrderAction(order.status, action);
      await db
        .update(orders)
        .set({ status: nextStatus, updatedAt: new Date().toISOString() })
        .where(eq(orders.id, id));

      const detail = await loadOrderDetail(db, id);
      return c.json(detail!, 200);
    },
  );
}

async function loadOrderDetail(db: AppEnv['Variables']['db'], id: string) {
  const [row] = await db
    .select({ order: orders, customer: customers })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(eq(orders.id, id));
  if (!row) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  return {
    ...row.order,
    customerName: row.customer.name,
    customerEmail: row.customer.email,
    allowedActions: allowedActions(row.order.status),
    items: items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      nameSnapshot: item.nameSnapshot,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
  };
}
