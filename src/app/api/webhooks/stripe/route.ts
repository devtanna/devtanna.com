import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { getDb, schema } from "@/lib/db/client";
import { getXClient } from "@/lib/x/client";
import { site } from "@/config/site";

// Stripe signature verification + the X client both need Node APIs, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// productId | priceId -> project slug, built once from config. No Stripe
// round-trips at request time. Mirrors resolveSlug() in lib/revenue/sync.ts.
// ponytail: naive config map; a sale on an unmapped price just won't tweet.
const slugByStripeId = new Map<string, string>();
for (const p of site.projects) {
  for (const id of p.stripe?.productIds ?? []) slugByStripeId.set(id, p.slug);
  for (const id of p.stripe?.priceIds ?? []) slugByStripeId.set(id, p.slug);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response("Stripe not configured", { status: 200 });
  }

  const body = await req.text(); // raw body — required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      req.headers.get("stripe-signature") ?? "",
      secret,
    );
  } catch (err) {
    console.warn("[webhook] signature verification failed:", err);
    return new Response("Bad signature", { status: 200 });
  }

  // One event covers both one-time purchases and new subscriptions.
  if (event.type !== "checkout.session.completed") {
    return new Response("ignored", { status: 200 });
  }

  // Idempotency: Stripe delivers at-least-once. Record the event before doing
  // any work; if it's already there, a retry is in flight — don't tweet again.
  const db = getDb();
  if (db) {
    const inserted = await db
      .insert(schema.processedEvents)
      .values({ eventId: event.id })
      .onConflictDoNothing()
      .returning({ eventId: schema.processedEvents.eventId });
    if (inserted.length === 0) {
      return new Response("duplicate", { status: 200 });
    }
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid" || (session.amount_total ?? 0) <= 0) {
    return new Response("no charge", { status: 200 }); // skips €0 trials
  }

  // Which project did this sale belong to? Match its product/price to config.
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price"],
  });
  let slug: string | undefined;
  for (const item of lineItems.data) {
    const price = item.price;
    const productId =
      typeof price?.product === "string" ? price.product : price?.product?.id;
    slug =
      (productId ? slugByStripeId.get(productId) : undefined) ??
      (price?.id ? slugByStripeId.get(price.id) : undefined);
    if (slug) break;
  }

  const project = slug
    ? site.projects.find((p) => p.slug === slug)
    : undefined;
  if (!project) {
    console.log(`[webhook] sale ${session.id} matched no project — no tweet`);
    return new Response("unmapped", { status: 200 });
  }

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (session.currency ?? "usd").toUpperCase(),
  }).format((session.amount_total ?? 0) / 100);
  const text = `💰 New sale on ${project.name}! +${money}\n\n${project.url ?? site.url}`;

  const x = getXClient();
  if (!x) {
    // No X creds (e.g. local dev) — dry-run the tweet so testing can't post.
    console.log(`[x] would tweet: ${text}`);
    return new Response("dry-run", { status: 200 });
  }

  try {
    await x.v2.tweet(text);
    console.log(`[x] tweeted sale for ${project.slug}`);
  } catch (err) {
    // Already recorded in processed_events, so returning 200 (no Stripe retry)
    // means at-most-once: prefer a missed tweet over a duplicate public post.
    console.error(`[x] tweet failed for ${project.slug}:`, err);
  }

  return new Response("ok", { status: 200 });
}
