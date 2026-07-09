/** Money + date formatting helpers shared by the sync job and the UI. */

/** First day of the month (UTC) for a given Date, as a `YYYY-MM-DD` string. */
export function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** The trailing `count` month keys ending with the current month (oldest first). */
export function trailingMonths(count: number, now = new Date()): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(monthKey(d));
  }
  return out;
}

/** Short month label like "Aug" for a `YYYY-MM-DD` key. */
export function monthLabel(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  return d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
}

const CURRENCY_SYMBOL: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOL[currency.toLowerCase()] ?? "$";
}

/**
 * Compact money formatting, IndiePage style:
 *   9500  -> "$9.5k"
 *   30000 -> "$30k"
 *   250   -> "$250"
 *   90600 -> "$90.6k"
 */
export function formatCompactMoney(cents: number, currency = "usd"): string {
  const sym = currencySymbol(currency);
  const amount = Math.round(cents) / 100;
  const abs = Math.abs(amount);

  if (abs >= 1_000_000) {
    return `${sym}${trimZero(amount / 1_000_000)}M`;
  }
  if (abs >= 1_000) {
    return `${sym}${trimZero(amount / 1_000)}k`;
  }
  return `${sym}${Math.round(amount)}`;
}

function trimZero(n: number): string {
  // one decimal, but drop a trailing ".0"
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

/** "$9.5k/mo" for the MRR badge. */
export function formatMrr(cents: number, currency = "usd"): string {
  return `${formatCompactMoney(cents, currency)}/mo`;
}

/** "$90.6k/month" for the profile headline. */
export function formatMonthly(cents: number, currency = "usd"): string {
  return `${formatCompactMoney(cents, currency)}/month`;
}
