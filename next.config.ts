import type { NextConfig } from "next";
import { INACTIVE_SLUGS } from "./lib/cast";

// Hidden voices (lib/cast.ts `active: false`) redirect temporarily, so restoring one is a one-line change.
const hidden = INACTIVE_SLUGS.join("|");

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    return [
      {
        source: "/bloggers/lead-blogger",
        destination: "/cast/chip-absolute",
        permanent: false,
      },
      ...(hidden
        ? [
            { source: `/staff/:slug(${hidden})`, destination: "/staff", permanent: false },
            { source: `/cast/:slug(${hidden})`, destination: "/staff", permanent: false },
          ]
        : []),
      // The cast index moved to /staff.
      { source: "/cast", destination: "/staff", permanent: false },
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
