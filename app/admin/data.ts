import { redisConfig } from "@/lib/admin/redis";
import { fetchAdminContent, type AdminContent } from "@/lib/admin/store";

/** Uncached admin read for the dashboard and editors. Null when the store is unreachable. */
export async function adminContentOrNull(): Promise<AdminContent | null> {
  const config = redisConfig();
  if (!config) return null;
  try {
    return await fetchAdminContent(config);
  } catch {
    return null;
  }
}
