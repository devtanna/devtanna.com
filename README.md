# devtanna.com

A public, IndiePage-style portfolio: a profile header followed by side-project
cards, each showing live revenue (MRR badge + a 12-month area chart) pulled from
Stripe. Built with Next.js (App Router), Tailwind CSS, Recharts, Drizzle + Neon
Postgres, and deployed on Vercel.

## How it works

- **`src/config/site.ts`** is the one file you edit. It holds your profile and
  the `projects` array. Add a project by appending an object; attach Stripe
  revenue by listing that project's Stripe `priceIds` / `productIds`.
- A **sync job** (`src/lib/revenue/sync.ts`) reads Stripe (paid invoices +
  one-time Checkout Sessions for the chart, active subscriptions for the MRR
  badge), attributes revenue to projects via the config mapping, and upserts
  monthly snapshots + current MRR into Neon.
- **Vercel Cron** hits `GET /api/cron/sync-revenue` daily (see `vercel.json`).
- The **home page** reads the cached data from Neon and renders. Projects with
  no Stripe data still show (icon + name + tagline) — the badge and chart are
  simply hidden.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the three values
npm run db:push              # create the tables in Neon
npm run dev                  # http://localhost:3000
```

Trigger a revenue sync manually:

```bash
curl "http://localhost:3000/api/cron/sync-revenue?secret=$CRON_SECRET"
```

Without `DATABASE_URL` / `STRIPE_SECRET_KEY` the page still renders — it just
shows projects without revenue, which is handy for pure layout work. To preview
the full design (MRR badge + chart) with fake data before wiring Stripe/Neon,
run `PREVIEW_REVENUE=1 npm run dev`.

## Environment variables

See `.env.example`:

- `DATABASE_URL` — Neon pooled connection string.
- `STRIPE_SECRET_KEY` — a **restricted, read-only** Stripe key (`rk_...`) with
  read access to Products, Prices, Subscriptions, Invoices, Checkout Sessions.
- `CRON_SECRET` — guards the sync route.

## Deploying

1. Import the repo into Vercel; add the three env vars.
2. Point Vercel at your Neon database and run `npm run db:push` once (locally or
   via a one-off) so the tables exist.
3. Vercel Cron runs the daily sync automatically.
4. **DNS:** this domain previously served GitHub Pages. To move to Vercel, add
   the domain in the Vercel project and repoint DNS at your registrar (apex
   A/ALIAS + `www` CNAME) to Vercel. The old GitHub-Pages `CNAME` file is no
   longer used.

## Notes / assumptions (v1)

- Single Stripe account, single display currency.
- Chart amount = gross paid revenue attributed to mapped products; MRR badge =
  active-subscription MRR (one-time products show trailing revenue in the chart
  but no recurring MRR).
- Content and Stripe mapping live in `src/config/site.ts` — no admin UI.
