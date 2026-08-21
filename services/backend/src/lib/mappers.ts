import { eq, inArray, sql } from 'drizzle-orm';

import { customers, orderItems, orders } from '../db/schema';
import type { AppDb } from '../db/types';

export const OPEN_STATUSES = ['pending', 'accepted', 'preparing', 'ready'] as const;

export async function itemCountByOrderIds(db: AppDb, orderIds: string[]) {
  if (orderIds.length === 0) return new Map<string, number>();
  const rows = await db
    .select({
      orderId: orderItems.orderId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);
  return new Map(rows.map((row) => [row.orderId, Number(row.count)]));
}

export async function customerNamesByIds(db: AppDb, ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();
  const rows = await db.select().from(customers).where(inArray(customers.id, ids));
  return new Map(rows.map((row) => [row.id, row.name]));
}

export function toOrderListItem(
  order: typeof orders.$inferSelect,
  customerName: string,
  itemCount: number,
) {
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    channel: order.channel,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    customerName,
    itemCount,
  };
}
