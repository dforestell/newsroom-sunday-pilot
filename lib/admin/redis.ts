// Minimal Upstash Redis REST client. Never logs the URL or token.
type Env = Record<string, string | undefined>;

export const REDIS_TIMEOUT_MS = 1_500;

export type RedisConfig = { url: string; token: string };

export function redisConfig(env: Env = process.env): RedisConfig | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) return null;
  return { url: parsed.toString().replace(/\/$/, ""), token };
}

export class RedisError extends Error {
  name = "RedisError";
}

export type Fetcher = typeof fetch;

/** Runs commands in one pipeline request with a hard timeout. Throws RedisError on any failure. */
export async function redisPipeline(
  config: RedisConfig,
  commands: string[][],
  { fetcher = fetch, timeoutMs = REDIS_TIMEOUT_MS }: { fetcher?: Fetcher; timeoutMs?: number } = {},
): Promise<unknown[]> {
  let response: Response;
  try {
    response = await fetcher(`${config.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new RedisError(`request failed (${error instanceof Error ? error.name : "error"})`);
  }
  if (!response.ok) throw new RedisError(`HTTP ${response.status}`);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new RedisError("invalid JSON response");
  }
  if (!Array.isArray(body) || body.length !== commands.length) throw new RedisError("unexpected pipeline response");
  return body.map((item) => {
    if (!item || typeof item !== "object") throw new RedisError("unexpected pipeline item");
    if ("error" in item && item.error) throw new RedisError(`command error: ${String(item.error)}`);
    return (item as { result?: unknown }).result;
  });
}

/** HGETALL replies as a flat [field, value, ...] array over REST. */
export function hashValues(reply: unknown): string[] {
  if (!Array.isArray(reply)) return [];
  const values: string[] = [];
  for (let i = 1; i < reply.length; i += 2) if (typeof reply[i] === "string") values.push(reply[i]);
  return values;
}
