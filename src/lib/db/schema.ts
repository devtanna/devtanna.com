import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * One row per (project, month) = net revenue in cents for that calendar month.
 * Powers the area chart on each project card.
 */
export const revenueSnapshots = pgTable(
  "revenue_snapshots",
  {
    id: text("id").primaryKey(), // `${projectSlug}:${YYYY-MM}`
    projectSlug: text("project_slug").notNull(),
    month: date("month").notNull(), // first day of the month
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("usd"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    projectMonthIdx: uniqueIndex("revenue_project_month_idx").on(
      t.projectSlug,
      t.month,
    ),
  }),
);

/**
 * Current headline stats per project = the MRR badge value.
 */
export const projectStats = pgTable("project_stats", {
  projectSlug: text("project_slug").primaryKey(),
  mrrCents: integer("mrr_cents").notNull().default(0),
  currency: text("currency").notNull().default("usd"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Stripe event IDs we've already handled — guards the sale-tweet webhook
 * (src/app/api/webhooks/stripe) against Stripe's at-least-once delivery so a
 * retry can't double-post a tweet.
 */
export const processedEvents = pgTable("processed_events", {
  eventId: text("event_id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type RevenueSnapshot = typeof revenueSnapshots.$inferSelect;
export type ProjectStat = typeof projectStats.$inferSelect;
