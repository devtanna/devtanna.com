/* eslint-disable @next/next/no-img-element */
import { site } from "@/config/site";
import {
  PinIcon,
  MoneyIcon,
  TwitterIcon,
  GithubIcon,
  LinkedinIcon,
  YoutubeIcon,
  InstagramIcon,
} from "./icons";
import { formatMonthly } from "@/lib/revenue/format";

const SOCIAL_ICONS = {
  twitter: TwitterIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
} as const;

export function ProfileHeader({
  totalMrrCents,
  currency,
}: {
  totalMrrCents: number;
  currency: string;
}) {
  const revenue =
    site.monthlyRevenue === "auto"
      ? totalMrrCents > 0
        ? formatMonthly(totalMrrCents, currency)
        : null
      : site.monthlyRevenue;

  const socials = Object.entries(site.socials ?? {}).filter(
    ([key, url]) => url && key in SOCIAL_ICONS,
  ) as [keyof typeof SOCIAL_ICONS, string][];

  return (
    <header>
      <img
        src={site.avatar}
        alt={site.name}
        className="h-36 w-36 rounded-full object-cover sm:h-44 sm:w-44"
      />

      <h1 className="mt-6 text-3xl font-extrabold leading-tight text-ink md:text-4xl">
        {site.name}
      </h1>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-lg text-muted">
          <PinIcon className="h-5 w-5 text-muted" />
          <span>{site.location}</span>
        </div>
        {revenue ? (
          <div className="flex items-center gap-2 text-lg text-muted">
            <MoneyIcon className="h-5 w-5 text-muted" />
            <span>{revenue}</span>
          </div>
        ) : null}
      </div>

      {site.tagline ? (
        <p className="mt-6 text-lg leading-relaxed text-muted md:text-xl">
          {site.tagline}
        </p>
      ) : null}

      {socials.length > 0 ? (
        <div className="mt-6 flex items-center gap-5">
          {socials.map(([key, url]) => {
            const Icon = SOCIAL_ICONS[key];
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="text-ink/70 transition hover:text-ink"
              >
                <Icon className="h-6 w-6" />
              </a>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
