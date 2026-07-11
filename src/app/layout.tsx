import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `${site.name} · ${site.tagline}`,
  description: site.description,
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    type: "profile",
  },
  icons: {
    icon: "/avatar.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="/stats/js/script.js"
          data-website-id="09c7f2ba-abdd-4bc8-98cd-20e133a3a2e3"
          data-domain="devtanna.com"
          data-api="/stats/api/event"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
