import { eq } from 'drizzle-orm';

import { customers, menuCategories, menuItems, orderItems, orders, settings } from './schema';
import type { AppDb } from './types';
import { computeOrderTotals, lineTotalCents } from '../lib/totals';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export async function seedDatabase(db: AppDb) {
  const [existing] = await db.select().from(settings).where(eq(settings.id, 'default'));
  if (existing) return { seeded: false };

  const categoryIds = {
    small: 'cat_small',
    pasta: 'cat_pasta',
    dessert: 'cat_dessert',
  };

  await db.insert(menuCategories).values([
    { id: categoryIds.small, name: 'Small plates', sortOrder: 1 },
    { id: categoryIds.pasta, name: 'Pasta', sortOrder: 2 },
    { id: categoryIds.dessert, name: 'Dessert', sortOrder: 3 },
  ]);

  await db.insert(menuItems).values([
    {
      id: 'm_1',
      categoryId: categoryIds.small,
      name: 'Charred Leek Focaccia',
      description: 'Wood-fired focaccia, confit leek, whipped ricotta.',
      priceCents: 1400,
      available: true,
    },
    {
      id: 'm_2',
      categoryId: categoryIds.small,
      name: 'Salt Cod Croquettes',
      description: 'Six pieces, lemon aioli, pickled fennel.',
      priceCents: 1650,
      available: true,
    },
    {
      id: 'm_3',
      categoryId: categoryIds.pasta,
      name: 'Cacio e Pepe',
      description: 'Hand-rolled tonnarelli, pecorino, tellicherry pepper.',
      priceCents: 2400,
      available: true,
    },
    {
      id: 'm_4',
      categoryId: categoryIds.pasta,
      name: 'Braised Short Rib Pappardelle',
      description: '48-hour braise, gremolata, aged parmesan.',
      priceCents: 3200,
      available: false,
    },
    {
      id: 'm_5',
      categoryId: categoryIds.dessert,
      name: 'Olive Oil Cake',
      description: 'Citrus glaze, crème fraîche, candied peel.',
      priceCents: 1200,
      available: true,
    },
  ]);

  await db.insert(customers).values([
    { id: 'c_1', name: 'Amara Whitfield', email: 'amara.w@example.com' },
    { id: 'c_2', name: 'Diego Salcedo', email: 'diego.s@example.com' },
    { id: 'c_3', name: 'Priya Raghavan', email: 'priya.r@example.com' },
    { id: 'c_4', name: 'Grace Okonkwo', email: 'grace.o@example.com' },
    { id: 'c_5', name: 'Tomas Lindqvist', email: 'tomas.l@example.com' },
  ]);

  await db.insert(settings).values({
    id: 'default',
    prepTimeMinutes: 18,
    autoAccept: true,
    serviceOpen: true,
    acceptDineIn: true,
    acceptTakeaway: true,
    acceptDelivery: true,
    opensAt: '11:30',
    closesAt: '22:30',
    timezone: 'America/Los_Angeles',
    taxRateBps: 875,
    nextOrderNumber: 1043,
  });

  const catalog = await db.select().from(menuItems);
  const byId = new Map(catalog.map((item) => [item.id, item]));

  const seedOrders: Array<{
    id: string;
    reference: string;
    customerId: string;
    status: (typeof orders.$inferInsert)['status'];
    channel: (typeof orders.$inferInsert)['channel'];
    createdAt: string;
    lines: Array<{ menuItemId: string; quantity: number }>;
  }> = [
    {
      id: 'o_1',
      reference: 'RV-1042',
      customerId: 'c_1',
      status: 'pending',
      channel: 'delivery',
      createdAt: minutesAgo(4),
      lines: [
        { menuItemId: 'm_1', quantity: 1 },
        { menuItemId: 'm_3', quantity: 1 },
        { menuItemId: 'm_5', quantity: 1 },
      ],
    },
    {
      id: 'o_2',
      reference: 'RV-1041',
      customerId: 'c_2',
      status: 'preparing',
      channel: 'dine_in',
      createdAt: minutesAgo(12),
      lines: [
        { menuItemId: 'm_2', quantity: 2 },
        { menuItemId: 'm_3', quantity: 2 },
        { menuItemId: 'm_5', quantity: 1 },
      ],
    },
    {
      id: 'o_3',
      reference: 'RV-1040',
      customerId: 'c_3',
      status: 'ready',
      channel: 'takeaway',
      createdAt: minutesAgo(21),
      lines: [
        { menuItemId: 'm_1', quantity: 1 },
        { menuItemId: 'm_5', quantity: 1 },
      ],
    },
    {
      id: 'o_4',
      reference: 'RV-1039',
      customerId: 'c_5',
      status: 'completed',
      channel: 'dine_in',
      createdAt: minutesAgo(58),
      lines: [
        { menuItemId: 'm_3', quantity: 2 },
        { menuItemId: 'm_2', quantity: 1 },
      ],
    },
    {
      id: 'o_5',
      reference: 'RV-1038',
      customerId: 'c_1',
      status: 'cancelled',
      channel: 'delivery',
      createdAt: minutesAgo(96),
      lines: [{ menuItemId: 'm_1', quantity: 1 }],
    },
    {
      id: 'o_6',
      reference: 'RV-1037',
      customerId: 'c_4',
      status: 'completed',
      channel: 'dine_in',
      createdAt: minutesAgo(140),
      lines: [
        { menuItemId: 'm_3', quantity: 3 },
        { menuItemId: 'm_5', quantity: 2 },
        { menuItemId: 'm_2', quantity: 1 },
      ],
    },
    {
      id: 'o_7',
      reference: 'RV-1036',
      customerId: 'c_2',
      status: 'completed',
      channel: 'takeaway',
      createdAt: daysAgo(2),
      lines: [{ menuItemId: 'm_3', quantity: 2 }],
    },
  ];

  for (const order of seedOrders) {
    const priced = order.lines.map((line) => {
      const item = byId.get(line.menuItemId)!;
      return {
        menuItemId: item.id,
        nameSnapshot: item.name,
        unitPriceCents: item.priceCents,
        quantity: line.quantity,
        lineTotalCents: lineTotalCents(item.priceCents, line.quantity),
      };
    });
    const totals = computeOrderTotals(priced, 875);
    await db.insert(orders).values({
      id: order.id,
      reference: order.reference,
      customerId: order.customerId,
      status: order.status,
      channel: order.channel,
      createdAt: order.createdAt,
      updatedAt: order.createdAt,
      ...totals,
    });
    await db.insert(orderItems).values(
      priced.map((line) => ({
        id: crypto.randomUUID(),
        orderId: order.id,
        ...line,
      })),
    );
  }

  return { seeded: true };
}
