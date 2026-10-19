// Login rate limit: failures counted per username and per IP in Redis.
// Fails open (allows the attempt) if Redis is missing or unreachable.
import { LOGIN_FAIL_PREFIX } from "./keys.ts";
import { redisPipeline, type Fetcher, type RedisConfig } from "./redis.ts";

export const MAX_FAILURES = 10;
export const WINDOW_SECONDS = 15 * 60;

type Options = { fetcher?: Fetcher; log?: (message: string) => void };

export function limitKeys(username: string, ip: string): string[] {
  const user = username.trim().toLowerCase().slice(0, 128) || "-";
  return [`${LOGIN_FAIL_PREFIX}user:${user}`, `${LOGIN_FAIL_PREFIX}ip:${ip || "unknown"}`];
}

export async function isLimited(config: RedisConfig | null, username: string, ip: string, options: Options = {}): Promise<boolean> {
  if (!config) return false;
  try {
    const counts = await redisPipeline(config, limitKeys(username, ip).map((key) => ["GET", key]), options);
    return counts.some((count) => Number(count ?? 0) >= MAX_FAILURES);
  } catch (error) {
    (options.log ?? console.warn)(`Login rate limit unavailable; allowing attempt (${error instanceof Error ? error.message : "error"}).`);
    return false;
  }
}

export async function recordFailure(config: RedisConfig | null, username: string, ip: string, options: Options = {}): Promise<void> {
  if (!config) return;
  const commands = limitKeys(username, ip).flatMap((key) => [["SET", key, "0", "EX", String(WINDOW_SECONDS), "NX"], ["INCR", key]]);
  try {
    await redisPipeline(config, commands, options);
  } catch (error) {
    (options.log ?? console.warn)(`Login rate limit unavailable; failure not counted (${error instanceof Error ? error.message : "error"}).`);
  }
}

/** A successful login clears the username counter (the IP counter keeps its window). */
export async function clearUserFailures(config: RedisConfig | null, username: string, options: Options = {}): Promise<void> {
  if (!config) return;
  try {
    await redisPipeline(config, [["DEL", limitKeys(username, "")[0]]], options);
  } catch {
    // fail open
  }
}

/** First address in x-forwarded-for (set by Vercel), else x-real-ip. */
export function clientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || headers.get("x-real-ip")?.trim() || "unknown").slice(0, 64);
}
