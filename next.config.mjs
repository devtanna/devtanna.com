/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/stats/js/script.js",
        destination: "https://www.mochianalytics.com/js/script.js",
      },
      {
        source: "/stats/api/event",
        destination: "https://events.mochianalytics.com/api/event",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // ponytail: 'unsafe-inline' because Next injects inline hydration
            // scripts; switch to nonce middleware if strict CSP ever matters
            value: "script-src 'self' 'unsafe-inline'; connect-src 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
