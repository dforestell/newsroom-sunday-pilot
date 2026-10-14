import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Story pages render on demand once the story store is configured; ship the filed
  // story files and route list with every server function.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./app/**/page.tsx"],
  },
  async redirects() {
    return [
      {
        source: "/bloggers/lead-blogger",
        destination: "/cast/chip-absolute",
        permanent: false,
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
