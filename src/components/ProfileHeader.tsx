/* eslint-disable @next/next/no-img-element */
import { site } from "@/config/site";
import { PinIcon, MoneyIcon } from "./icons";
import { ShareButton } from "./ShareButton";
import { formatMonthly } from "@/lib/revenue/format";

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

  return (
    <header className="flex items-start gap-5">
      <img
        src={site.avatar}
        alt={site.name}
        className="h-[104px] w-[104px] shrink-0 rounded-full object-cover ring-4 ring-accent-ring sm:h-[128px] sm:w-[128px]"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-[2.5rem]">
            {site.name}
          </h1>
          <ShareButton url={site.url} title={site.name} />
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-lg text-ink/80">
            <PinIcon className="h-5 w-5 text-ink/70" />
            <span>{site.location}</span>
          </div>
          {revenue ? (
            <div className="flex items-center gap-2 text-lg text-ink/80">
              <MoneyIcon className="h-5 w-5 text-ink/70" />
              <span>{revenue}</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
