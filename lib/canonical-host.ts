import { SITE_URL } from "./site.ts";

// Hosts that must 308 to the canonical origin. Exact matches only: Vercel preview
// and deployment hosts (*-poor-form-sports.vercel.app, git-branch URLs) and
// localhost are never redirected.
export const REDIRECT_HOSTS = ["newsroom-sunday-pilot.vercel.app", "www.poorformsports.com"] as const;

export type HostRequest = { method: string; host: string | null; pathname: string; search: string };

function bareHost(host: string) {
  return host.trim().toLowerCase().replace(/\.$/, "").replace(/:\d+$/, "");
}

/** The canonical URL to 308 to, or null to let the request through. */
export function canonicalRedirect(request: HostRequest, siteUrl: string = SITE_URL): string | null {
  const method = request.method.toUpperCase();
  // Server actions, form posts and other writes pass through untouched.
  if (method !== "GET" && method !== "HEAD") return null;
  if (!request.host) return null;
  const host = bareHost(request.host);
  if (!(REDIRECT_HOSTS as readonly string[]).includes(host)) return null;
  const target = new URL(siteUrl);
  if (bareHost(target.host) === host) return null; // never loop onto ourselves
  return `${target.origin}${request.pathname || "/"}${request.search}`;
}
