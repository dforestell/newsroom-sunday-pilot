import { cookies } from "next/headers";
import { ADMIN_COOKIE, authConfigured, defaultDirectory, readSession, type AdminUser } from "./auth.ts";
import { redisConfig } from "./redis.ts";

export function adminReady() {
  return authConfigured() && redisConfig() !== null;
}

export function adminDirectory() {
  return defaultDirectory(process.env, redisConfig());
}

/** Re-checks the session's user on every call (disabled or deleted users get null). */
export async function currentAdmin(): Promise<AdminUser | null> {
  if (!adminReady()) return null;
  return readSession((await cookies()).get(ADMIN_COOKIE)?.value, { directory: adminDirectory() });
}

export function isOwner(user: AdminUser | null): boolean {
  return user?.role === "owner";
}
