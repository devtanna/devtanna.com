import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { trailingMonths, monthLabel } from "./format";

export type ChartPoint = { key: string; label: string; amount: number };

export type ProjectRevenue = {
  /** Current MRR in cents, or null when there's no synced data. */
  mrrCents: number | null;
  currency: string;
  /** Trailing 12-month series (oldest first), or empty when no data. */
  chart: ChartPoint[];
};

export type RevenueBySlug = Record<string, ProjectRevenue>;

/** Flat trailing-12-month zero series, so cards with no revenue still show a chart. */
export function emptyChart(): ChartPoint[] {
  return trailingMonths(12).map((key) => ({
    key,
    label: monthLabel(key),
    amount: 0,
  }));
}

/** Layout-preview only: fake data when PREVIEW_REVENUE=1 (no DB/Stripe needed). */
function mockRevenue(): {
  bySlug: RevenueBySlug;
  totalMrrCents: number;
  currency: string;
} {
  const months = trailingMonths(12);
  const shape = [12, 18, 30, 24, 22, 16, 12, 9, 7, 11, 9, 6];
  const chart = months.map((key, i) => ({
    key,
    label: monthLabel(key),
    amount: shape[i] * 1000,
  }));
  return {
    bySlug: {
      "placeholder-project": { mrrCents: 950000, currency: "usd", chart },
    },
    totalMrrCents: 9060000,
    currency: "usd",
  };
}

/**
 * Load synced revenue for all projects from Neon. Returns an empty map when the
 * DB isn't configured, so the page renders (without badges/charts) regardless.
 */
export async function getRevenue(): Promise<{
  bySlug: RevenueBySlug;
  totalMrrCents: number;
  currency: string;
}> {
  if (process.env.PREVIEW_REVENUE === "1") return mockRevenue();

  const db = getDb();
  if (!db) return { bySlug: {}, totalMrrCents: 0, currency: "usd" };

  try {
    const [snapshots, stats] = await Promise.all([
      db
        .select()
        .from(schema.revenueSnapshots)
        .orderBy(asc(schema.revenueSnapshots.month)),
      db.select().from(schema.projectStats),
    ]);

    const months = trailingMonths(12);
    const bySlug: RevenueBySlug = {};
    let totalMrrCents = 0;
    let currency = "usd";

    // group snapshot amounts by slug -> month
    const grouped = new Map<string, Map<string, number>>();
    for (const row of snapshots) {
      const monthStr =
        typeof row.month === "string"
          ? row.month
          : new Date(row.month).toISOString().slice(0, 10);
      if (!grouped.has(row.projectSlug)) grouped.set(row.projectSlug, new Map());
      grouped.get(row.projectSlug)!.set(monthStr, row.amountCents);
      currency = row.currency;
    }

    for (const stat of stats) {
      currency = stat.currency;
      const inner = grouped.get(stat.projectSlug);
      const chart: ChartPoint[] = inner
        ? months.map((key) => ({
            key,
            label: monthLabel(key),
            amount: (inner.get(key) ?? 0) / 100,
          }))
        : [];
      const hasData = chart.some((p) => p.amount > 0) || stat.mrrCents > 0;
      bySlug[stat.projectSlug] = {
        mrrCents: hasData ? stat.mrrCents : null,
        currency: stat.currency,
        chart: hasData ? chart : [],
      };
      totalMrrCents += stat.mrrCents;
    }

    return { bySlug, totalMrrCents, currency };
  } catch (err) {
    // Table may not exist yet (migration not run) — degrade gracefully.
    console.warn("[revenue] read failed:", err);
    return { bySlug: {}, totalMrrCents: 0, currency: "usd" };
  }
}
