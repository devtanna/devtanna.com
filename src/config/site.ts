/**
 * Site configuration — this is the ONE file you edit to manage the page.
 *
 * Add a side project by pushing another object onto `projects`. To attach
 * Stripe revenue to a project, list its Stripe price and/or product IDs under
 * `stripe`. Projects with no Stripe IDs (or no synced revenue) still render —
 * they just show without the MRR badge and chart.
 */

export type StripeMapping = {
  /** Stripe Price IDs (price_...) that belong to this project. */
  priceIds?: string[];
  /** Stripe Product IDs (prod_...) that belong to this project. */
  productIds?: string[];
};

export type Project = {
  /** Stable unique key; used to store revenue rows. Don't change once live. */
  slug: string;
  /** Display name shown on the card. */
  name: string;
  /** One-line description under the name. */
  tagline: string;
  /** Emoji shown in the rounded icon tile (or set `iconBg` for a color). */
  icon: string;
  /** Background color for the icon tile. */
  iconBg?: string;
  /** Link opened when the card is clicked. */
  url?: string;
  /** Which Stripe products/prices roll up into this project's revenue. */
  stripe?: StripeMapping;
};

export type SiteConfig = {
  name: string;
  /** Short italic tagline under the name. */
  tagline: string;
  /** Longer description (used for SEO/meta). */
  description: string;
  location: string;
  /** Avatar image in /public. */
  avatar: string;
  /**
   * How to display the headline revenue number next to the money icon.
   * - "auto": sum of all projects' current MRR, computed from synced data.
   * - a string: shown verbatim (e.g. "$90.6k/month").
   */
  monthlyRevenue: "auto" | string;
  /** The public URL of this page (used by the share button). */
  url: string;
  projects: Project[];
};

export const site: SiteConfig = {
  name: "Dev Tanna",
  tagline: "Builder of products & problem solver",
  description:
    "Dev Tanna — builder of products and problem solver. A live look at my side projects and their revenue.",
  location: "Prague",
  avatar: "/avatar.jpg",
  monthlyRevenue: "auto",
  url: "https://devtanna.com",
  projects: [
    {
      slug: "placeholder-project",
      name: "Placeholder Project",
      tagline: "Swap this out for your own — edit src/config/site.ts",
      icon: "🚀",
      iconBg: "#111827",
      url: "https://devtanna.com",
      // Attach Stripe revenue by listing the IDs, e.g.:
      // stripe: { productIds: ["prod_abc123"], priceIds: ["price_abc123"] },
    },
  ],
};
