import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { isbot } from "isbot";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const userAgent = request.headers.get("user-agent") ?? "";

  if (isbot(userAgent)) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "user-agent": userAgent,
    };
    if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;

    event.waitUntil(
      fetch("https://events.mochianalytics.com/api/event", {
        method: "POST",
        headers,
        body: JSON.stringify({
          d: "devtanna.com",
          i: "09c7f2ba-abdd-4bc8-98cd-20e133a3a2e3",
          u: request.nextUrl.pathname,
        }),
      }).catch(() => {}),
    );
  }

  return NextResponse.next();
}
