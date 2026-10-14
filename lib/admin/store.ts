export type AdminSource = { label: string; url: string };

export type AdminStory = {
  slug: string;
  title: string;
  dek: string;
  body: string;
  voiceId: string;
  date: string;
  sources: AdminSource[];
  status: "draft" | "published";
  updatedAt: string;
  publishedAt?: string;
};

export interface AdminStoryStore {
  kind: "redis" | "memory";
  list(): Promise<AdminStory[]>;
  get(slug: string): Promise<AdminStory | null>;
  put(story: AdminStory): Promise<void>;
  /** Unsaved form values for the admin-only preview, one slot per admin, short-lived. */
  putPreview(email: string, story: AdminStory): Promise<void>;
  getPreview(email: string): Promise<AdminStory | null>;
}

const PREVIEW_TTL_SECONDS = 60 * 60;
const previewKey = (email: string) => `admin:stories:preview:${email}`;

/** All admin data lives in one hash, separate from the score cache keys. */
export const ADMIN_STORIES_KEY = "admin:stories:v1";

type Env = Record<string, string | undefined>;

function parse(value: unknown): AdminStory | null {
  if (typeof value !== "string") return null;
  try {
    const story = JSON.parse(value) as AdminStory;
    return story && typeof story.slug === "string" && typeof story.title === "string" ? story : null;
  } catch {
    return null;
  }
}

export class RedisAdminStore implements AdminStoryStore {
  kind = "redis" as const;
  private url: string;

  constructor(url: string, private token: string) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error("Redis must use HTTPS");
    this.url = parsed.toString().replace(/\/$/, "");
  }

  private async command(command: string[]): Promise<unknown> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) throw new Error(`Story store HTTP ${response.status}`);
    const payload = (await response.json()) as { result?: unknown; error?: string };
    if (payload.error) throw new Error("Story store command failed");
    return payload.result;
  }

  async list() {
    const result = await this.command(["HVALS", ADMIN_STORIES_KEY]);
    return (Array.isArray(result) ? result : []).map(parse).filter((story): story is AdminStory => story !== null);
  }

  async get(slug: string) {
    return parse(await this.command(["HGET", ADMIN_STORIES_KEY, slug]));
  }

  async put(story: AdminStory) {
    await this.command(["HSET", ADMIN_STORIES_KEY, story.slug, JSON.stringify(story)]);
  }

  async putPreview(email: string, story: AdminStory) {
    await this.command(["SET", previewKey(email), JSON.stringify(story), "EX", String(PREVIEW_TTL_SECONDS)]);
  }

  async getPreview(email: string) {
    return parse(await this.command(["GET", previewKey(email)]));
  }
}

/** Local development and tests only. Never selected when NODE_ENV is production. */
export class MemoryAdminStore implements AdminStoryStore {
  kind = "memory" as const;
  private items = new Map<string, string>();
  async list() {
    return [...this.items.values()].map(parse).filter((story): story is AdminStory => story !== null);
  }
  async get(slug: string) {
    return parse(this.items.get(slug));
  }
  async put(story: AdminStory) {
    this.items.set(story.slug, JSON.stringify(story));
  }
  private previews = new Map<string, string>();
  async putPreview(email: string, story: AdminStory) {
    this.previews.set(email, JSON.stringify(story));
  }
  async getPreview(email: string) {
    return parse(this.previews.get(email));
  }
}

export function redisEnv(env: Env = process.env): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

export function selectAdminStore(env: Env = process.env): AdminStoryStore | null {
  const redis = redisEnv(env);
  if (redis) {
    try {
      return new RedisAdminStore(redis.url, redis.token);
    } catch {
      return null;
    }
  }
  if (env.NODE_ENV !== "production" && env.ADMIN_DEV_MEMORY === "1") {
    const holder = globalThis as typeof globalThis & { __pfsAdminMemory?: MemoryAdminStore };
    return (holder.__pfsAdminMemory ??= new MemoryAdminStore());
  }
  return null;
}
