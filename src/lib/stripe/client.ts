import Stripe from "stripe";

/**
 * Returns a Stripe client, or `null` when STRIPE_SECRET_KEY is not configured.
 * Use a RESTRICTED, READ-ONLY key (rk_...). Server-only.
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}
