import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
