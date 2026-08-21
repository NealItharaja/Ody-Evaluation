import { describe, expect, it } from 'vitest';

import { applyOrderAction } from '../src/lib/order-state';
import { computeOrderTotals } from '../src/lib/totals';

describe('computeOrderTotals', () => {
  it('rounds tax from basis points on the server', () => {
    expect(computeOrderTotals([{ unitPriceCents: 1999, quantity: 2 }], 875)).toEqual({
      subtotalCents: 3998,
      taxCents: 350,
      totalCents: 4348,
    });
  });
});

describe('applyOrderAction', () => {
  it('blocks completing a pending order', () => {
    expect(() => applyOrderAction('pending', 'complete')).toThrow(/Cannot complete/);
  });

  it('accepts a pending order', () => {
    expect(applyOrderAction('pending', 'accept')).toBe('accepted');
  });
});
