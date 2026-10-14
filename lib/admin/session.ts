import { cookies } from "next/headers";
import { ADMIN_COOKIE, authConfigured, readSession } from "./auth.ts";
import { selectAdminStore } from "./store.ts";

export function adminConfigured() {
  return authConfigured() && selectAdminStore() !== null;
}

export async function currentAdmin(): Promise<string | null> {
  if (!adminConfigured()) return null;
  return readSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Same-origin check for admin form posts (cookie is also SameSite=Lax). */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host || new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
