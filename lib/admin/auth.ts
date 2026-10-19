// Admin auth: signed, httpOnly session cookie. Secrets come from env and are never logged.
//
// Users come from AdminDirectory implementations:
// - envDirectory: the owner. Username "dillon" or an email in ADMIN_EMAILS, plus
//   ADMIN_PASSWORD. Works without Redis.
// - redisDirectory: editor accounts stored in Redis (lib/admin/users.ts).
// combinedDirectory tries them in order. Session ids are prefixed ("owner:", "user:")
// and every request re-checks the id, so disabling or deleting a user signs them out.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { OWNER_USERNAME, UserStore } from "./users.ts";
import type { RedisConfig } from "./redis.ts";

export const ADMIN_COOKIE = "pfs_admin";
export const SESSION_SECONDS = 12 * 60 * 60;
const MIN_SECRET_LENGTH = 32;

type Env = Record<string, string | undefined>;

export type AdminRole = "owner" | "editor";
export type AdminUser = { id: string; label: string; role: AdminRole };

export interface AdminDirectory {
  /** Returns the user for valid credentials, otherwise null. */
  verify(login: string, password: string): Promise<AdminUser | null>;
  /** Re-checks a session's user id on every request. Null signs the session out. */
  find(id: string): Promise<AdminUser | null>;
}

export function adminEmails(env: Env = process.env): string[] {
  return (env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function sameText(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

const OWNER: AdminUser = { id: `owner:${OWNER_USERNAME}`, label: OWNER_USERNAME, role: "owner" };

export function envDirectory(env: Env = process.env): AdminDirectory {
  const emails = adminEmails(env);
  const password = env.ADMIN_PASSWORD ?? "";
  const configured = () => emails.length > 0 && Boolean(password);
  return {
    async verify(login, given) {
      if (!configured()) return null;
      const name = login.trim().toLowerCase();
      const passwordOk = sameText(given, password);
      if (!passwordOk) return null;
      if (name === OWNER_USERNAME) return OWNER;
      if (emails.includes(name)) return { id: `email:${name}`, label: name, role: "owner" };
      return null;
    },
    async find(id) {
      if (!configured()) return null;
      if (id === OWNER.id) return OWNER;
      const email = id.startsWith("email:") ? id.slice("email:".length) : "";
      return email && emails.includes(email) ? { id, label: email, role: "owner" } : null;
    },
  };
}

export function redisDirectory(store: UserStore | null): AdminDirectory {
  return {
    async verify(login, given) {
      if (!store) return null;
      try {
        const user = await store.verify(login.trim().toLowerCase(), given);
        return user ? { id: `user:${user.username}`, label: user.label, role: "editor" } : null;
      } catch {
        return null; // Redis down: editors cannot sign in; the owner env login still works.
      }
    },
    async find(id) {
      if (!store || !id.startsWith("user:")) return null;
      try {
        const user = await store.get(id.slice("user:".length));
        return user && !user.disabled ? { id, label: user.label, role: "editor" } : null;
      } catch {
        return null;
      }
    },
  };
}

export function combinedDirectory(...directories: AdminDirectory[]): AdminDirectory {
  return {
    async verify(login, password) {
      for (const directory of directories) {
        const user = await directory.verify(login, password);
        if (user) return user;
      }
      return null;
    },
    async find(id) {
      for (const directory of directories) {
        const user = await directory.find(id);
        if (user) return user;
      }
      return null;
    },
  };
}

export function defaultDirectory(env: Env = process.env, config: RedisConfig | null = null): AdminDirectory {
  return combinedDirectory(envDirectory(env), redisDirectory(config ? new UserStore(config) : null));
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
export async function readSession(
  token: string | undefined,
  { now = Date.now(), env = process.env, directory = envDirectory(env) }: { now?: number; env?: Env; directory?: AdminDirectory } = {},
): Promise<AdminUser | null> {
  if (!token || !authConfigured(env)) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined || !sameText(signature, sign(payload, env))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: unknown; exp?: unknown };
    if (typeof data.sub !== "string" || typeof data.exp !== "number" || data.exp < now) return null;
    return await directory.find(data.sub);
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
