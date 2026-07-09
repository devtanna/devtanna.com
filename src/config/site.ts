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
  /**
   * Revenue model. Default "recurring".
   * - "recurring": headline badge = current MRR from active subscriptions.
   * - "one_time": headline badge = this month's sales (paid invoices/checkout).
   * Either way the chart shows the trailing 12 months of monthly revenue.
   */
  type?: "recurring" | "one_time";
};

/** Status tag shown on a project card. */
export type ProjectStatus = "active" | "building" | "discontinued" | "acquired";

export type Project = {
  /** Stable unique key; used to store revenue rows. Don't change once live. */
  slug: string;
  /** Display name shown on the card. */
  name: string;
  /** One-line description under the name. */
  tagline: string;
  /** Fallback emoji for the icon tile when the site favicon can't be loaded. */
  icon: string;
  /** Background color for the icon tile. */
  iconBg?: string;
  /** Link opened when the card is clicked. The site's favicon is used as the icon. */
  url?: string;
  /** Status tag: "active" | "building" | "discontinued" | "acquired". */
  status?: ProjectStatus;
  /** Which Stripe products/prices roll up into this project's revenue. */
  stripe?: StripeMapping;
};

/** Social profile links shown under the bio. Omit any you don't want. */
export type Socials = {
  twitter?: string;
  github?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;
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
  /** Social profile links shown under the bio. */
  socials?: Socials;
  projects: Project[];
};

export const site: SiteConfig = {
  name: "Dev Tanna",
  tagline: "Builder of products & problem solver",
  description:
    "Dev Tanna — builder of products and problem solver. A live look at my side projects and their revenue.",
  location: "Munich",
  avatar: "/avatar.jpg",
  monthlyRevenue: "€ 300/m",
  url: "https://devtanna.com",
  // Update these to your own handles (remove any you don't use).
  socials: {
    twitter: "https://x.com/dev_in_tech",
    github: "https://github.com/devtanna",
    linkedin: "https://www.linkedin.com/in/devtanna",
  },
  projects: [
    {
      slug: "german-language-practice",
      name: "German Language Practice",
      tagline: "Prepare for your Telc or Goethe exam with mock exams and exercises.",
      icon: "📝",
      iconBg: "#111827",
      url: "https://www.germanlanguagepractice.com",
      status: "active",
      // Attach Stripe revenue by listing the IDs, e.g.:
      stripe: {
        productIds: ["prod_SdCqaYb1eyHm8L", "prod_ScPsiL2eTtW14Z", "prod_ScLzk6jgCiou5U", "prod_S66mImcI1wmfRt"],
        priceIds: ["price_1RBuYlGoTXHj58pJuG2Wb9RN", "price_1Rh7H8GoTXHj58pJ6ABix341", "price_1RhB3DGoTXHj58pJdkNGxwrn", "price_1RhwQtGoTXHj58pJ4uNmdbxq"],
        type: "one_time",
      },
    },
    {
      slug: "parseflow-io",
      name: "ParseFlow.io",
      tagline: "A private offline-first AI powered document parsing MacOSX app for your PDFs, Docs, and more.",
      icon: "�",
      iconBg: "#111827",
      url: "https://www.parseflow.io",
      status: "active",
      stripe: {
        productIds: ["prod_UOWYALDV5FTPfI"],
        priceIds: ["price_1TPjVnGoTXHj58pJM6WZBUAT"],
        type: "one_time",
      },
    },
    {
      slug: "reply-hey",
      name: "Reply Hey",
      tagline: "Forms, inbound email, and AI-assisted replies—one workflow for teams that live on inbound demand.",
      icon: "�",
      iconBg: "#111827",
      url: "https://www.replyhey.com",
      status: "active",
      // Attach Stripe revenue by listing the IDs, e.g.:
    },
  ],
};
