import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    return [
      {
        source: "/bloggers/lead-blogger",
        destination: "/cast/chip-absolute",
        permanent: false,
      },
      {
        // Staff pages moved from /cast/<slug>. The pattern has no dot, so avatar
        // images under /cast/*.png are still served.
        source: "/cast/:slug([a-z0-9-]+)",
        destination: "/staff/:slug",
        permanent: true,
      },
      {
        source: "/demo",
        destination: "/games/sunday-pilot",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
