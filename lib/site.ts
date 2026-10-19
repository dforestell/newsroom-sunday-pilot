// The one public origin for every absolute link: metadata, canonical URLs,
// share tags and redirects. Override with NEXT_PUBLIC_SITE_URL (origin only).
export const DEFAULT_SITE_URL = "https://poorformsports.com";

export function resolveSiteUrl(value: string | undefined): string {
  if (!value?.trim()) return DEFAULT_SITE_URL;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/** Absolute public URL for a site path, e.g. siteUrl("/calls"). */
export function siteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
