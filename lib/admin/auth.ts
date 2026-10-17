// Admin auth: signed, httpOnly session cookie. Secrets come from env and are never logged.
//
// Users come from an AdminDirectory. Today there is one directory, backed by
// ADMIN_EMAILS + ADMIN_PASSWORD. Named persona users (username + password) can be added
// later as another directory, with ids like "persona:<username>", without changing the
// session format or the pages.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "pfs_admin";
export const SESSION_SECONDS = 12 * 60 * 60;
const MIN_SECRET_LENGTH = 32;

type Env = Record<string, string | undefined>;

export type AdminUser = { id: string; label: string; role: "admin" };

export interface AdminDirectory {
  /** Returns the user for valid credentials, otherwise null. */
  verify(login: string, password: string): AdminUser | null;
  /** Re-checks a session's user id so removing someone from env revokes their cookie. */
  find(id: string): AdminUser | null;
}

export function adminEmails(env: Env = process.env): string[] {
  return (env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function sameText(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function envDirectory(env: Env = process.env): AdminDirectory {
  const emails = adminEmails(env);
  const password = env.ADMIN_PASSWORD ?? "";
  const user = (email: string): AdminUser => ({ id: `email:${email}`, label: email, role: "admin" });
  return {
    verify(login, given) {
      if (!emails.length || !password) return null;
      const email = login.trim().toLowerCase();
      const passwordOk = sameText(given, password);
      return emails.includes(email) && passwordOk ? user(email) : null;
    },
    find(id) {
      const email = id.startsWith("email:") ? id.slice("email:".length) : "";
      return email && emails.includes(email) ? user(email) : null;
    },
  };
}

/** Names of missing settings (never values), for the admin setup message. */
export function missingAuthSettings(env: Env = process.env): string[] {
  const missing: string[] = [];
  if (!adminEmails(env).length) missing.push("ADMIN_EMAILS");
  if (!env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if ((env.ADMIN_SESSION_SECRET ?? "").length < MIN_SECRET_LENGTH) missing.push(`ADMIN_SESSION_SECRET (at least ${MIN_SECRET_LENGTH} characters)`);
  return missing;
}

export function authConfigured(env: Env = process.env) {
  return missingAuthSettings(env).length === 0;
}

function sign(payload: string, env: Env) {
  return createHmac("sha256", env.ADMIN_SESSION_SECRET ?? "").update(payload).digest("base64url");
}

export function createSession(user: AdminUser, now = Date.now(), env: Env = process.env): string {
  if (!authConfigured(env)) throw new Error("Admin auth is not configured.");
  const payload = Buffer.from(JSON.stringify({ sub: user.id, exp: now + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload, env)}`;
}

/** Returns the user for a valid, unexpired session whose user still exists. */
export function readSession(
  token: string | undefined,
  { now = Date.now(), env = process.env, directory = envDirectory(env) }: { now?: number; env?: Env; directory?: AdminDirectory } = {},
): AdminUser | null {
  if (!token || !authConfigured(env)) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined || !sameText(signature, sign(payload, env))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: unknown; exp?: unknown };
    if (typeof data.sub !== "string" || typeof data.exp !== "number" || data.exp < now) return null;
    return directory.find(data.sub);
  } catch {
    return null;
  }
}

export function sessionCookieOptions(env: Env = process.env) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}
