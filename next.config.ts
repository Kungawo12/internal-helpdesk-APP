import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.bbc.co.uk" },
      { protocol: "https", hostname: "**.bbc.com" },
      { protocol: "https", hostname: "ichef.bbci.co.uk" },
      { protocol: "https", hostname: "**.techcrunch.com" },
      { protocol: "https", hostname: "**.wired.com" },
      { protocol: "https", hostname: "**.cnbc.com" },
      { protocol: "https", hostname: "**.nytimes.com" },
      { protocol: "https", hostname: "**.marketwatch.com" },
      { protocol: "https", hostname: "**.wsj.net" },
      { protocol: "https", hostname: "**.wordpress.com" },
      { protocol: "https", hostname: "**.wp.com" },
    ],
  },
  // M12: security response headers applied to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent the app from being embedded in iframes (clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop browsers from MIME-sniffing away from the declared Content-Type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send origin on same-origin requests; send nothing cross-origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict camera, mic, geolocation access
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Enforce HTTPS for 1 year (preload-ready)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Content-Security-Policy is set dynamically in middleware.ts
          // with a per-request nonce, replacing 'unsafe-inline' for scripts.
        ],
      },
    ];
  },
};

export default nextConfig;
