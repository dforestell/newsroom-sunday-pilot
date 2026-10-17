// Request-time read of admin content for public pages. Always resolves: if Redis is
// missing, slow, or failing, public pages render the filed (build-time) content.
import { unstable_cache } from "next/cache";
import { ADMIN_CONTENT_TAG } from "./keys.ts";
import { redisConfig } from "./redis.ts";
import { EMPTY_ADMIN_CONTENT, fetchAdminContent, type AdminContent } from "./store.ts";

export const ADMIN_CONTENT_REVALIDATE_SECONDS = 30;

type Reader = () => Promise<AdminContent>;

/** Never throws. A failed read is not cached, so the next request tries again. */
export async function readWithFallback(read: Reader, log: (message: string) => void = console.warn): Promise<AdminContent> {
  try {
    return await read();
  } catch (error) {
    log(`Admin content unavailable; showing filed content only (${error instanceof Error ? error.message : "error"}).`);
    return EMPTY_ADMIN_CONTENT;
  }
}

function cachedReader(): Reader {
  const config = redisConfig();
  if (!config) return async () => EMPTY_ADMIN_CONTENT;
  const read = () => fetchAdminContent(config);
  try {
    return unstable_cache(read, ["admin-content-v1"], { revalidate: ADMIN_CONTENT_REVALIDATE_SECONDS, tags: [ADMIN_CONTENT_TAG] });
  } catch {
    return read;
  }
}

export async function readAdminContent(): Promise<AdminContent> {
  return readWithFallback(cachedReader());
}
