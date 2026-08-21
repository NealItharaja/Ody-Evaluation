/**
 * Formatting helpers shared by every surface. Money is always handled in
 * integer minor units (cents) to avoid float drift; only this module converts
 * to a display string.
 */

export function formatMoney(
  cents: number,
  { currency = 'USD', locale = 'en-US' }: { currency?: string; locale?: string } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Compact money for KPI tiles: $12.4k instead of $12,412.00. */
export function formatMoneyCompact(
  cents: number,
  { currency = 'USD', locale = 'en-US' }: { currency?: string; locale?: string } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(cents / 100);
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(ratio: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
    ratio,
  );
}

export function formatDateTime(input: string | Date, locale = 'en-US'): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(input: string | Date, locale = 'en-US'): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['second', 1000],
  ['minute', 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['week', 7 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['year', 365 * 24 * 60 * 60 * 1000],
];

export function formatRelativeTime(
  input: string | Date,
  now: Date = new Date(),
  locale = 'en-US',
): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const diff = date.getTime() - now.getTime();
  const absolute = Math.abs(diff);

  let unit: Intl.RelativeTimeFormatUnit = 'second';
  let divisor = 1000;
  for (const [candidateUnit, candidateDivisor] of RELATIVE_UNITS) {
    if (absolute >= candidateDivisor) {
      unit = candidateUnit;
      divisor = candidateDivisor;
    }
  }

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    Math.round(diff / divisor),
    unit,
  );
}

/** "3 items" / "1 item" without pulling in an i18n dependency. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
