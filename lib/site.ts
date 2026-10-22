/** Public origin for absolute links. NEXT_PUBLIC_SITE_URL when set, else the canonical domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://poorformsports.com").replace(/\/+$/, "");
