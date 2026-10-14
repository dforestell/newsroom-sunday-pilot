import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "pfs_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;

type Env = Record<string, string | undefined>;

export function adminEmails(env: Env = process.env): string[] {
  return (env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function secret(env: Env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || "";
}

export function authConfigured(env: Env = process.env): boolean {
  return adminEmails(env).length > 0 && Boolean(env.ADMIN_PASSWORD);
}

function sameText(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function checkLogin(email: string, password: string, env: Env = process.env): string | null {
  if (!authConfigured(env)) return null;
  const normalized = email.trim().toLowerCase();
  const allowed = adminEmails(env).includes(normalized);
  const passwordOk = sameText(password, env.ADMIN_PASSWORD ?? "");
  return allowed && passwordOk ? normalized : null;
}

function sign(payload: string, env: Env) {
  return createHmac("sha256", secret(env)).update(payload).digest("base64url");
}

export function createSession(email: string, now = Date.now(), env: Env = process.env): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: now + SESSION_MS })).toString("base64url");
  return `${payload}.${sign(payload, env)}`;
}

/** Returns the admin email for a valid, unexpired, still-allowlisted session. */
export function readSession(token: string | undefined, now = Date.now(), env: Env = process.env): string | null {
  if (!token || !authConfigured(env)) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !sameText(signature, sign(payload, env))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: unknown; exp?: unknown };
    if (typeof data.email !== "string" || typeof data.exp !== "number" || data.exp < now) return null;
    return adminEmails(env).includes(data.email) ? data.email : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MS / 1000,
};
