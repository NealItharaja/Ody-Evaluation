/** ISO-8601 timestamp string, as returned by the API. */
export type IsoDateTime = string;

/**
 * Money is always transported as an integer number of minor units (cents).
 * The branded type stops a dollars value being passed where cents are expected.
 */
export type Cents = number & { readonly __brand: 'Cents' };

export function cents(value: number): Cents {
  if (!Number.isInteger(value))
    throw new RangeError(`Money must be an integer of cents, got ${value}`);
  return value as Cents;
}

export function dollarsToCents(dollars: number): Cents {
  return cents(Math.round(dollars * 100));
}

export type SortDirection = 'asc' | 'desc';

export type Paginated<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};
