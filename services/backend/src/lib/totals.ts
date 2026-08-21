/**
 * Totals are always computed server-side from snapped unit prices. The client
 * never supplies a total we would trust.
 */
export function lineTotalCents(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity;
}

export function computeOrderTotals(
  lines: readonly { unitPriceCents: number; quantity: number }[],
  taxRateBps: number,
): { subtotalCents: number; taxCents: number; totalCents: number } {
  const subtotalCents = lines.reduce(
    (sum, line) => sum + lineTotalCents(line.unitPriceCents, line.quantity),
    0,
  );
  const taxCents = Math.round((subtotalCents * taxRateBps) / 10_000);
  return {
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
  };
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
