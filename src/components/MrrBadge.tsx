import { StripeGlyph } from "./icons";
import { formatMrr } from "@/lib/revenue/format";

export function MrrBadge({
  mrrCents,
  currency,
}: {
  mrrCents: number;
  currency: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] py-1 pl-1 pr-3 text-sm font-semibold text-ink">
      <StripeGlyph className="h-5 w-5" />
      {formatMrr(mrrCents, currency)}
    </span>
  );
}
