"use client";

import { useState } from "react";
import { ShareIcon } from "./icons";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={onShare}
      aria-label="Share this page"
      title={copied ? "Copied!" : "Share"}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-sm transition hover:brightness-105 active:scale-95"
    >
      <ShareIcon className="h-6 w-6" />
    </button>
  );
}
