import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncRevenue } from "@/lib/revenue/sync";

export const dynamic = "force-dynamic";
// Safety net so a first big sync completes and flushes logs; capped by your
// Vercel plan (Hobby ~60s, Pro up to 300s). The real speedup is in sync.ts.
export const maxDuration = 300;

/**
 * Refreshes revenue from Stripe into Neon. Triggered daily by Vercel Cron
 * (see vercel.json) and callable manually. Guarded by CRON_SECRET.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically.
 * Manual: pass `?secret=...` or the same Authorization header.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const url = new URL(request.url);
    const provided =
      auth?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await syncRevenue();
    const status = result.ok ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (err) {
    console.error("[cron] sync-revenue failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
