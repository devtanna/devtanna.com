import type Stripe from "stripe";
import { sql } from "drizzle-orm";
import { getStripe } from "@/lib/stripe/client";
import { getDb, schema } from "@/lib/db/client";
import { site, type Project } from "@/config/site";
import { monthKey, trailingMonths } from "./format";

const MONTHS = 12;

type ProjectLookup = {
  /** productId -> projectSlug */
  byProduct: Map<string, string>;
  /** priceId -> projectSlug */
  byPrice: Map<string, string>;
};

/**
 * Build product/price -> project maps from config. Price IDs are resolved to
 * their products so that revenue keyed by either dimension attributes correctly.
 */
async function buildLookup(stripe: Stripe): Promise<ProjectLookup> {
  const byProduct = new Map<string, string>();
  const byPrice = new Map<string, string>();

  for (const project of site.projects) {
    const map = project.stripe;
    if (!map) continue;
    for (const productId of map.productIds ?? []) {
      byProduct.set(productId, project.slug);
    }
    for (const priceId of map.priceIds ?? []) {
      byPrice.set(priceId, project.slug);
      try {
        const price = await stripe.prices.retrieve(priceId);
        const product =
          typeof price.product === "string" ? price.product : price.product?.id;
        if (product) byProduct.set(product, project.slug);
      } catch (err) {
        console.warn(`[sync] could not resolve price ${priceId}:`, err);
      }
    }
  }

  return { byProduct, byPrice };
}

function resolveSlug(
  lookup: ProjectLookup,
  priceId: string | null | undefined,
  productId: string | null | undefined,
): string | null {
  if (priceId && lookup.byPrice.has(priceId))
    return lookup.byPrice.get(priceId)!;
  if (productId && lookup.byProduct.has(productId))
    return lookup.byProduct.get(productId)!;
  return null;
}

type Buckets = Map<string, Map<string, number>>; // slug -> (monthKey -> cents)

function addToBucket(
  buckets: Buckets,
  slug: string,
  month: string,
  cents: number,
) {
  if (!buckets.has(slug)) buckets.set(slug, new Map());
  const inner = buckets.get(slug)!;
  inner.set(month, (inner.get(month) ?? 0) + cents);
}

/**
 * Monthly revenue for the trailing 12 months, attributed to projects.
 *
 * Sources (de-duplicated to avoid double counting):
 *  - Paid invoices → covers all subscription revenue + invoiced one-time sales.
 *  - Paid Checkout Sessions with NO invoice → covers one-time payments that
 *    don't generate an invoice (typical for Payment Links / one-off Checkout).
 */
async function collectMonthly(
  stripe: Stripe,
  lookup: ProjectLookup,
): Promise<{ buckets: Buckets; currency: string }> {
  const buckets: Buckets = new Map();
  const windowStart = Math.floor(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - (MONTHS - 1), 1) /
      1000,
  );
  let currency = "usd";

  // 1) Paid invoices
  for await (const invoice of stripe.invoices.list({
    status: "paid",
    created: { gte: windowStart },
    limit: 100,
    expand: ["data.lines.data.price"],
  })) {
    const ts = invoice.status_transitions?.paid_at ?? invoice.created;
    const month = monthKey(new Date(ts * 1000));
    if (invoice.currency) currency = invoice.currency;
    for (const line of invoice.lines.data) {
      const price = line.price as Stripe.Price | null;
      const priceId = price?.id ?? null;
      const productId =
        price && typeof price.product === "string"
          ? price.product
          : (price?.product as Stripe.Product | undefined)?.id ?? null;
      const slug = resolveSlug(lookup, priceId, productId);
      if (slug) addToBucket(buckets, slug, month, line.amount);
    }
  }

  // 2) Paid Checkout Sessions without an invoice (one-time payments)
  for await (const session of stripe.checkout.sessions.list({
    created: { gte: windowStart },
    limit: 100,
    expand: ["data.line_items", "data.line_items.data.price"],
  })) {
    if (session.payment_status !== "paid") continue;
    if (session.invoice) continue; // counted via invoices above
    const month = monthKey(new Date(session.created * 1000));
    if (session.currency) currency = session.currency;
    const lineItems = session.line_items?.data ?? [];
    for (const item of lineItems) {
      const price = item.price as Stripe.Price | null;
      const priceId = price?.id ?? null;
      const productId =
        price && typeof price.product === "string"
          ? price.product
          : (price?.product as Stripe.Product | undefined)?.id ?? null;
      const slug = resolveSlug(lookup, priceId, productId);
      if (slug) addToBucket(buckets, slug, month, item.amount_total ?? 0);
    }
  }

  return { buckets, currency };
}

/** Normalize a subscription item's amount to a monthly figure (in cents). */
function monthlyAmount(price: Stripe.Price, quantity: number): number {
  const unit = price.unit_amount ?? 0;
  const interval = price.recurring?.interval;
  const count = price.recurring?.interval_count ?? 1;
  let perMonth = unit;
  if (interval === "year") perMonth = unit / (12 * count);
  else if (interval === "week") perMonth = (unit * 52) / 12 / count;
  else if (interval === "day") perMonth = (unit * 365) / 12 / count;
  else perMonth = unit / count; // month
  return Math.round(perMonth * quantity);
}

/** Current MRR per project from active subscriptions. */
async function collectMrr(
  stripe: Stripe,
  lookup: ProjectLookup,
): Promise<Map<string, number>> {
  const mrr = new Map<string, number>();
  for await (const subscription of stripe.subscriptions.list({
    status: "active",
    limit: 100,
    expand: ["data.items.data.price"],
  })) {
    for (const item of subscription.items.data) {
      const price = item.price;
      const productId =
        typeof price.product === "string" ? price.product : price.product?.id;
      const slug = resolveSlug(lookup, price.id, productId ?? null);
      if (!slug) continue;
      const amount = monthlyAmount(price, item.quantity ?? 1);
      mrr.set(slug, (mrr.get(slug) ?? 0) + amount);
    }
  }
  return mrr;
}

export type SyncResult = {
  ok: boolean;
  reason?: string;
  projectsSynced?: number;
  monthsWritten?: number;
};

/**
 * Pull revenue from Stripe and upsert it into Neon. Idempotent: safe to run on
 * every cron tick; it backfills the trailing 12 months and refreshes MRR.
 */
export async function syncRevenue(): Promise<SyncResult> {
  const stripe = getStripe();
  const db = getDb();
  if (!stripe) return { ok: false, reason: "STRIPE_SECRET_KEY not set" };
  if (!db) return { ok: false, reason: "DATABASE_URL not set" };

  const lookup = await buildLookup(stripe);
  if (lookup.byProduct.size === 0 && lookup.byPrice.size === 0) {
    return { ok: true, reason: "no Stripe mappings in config", projectsSynced: 0 };
  }

  const [{ buckets, currency }, mrr] = await Promise.all([
    collectMonthly(stripe, lookup),
    collectMrr(stripe, lookup),
  ]);

  const months = trailingMonths(MONTHS);
  const snapshotRows: (typeof schema.revenueSnapshots.$inferInsert)[] = [];

  // Write a row for every (mapped project, month) — zero-filled — so charts
  // render a continuous 12-month line even for months with no sales.
  const mappedSlugs = new Set<string>([
    ...Array.from(lookup.byProduct.values()),
    ...Array.from(lookup.byPrice.values()),
  ]);

  for (const slug of mappedSlugs) {
    const inner = buckets.get(slug);
    for (const month of months) {
      snapshotRows.push({
        id: `${slug}:${month}`,
        projectSlug: slug,
        month,
        amountCents: inner?.get(month) ?? 0,
        currency,
      });
    }
  }

  if (snapshotRows.length > 0) {
    await db
      .insert(schema.revenueSnapshots)
      .values(snapshotRows)
      .onConflictDoUpdate({
        target: schema.revenueSnapshots.id,
        set: {
          amountCents: sql`excluded.amount_cents`,
          currency: sql`excluded.currency`,
          updatedAt: sql`now()`,
        },
      });
  }

  const statRows = Array.from(mappedSlugs).map((slug) => ({
    projectSlug: slug,
    mrrCents: mrr.get(slug) ?? 0,
    currency,
  }));

  if (statRows.length > 0) {
    await db
      .insert(schema.projectStats)
      .values(statRows)
      .onConflictDoUpdate({
        target: schema.projectStats.projectSlug,
        set: {
          mrrCents: sql`excluded.mrr_cents`,
          currency: sql`excluded.currency`,
          updatedAt: sql`now()`,
        },
      });
  }

  return {
    ok: true,
    projectsSynced: mappedSlugs.size,
    monthsWritten: snapshotRows.length,
  };
}
