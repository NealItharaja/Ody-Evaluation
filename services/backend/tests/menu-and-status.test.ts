import { describe, expect, it } from 'vitest';

import { json, makeTestApp } from './helpers';

describe('order state unit', () => {
  it('exposes only legal actions on a completed ticket', async () => {
    const { app } = await makeTestApp();
    const response = await app.request('/orders/o_4');
    expect(response.status).toBe(200);
    const body = await json<{ status: string; allowedActions: string[]; totalCents: number }>(
      response,
    );
    expect(body.status).toBe('completed');
    expect(body.allowedActions).toEqual([]);
    expect(body.totalCents).toBeGreaterThan(0);
  });
});

describe('menu availability', () => {
  it('can mark an item unavailable and then refuse it on an order', async () => {
    const { app } = await makeTestApp();
    const patched = await app.request('/menu/items/m_1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ available: false }),
    });
    expect(patched.status).toBe(200);

    const order = await app.request('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'c_1',
        channel: 'dine_in',
        items: [{ menuItemId: 'm_1', quantity: 1 }],
      }),
    });
    expect(order.status).toBe(422);
  });
});
