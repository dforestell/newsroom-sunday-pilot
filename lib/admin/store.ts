import { ADMIN_CALLS_KEY, ADMIN_STORIES_KEY } from "./keys.ts";
import { hashValues, redisConfig, redisPipeline, type Fetcher, type RedisConfig } from "./redis.ts";
import { parseCallRecord, type AdminCallRecord } from "./calls.ts";
import { parseStoryRecord, type AdminStoryRecord } from "./stories.ts";

export type AdminContent = { stories: AdminStoryRecord[]; calls: AdminCallRecord[] };
export const EMPTY_ADMIN_CONTENT: AdminContent = { stories: [], calls: [] };

/** Reads every admin story and call in one request. Throws RedisError on failure. */
export async function fetchAdminContent(config: RedisConfig, options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<AdminContent> {
  const [stories, calls] = await redisPipeline(config, [["HGETALL", ADMIN_STORIES_KEY], ["HGETALL", ADMIN_CALLS_KEY]], options);
  return {
    stories: hashValues(stories).map(parseStoryRecord).filter((item): item is AdminStoryRecord => item !== null),
    calls: hashValues(calls).map(parseCallRecord).filter((item): item is AdminCallRecord => item !== null),
  };
}

export async function putAdminStory(record: AdminStoryRecord, config = redisConfig()) {
  if (!config) throw new Error("Redis is not configured.");
  await redisPipeline(config, [["HSET", ADMIN_STORIES_KEY, record.slug, JSON.stringify(record)]]);
}

export async function putAdminCall(record: AdminCallRecord & { postUrl: string }, config = redisConfig()) {
  if (!config) throw new Error("Redis is not configured.");
  await redisPipeline(config, [["HSET", ADMIN_CALLS_KEY, record.postUrl, JSON.stringify(record)]]);
}

export async function deleteAdminCall(postUrl: string, config = redisConfig()) {
  if (!config) throw new Error("Redis is not configured.");
  await redisPipeline(config, [["HDEL", ADMIN_CALLS_KEY, postUrl]]);
}
