import { cookies } from "next/headers";
import { ADMIN_COOKIE, authConfigured, readSession, type AdminUser } from "./auth.ts";
import { redisConfig } from "./redis.ts";

export function adminReady() {
  return authConfigured() && redisConfig() !== null;
}

export async function currentAdmin(): Promise<AdminUser | null> {
  if (!adminReady()) return null;
  return readSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
