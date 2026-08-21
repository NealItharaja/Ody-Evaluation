import { sql } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Persisted data truth. Every API field that represents a stored column is
 * derived from these tables via drizzle-zod — not redeclared by hand.
 */

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_CHANNELS = ['dine_in', 'takeaway', 'delivery'] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export const ORDER_ACTIONS = [
  'accept',
  'start_preparing',
  'mark_ready',
  'complete',
  'cancel',
] as const;
export type OrderAction = (typeof ORDER_ACTIONS)[number];

export const orderStatusEnum = pgEnum('order_status', ORDER_STATUSES);
export const orderChannelEnum = pgEnum('order_channel', ORDER_CHANNELS);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
};

export const menuCategories = pgTable('menu_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamps.createdAt,
});

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  categoryId: text('category_id')
    .notNull()
    .references(() => menuCategories.id),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  priceCents: integer('price_cents').notNull(),
  available: boolean('available').notNull().default(true),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamps.createdAt,
});

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  prepTimeMinutes: integer('prep_time_minutes').notNull(),
  autoAccept: boolean('auto_accept').notNull(),
  serviceOpen: boolean('service_open').notNull(),
  acceptDineIn: boolean('accept_dine_in').notNull(),
  acceptTakeaway: boolean('accept_takeaway').notNull(),
  acceptDelivery: boolean('accept_delivery').notNull(),
  opensAt: text('opens_at').notNull(),
  closesAt: text('closes_at').notNull(),
  timezone: text('timezone').notNull(),
  taxRateBps: integer('tax_rate_bps').notNull(),
  nextOrderNumber: integer('next_order_number').notNull(),
  updatedAt: timestamps.updatedAt,
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id),
  status: orderStatusEnum('status').notNull(),
  channel: orderChannelEnum('channel').notNull(),
  subtotalCents: integer('subtotal_cents').notNull(),
  taxCents: integer('tax_cents').notNull(),
  totalCents: integer('total_cents').notNull(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: text('menu_item_id')
    .notNull()
    .references(() => menuItems.id),
  nameSnapshot: text('name_snapshot').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull(),
  lineTotalCents: integer('line_total_cents').notNull(),
});

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  orderItems: many(orderItems),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const schema = {
  menuCategories,
  menuItems,
  customers,
  settings,
  orders,
  orderItems,
  menuCategoriesRelations,
  menuItemsRelations,
  customersRelations,
  ordersRelations,
  orderItemsRelations,
};

export type DbSchema = typeof schema;

/** Used by migrate and tests so both Postgres and PGlite share one DDL. */
export const INIT_SQL = `
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS order_channel;

CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE order_channel AS ENUM ('dine_in', 'takeaway', 'delivery');

CREATE TABLE menu_categories (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE menu_items (
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES menu_categories(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents > 0),
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE settings (
  id text PRIMARY KEY,
  prep_time_minutes integer NOT NULL CHECK (prep_time_minutes > 0),
  auto_accept boolean NOT NULL,
  service_open boolean NOT NULL,
  accept_dine_in boolean NOT NULL,
  accept_takeaway boolean NOT NULL,
  accept_delivery boolean NOT NULL,
  opens_at text NOT NULL,
  closes_at text NOT NULL,
  timezone text NOT NULL,
  tax_rate_bps integer NOT NULL CHECK (tax_rate_bps >= 0),
  next_order_number integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  customer_id text NOT NULL REFERENCES customers(id),
  status order_status NOT NULL,
  channel order_channel NOT NULL,
  subtotal_cents integer NOT NULL,
  tax_cents integer NOT NULL,
  total_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id text NOT NULL REFERENCES menu_items(id),
  name_snapshot text NOT NULL,
  unit_price_cents integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_cents integer NOT NULL
);

CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
`;

export function applySchemaSql() {
  return sql.raw(INIT_SQL);
}
