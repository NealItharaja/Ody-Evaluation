import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { settings } from '../src/db/schema';
import { json, makeTestApp } from './helpers';

describe('order flows', () => {
  it('rejects an empty item list', async () => {
    const { app } = await makeTestApp();
    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_1',
        channel: 'dine_in',
        items: [],
      }),
    });
    expect(response.status).toBe(400);
    const body = await json<{ error: { code: string } }>(response);
    expect(body.error.code).toBe('validation_failed');
  });

  it('rejects unavailable menu items', async () => {
    const { app } = await makeTestApp();
    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_1',
        channel: 'dine_in',
        items: [{ menuItemId: 'm_4', quantity: 1 }],
      }),
    });
    expect(response.status).toBe(422);
    const body = await json<{ error: { code: string; message: string } }>(response);
    expect(body.error.code).toBe('order.unavailable_item');
    expect(body.error.message).toMatch(/Pappardelle/i);
  });

  it('rejects unknown menu items', async () => {
    const { app } = await makeTestApp();
    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_1',
        channel: 'dine_in',
        items: [{ menuItemId: 'does-not-exist', quantity: 1 }],
      }),
    });
    expect(response.status).toBe(422);
    const body = await json<{ error: { code: string } }>(response);
    expect(body.error.code).toBe('order.unknown_item');
  });

  it('calculates totals server-side from catalog prices', async () => {
    const { app } = await makeTestApp();
    // 1400 + 2*2400 = 6200 subtotal, 8.75% tax = 543, total 6743
    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_1',
        channel: 'dine_in',
        items: [
          { menuItemId: 'm_1', quantity: 1 },
          { menuItemId: 'm_3', quantity: 2 },
        ],
      }),
    });
    expect(response.status).toBe(201);
    const body = await json<{
      subtotalCents: number;
      taxCents: number;
      totalCents: number;
      status: string;
      allowedActions: string[];
      items: Array<{ unitPriceCents: number; lineTotalCents: number }>;
    }>(response);
    expect(body.subtotalCents).toBe(6200);
    expect(body.taxCents).toBe(543);
    expect(body.totalCents).toBe(6743);
    expect(body.items[0]?.unitPriceCents).toBe(1400);
    expect(body.items[1]?.lineTotalCents).toBe(4800);
    // Seed auto-accepts, so the ticket skips pending.
    expect(body.status).toBe('accepted');
    expect(body.allowedActions).toEqual(['start_preparing', 'cancel']);
  });

  it('refuses a client-controlled status field — only named actions move an order', async () => {
    const { app } = await makeTestApp();
    const created = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_1',
        channel: 'takeaway',
        items: [{ menuItemId: 'm_5', quantity: 1 }],
        status: 'completed',
      }),
    });
    const order = await json<{ id: string; status: string }>(created);
    expect(order.status).toBe('accepted');

    const illegal = await app.request(`/orders/${order.id}/actions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'complete' }),
    });
    expect(illegal.status).toBe(409);
    const body = await json<{ error: { code: string } }>(illegal);
    expect(body.error.code).toBe('order.invalid_transition');
  });

  it('applies a legal status action', async () => {
    const { app } = await makeTestApp();
    const created = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_2',
        channel: 'dine_in',
        items: [{ menuItemId: 'm_3', quantity: 1 }],
      }),
    });
    const order = await json<{ id: string }>(created);

    const preparing = await app.request(`/orders/${order.id}/actions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'start_preparing' }),
    });
    expect(preparing.status).toBe(200);
    const body = await json<{ status: string; allowedActions: string[] }>(preparing);
    expect(body.status).toBe('preparing');
    expect(body.allowedActions).toEqual(['mark_ready', 'cancel']);
  });

  it('rejects orders when the location is closed', async () => {
    const { app, db } = await makeTestApp();
    await db.update(settings).set({ serviceOpen: false }).where(eq(settings.id, 'default'));
    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_1',
        channel: 'dine_in',
        items: [{ menuItemId: 'm_1', quantity: 1 }],
      }),
    });
    expect(response.status).toBe(422);
    const body = await json<{ error: { code: string } }>(response);
    expect(body.error.code).toBe('ordering.service_closed');
  });

  it('lands in pending when auto-accept is off', async () => {
    const { app, db } = await makeTestApp();
    await db.update(settings).set({ autoAccept: false }).where(eq(settings.id, 'default'));
    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_3',
        channel: 'takeaway',
        items: [{ menuItemId: 'm_1', quantity: 1 }],
      }),
    });
    const body = await json<{ status: string; allowedActions: string[] }>(response);
    expect(body.status).toBe('pending');
    expect(body.allowedActions).toEqual(['accept', 'cancel']);
  });
});
