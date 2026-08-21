import { z } from '@hono/zod-openapi';
import { createSchemaFactory } from 'drizzle-zod';

import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  ORDER_ACTIONS,
  ORDER_CHANNELS,
  ORDER_STATUSES,
  orders,
  settings,
} from '../db/schema';

const { createSelectSchema, createInsertSchema, createUpdateSchema } = createSchemaFactory({
  zodInstance: z,
});

const ErrorBodySchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.string(), z.array(z.string())).optional(),
    }),
  })
  .openapi('ApiErrorBody');

export const errorResponses = {
  400: {
    description: 'Validation failed',
    content: { 'application/json': { schema: ErrorBodySchema } },
  },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorBodySchema } } },
  409: { description: 'Conflict', content: { 'application/json': { schema: ErrorBodySchema } } },
  422: {
    description: 'Unprocessable',
    content: { 'application/json': { schema: ErrorBodySchema } },
  },
} as const;

export const OrderStatusSchema = z.enum(ORDER_STATUSES).openapi('OrderStatus');
export const OrderChannelSchema = z.enum(ORDER_CHANNELS).openapi('OrderChannel');
export const OrderActionSchema = z.enum(ORDER_ACTIONS).openapi('OrderAction');

export const MenuCategorySelect = createSelectSchema(menuCategories).openapi('MenuCategory');
export const MenuItemSelect = createSelectSchema(menuItems).openapi('MenuItem');
export const CustomerSelect = createSelectSchema(customers).openapi('Customer');
export const SettingsSelect = createSelectSchema(settings).openapi('Settings');
export const OrderSelect = createSelectSchema(orders).openapi('Order');
export const OrderItemSelect = createSelectSchema(orderItems).openapi('OrderItem');

export const MenuItemCreate = createInsertSchema(menuItems)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .openapi('MenuItemCreate');

export const MenuItemPatch = createUpdateSchema(menuItems)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .openapi('MenuItemPatch');

export const MenuCategoryCreate = createInsertSchema(menuCategories)
  .pick({ name: true, sortOrder: true })
  .openapi('MenuCategoryCreate');

export const SettingsPatch = createUpdateSchema(settings)
  .omit({ id: true, nextOrderNumber: true, updatedAt: true })
  .openapi('SettingsPatch');

export const MenuItemWithCategory = MenuItemSelect.extend({
  categoryName: z.string(),
}).openapi('MenuItemWithCategory');

export const MenuCategoryWithItems = MenuCategorySelect.extend({
  items: z.array(MenuItemSelect),
}).openapi('MenuCategoryWithItems');

export const OrderListItem = OrderSelect.pick({
  id: true,
  reference: true,
  status: true,
  channel: true,
  totalCents: true,
  createdAt: true,
})
  .extend({
    customerName: z.string(),
    itemCount: z.number().int(),
  })
  .openapi('OrderListItem');

export const OrderDetail = OrderSelect.extend({
  customerName: z.string(),
  customerEmail: z.string(),
  allowedActions: z.array(OrderActionSchema),
  items: z.array(
    OrderItemSelect.pick({
      id: true,
      menuItemId: true,
      nameSnapshot: true,
      unitPriceCents: true,
      quantity: true,
      lineTotalCents: true,
    }),
  ),
}).openapi('OrderDetail');

export const CreateOrderItem = z
  .object({
    menuItemId: z.string().min(1),
    quantity: z.number().int().min(1).max(50),
  })
  .openapi('CreateOrderItem');

export const CreateOrder = z
  .object({
    customerId: z.string().min(1).optional(),
    customer: z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
      })
      .optional(),
    channel: OrderChannelSchema,
    items: z.array(CreateOrderItem).min(1),
  })
  .refine((value) => Boolean(value.customerId || value.customer), {
    message: 'Provide customerId or customer',
    path: ['customerId'],
  })
  .openapi('CreateOrder');

export const OrderActionRequest = z
  .object({
    action: OrderActionSchema,
  })
  .openapi('OrderActionRequest');

export const OrderList = z
  .object({
    items: z.array(OrderListItem),
    total: z.number().int(),
    openCount: z.number().int(),
    completedCount: z.number().int(),
    cancelledCount: z.number().int(),
  })
  .openapi('OrderList');

export const CustomerListItem = CustomerSelect.extend({
  orderCount: z.number().int(),
  lifetimeSpendCents: z.number().int(),
  lastOrderAt: z.string().nullable(),
}).openapi('CustomerListItem');

export const CustomerList = z
  .object({
    items: z.array(CustomerListItem),
    total: z.number().int(),
    lifetimeSpendCents: z.number().int(),
    repeatRate: z.number(),
  })
  .openapi('CustomerList');

export const CustomerDetail = CustomerListItem.extend({
  recentOrders: z.array(OrderListItem),
}).openapi('CustomerDetail');

export const PopularItem = z
  .object({
    menuItemId: z.string(),
    name: z.string(),
    categoryName: z.string(),
    priceCents: z.number().int(),
    quantitySold: z.number().int(),
  })
  .openapi('PopularItem');

export const Summary = z
  .object({
    ordersToday: z.number().int(),
    revenueCents: z.number().int(),
    openOrders: z.number().int(),
    averageOrderCents: z.number().int(),
    popularItems: z.array(PopularItem),
    liveOrders: z.array(OrderListItem),
  })
  .openapi('Summary');

export const IdParam = z.object({
  id: z
    .string()
    .min(1)
    .openapi({ param: { name: 'id', in: 'path' } }),
});

export const OrderListQuery = z.object({
  status: z
    .enum(['open', ...ORDER_STATUSES])
    .optional()
    .openapi({ param: { name: 'status', in: 'query' } }),
  channel: OrderChannelSchema.optional().openapi({ param: { name: 'channel', in: 'query' } }),
  search: z
    .string()
    .optional()
    .openapi({ param: { name: 'search', in: 'query' } }),
});

export const SearchQuery = z.object({
  search: z
    .string()
    .optional()
    .openapi({ param: { name: 'search', in: 'query' } }),
});
