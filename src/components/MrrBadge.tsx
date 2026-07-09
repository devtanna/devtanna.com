import { StripeGlyph } from "./icons";
import { formatMrr, formatCompactMoney } from "@/lib/revenue/format";

export function MrrBadge({
  mrrCents,
  currency,
  type,
}: {
  mrrCents: number;
  currency: string;
  type?: "recurring" | "one_time";
}) {
  // one_time projects don't have MRR — show all-time earned instead of "/mo".
  const oneTime = type === "one_time";
  const label = oneTime
    ? formatCompactMoney(mrrCents, currency)
    : formatMrr(mrrCents, currency);

  return (
    <span
      title={oneTime ? "All-time revenue" : "Monthly recurring revenue"}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/[0.06] py-0.5 pl-0.5 pr-2 text-xs font-semibold text-ink"
    >
      <StripeGlyph className="h-4 w-4" />
      {label}
    </span>
  );
}
