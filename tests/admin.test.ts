import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { createSession, envDirectory, missingAuthSettings, readSession } from "../lib/admin/auth.ts";
import { validateAdminCall } from "../lib/admin/calls.ts";
import { readWithFallback } from "../lib/admin/content.ts";
import { mergeCalls, mergeStories } from "../lib/admin/merge.ts";
import { redisConfig, RedisError } from "../lib/admin/redis.ts";
import { EMPTY_ADMIN_CONTENT, fetchAdminContent } from "../lib/admin/store.ts";
import { validateAdminStory, type AdminStoryRecord } from "../lib/admin/stories.ts";
import { getCallRecord } from "../lib/calls/record.ts";
import { FILE_CALLS, FILE_STORIES } from "../lib/generated/content.ts";
import { listPublicCalls } from "../lib/calls.ts";
import { listPublicStories } from "../lib/stories.ts";

const env = {
  ADMIN_EMAILS: "desk@example.com, Editor@Example.com",
  ADMIN_PASSWORD: "correct horse",
  ADMIN_SESSION_SECRET: "s".repeat(40),
  NODE_ENV: "production",
};

// ---------- auth ----------

test("login accepts allowlisted emails (case-insensitive) with the password only", async () => {
  const directory = envDirectory(env);
  assert.equal((await directory.verify("editor@example.com", "correct horse"))?.id, "email:editor@example.com");
  assert.equal(await directory.verify("desk@example.com", "wrong"), null);
  assert.equal(await directory.verify("someone@example.com", "correct horse"), null);
});

test("sessions are signed, expire, and are revoked when the email leaves ADMIN_EMAILS", async () => {
  const user = (await envDirectory(env).verify("desk@example.com", "correct horse"))!;
  const token = createSession(user, 1_000, env);
  assert.equal((await readSession(token, { now: 2_000, env }))?.label, "desk@example.com");
  assert.equal(await readSession(token, { now: 1_000 + 13 * 3600 * 1000, env }), null, "expired");
  const [payload, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ sub: "email:desk@example.com", exp: 9e15 })).toString("base64url");
  assert.equal(await readSession(`${forged}.${sig}`, { now: 2_000, env }), null, "tampered payload");
  assert.equal(await readSession(`${payload}.x${sig}`, { now: 2_000, env }), null, "tampered signature");
  assert.equal(await readSession(token, { now: 2_000, env: { ...env, ADMIN_SESSION_SECRET: "t".repeat(40) } }), null, "rotated secret");
  assert.equal(await readSession(token, { now: 2_000, env: { ...env, ADMIN_EMAILS: "editor@example.com" } }), null, "removed user");
});

test("admin stays off without all three settings and a long session secret", () => {
  assert.deepEqual(missingAuthSettings(env), []);
  assert.deepEqual(missingAuthSettings({ ...env, ADMIN_SESSION_SECRET: "short" }), ["ADMIN_SESSION_SECRET (at least 32 characters)"]);
  assert.deepEqual(missingAuthSettings({}).length, 3);
  assert.throws(() => createSession({ id: "email:x", label: "x", role: "owner" }, 0, {}));
});

// ---------- stories ----------

const fileSlugs = FILE_STORIES.map((story) => story.slug);
const draft = {
  slug: "desk-notes-week-7",
  title: "Desk notes, Week 7",
  dek: "Three things from Sunday.",
  body: `## What happened\n\nChip was wrong again. See [the Nix call](/stories/${fileSlugs[0]}) and [the cast](/cast/chip-absolute).`,
  voiceId: "chip-absolute",
  date: "2026-10-18",
};
const record = (overrides: Partial<AdminStoryRecord> = {}): AdminStoryRecord => ({
  ...draft, status: "published", updatedAt: "2026-10-18T00:00:00Z", updatedBy: "email:desk@example.com", ...overrides,
});

test("admin stories validate like filed stories and always carry the SATIRE label", () => {
  const result = validateAdminStory(draft, { fileSlugs, adminSlugs: [] });
  assert.ok("story" in result, JSON.stringify(result));
  assert.equal(result.story.label, "SATIRE");
  assert.equal(result.story.demo, false);
  assert.match(result.story.html, /<h2 id="story-what-happened">/);
});

test("admin stories reject filed-slug clashes, copy-rule words, raw HTML and dead internal links", () => {
  const issues = (overrides: Partial<typeof draft>) => {
    const result = validateAdminStory({ ...draft, ...overrides }, { fileSlugs, adminSlugs: [] });
    return "issues" in result ? result.issues.join("\n") : "";
  };
  assert.match(issues({ slug: fileSlugs[0] }), /already used by a filed story/);
  assert.match(issues({ body: "Dillon said so." }), /Remove or rewrite public wording/);
  assert.match(issues({ body: "Hi <b>there</b>" }), /Remove raw HTML/);
  assert.match(issues({ body: "See [x](/stories/not-a-story)." }), /has no known page/);
  assert.match(issues({ voiceId: "nobody" }), /Choose a cast voiceId/);
  assert.match(issues({ slug: "Bad Slug" }), /lowercase words/);
});

test("merged story list: published admin stories join filed ones, newest first; unpublished, invalid and clashing ones never show", () => {
  const merged = mergeStories(FILE_STORIES, [
    record(),
    record({ slug: "hidden-one", status: "unpublished" }),
    record({ slug: "broken-one", body: "<script>x</script>" }),
    record({ slug: fileSlugs[0], title: "Clash" }),
  ]);
  assert.equal(merged.length, FILE_STORIES.length + 1);
  assert.equal(merged[0].slug, "desk-notes-week-7");
  assert.equal(merged.find((story) => story.slug === fileSlugs[0])?.title, FILE_STORIES[0].title, "filed story wins a clash");
  assert.ok(!merged.some((story) => story.slug === "hidden-one" || story.slug === "broken-one"));
});

// ---------- calls ----------

// Use the newest filed call as the pending one, so this test does not depend on
// whether content/calls currently has an ungraded call.
const newestFiled = [...FILE_CALLS].sort((a, b) => b.date.localeCompare(a.date))[0]!;
const lloyd = { ...newestFiled, status: "pending", result: undefined } as typeof newestFiled;
const BASE_CALLS = FILE_CALLS.map((call) => (call.postUrl === lloyd.postUrl ? lloyd : call));

test("admin calls use the same validation as check:calls", () => {
  const bad = (fields: Record<string, string>) => {
    const result = validateAdminCall({ ...fields });
    return "issues" in result ? result.issues.join("\n") : "";
  };
  const base = { date: "2026-10-25", game: "SEA at DEN", take: "A take.", kind: "forecast", postUrl: "https://x.com/ChipAbsolute/status/1", status: "pending" };
  assert.ok("call" in validateAdminCall(base));
  assert.match(bad({ ...base, status: "still-arguing" }), /A forecast is graded by the final ESPN box/);
  assert.match(bad({ ...base, status: "missed" }), /Add the verified result/);
  assert.match(bad({ ...base, postUrl: "https://twitter.com/ChipAbsolute/status/1" }), /x\.com\/ChipAbsolute/);
  assert.match(bad({ ...base, date: "2026-02-30" }), /real calendar date/);
  assert.match(bad({ ...base, note: "Dillon approved" }), /Remove or rewrite public wording/);
});

test("grading a filed call in admin replaces it by postUrl, and record, streak and next call use the merged set", () => {
  const before = getCallRecord(BASE_CALLS);
  assert.equal(before.next?.postUrl, lloyd.postUrl);
  const graded = { ...lloyd, status: "held-up", result: "Lloyd ran for 81 yards.", criterion: lloyd.criterion ?? "" };
  const added = { date: "2026-10-25", game: "SEA at DEN", take: "New call.", kind: "forecast", postUrl: "https://x.com/ChipAbsolute/status/99", status: "pending" };
  const invalid = { date: "nope", postUrl: "https://x.com/ChipAbsolute/status/98" };
  const merged = mergeCalls(BASE_CALLS, [graded, added, invalid] as never);
  assert.equal(merged.length, BASE_CALLS.length + 1);
  assert.equal(merged.filter((call) => call.postUrl === lloyd.postUrl).length, 1);
  const after = getCallRecord(merged);
  assert.equal(after.tally.hits, before.tally.hits + 1);
  assert.equal(after.tally.misses, before.tally.misses);
  assert.equal(after.next?.take, "New call.");
  assert.equal(after.latest?.postUrl, lloyd.postUrl);
  assert.equal(after.streak.kind, "none", "a hit after misses breaks the cold streak");
});

// ---------- Redis fallback ----------

const config = { url: "https://redis.invalid", token: "t" };

test("redis config needs https (http only for localhost) and both settings", () => {
  assert.equal(redisConfig({}), null);
  assert.equal(redisConfig({ UPSTASH_REDIS_REST_URL: "http://example.com", UPSTASH_REDIS_REST_TOKEN: "t" }), null);
  assert.ok(redisConfig({ UPSTASH_REDIS_REST_URL: "http://127.0.0.1:8079", UPSTASH_REDIS_REST_TOKEN: "t" }));
  assert.equal(redisConfig({ UPSTASH_REDIS_REST_URL: "not a url", UPSTASH_REDIS_REST_TOKEN: "t" }), null);
});

test("fetchAdminContent parses HGETALL replies and skips malformed records", async () => {
  const fetcher = (async () => Response.json([
    { result: ["a", JSON.stringify(record()), "b", "{not json", "c", JSON.stringify({ slug: "x" })] },
    { result: ["https://x.com/ChipAbsolute/status/1", JSON.stringify({ take: "t" }), "z", "[]"] },
  ])) as typeof fetch;
  const content = await fetchAdminContent(config, { fetcher });
  assert.equal(content.stories.length, 1);
  assert.equal(content.calls.length, 1);
});

test("Redis failures (timeout, HTTP error, network error, bad body) throw RedisError", async () => {
  const hang = ((_: unknown, init?: RequestInit) => new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)))) as typeof fetch;
  const keepAlive = setTimeout(() => {}, 500); // AbortSignal.timeout's timer does not hold the event loop open
  const started = Date.now();
  await assert.rejects(fetchAdminContent(config, { fetcher: hang, timeoutMs: 50 }), RedisError);
  assert.ok(Date.now() - started < 1_000);
  clearTimeout(keepAlive);
  await assert.rejects(fetchAdminContent(config, { fetcher: (async () => new Response("no", { status: 500 })) as typeof fetch }), RedisError);
  await assert.rejects(fetchAdminContent(config, { fetcher: (async () => { throw new TypeError("fetch failed"); }) as typeof fetch }), RedisError);
  await assert.rejects(fetchAdminContent(config, { fetcher: (async () => Response.json({ nope: 1 })) as typeof fetch }), RedisError);
  await assert.rejects(fetchAdminContent(config, { fetcher: (async () => Response.json([{ error: "WRONGPASS" }, { result: [] }])) as typeof fetch }), RedisError);
});

test("readWithFallback never throws and logs without secrets", async () => {
  const logs: string[] = [];
  const content = await readWithFallback(async () => { throw new RedisError("HTTP 401"); }, (line) => logs.push(line));
  assert.deepEqual(content, EMPTY_ADMIN_CONTENT);
  assert.match(logs[0], /showing filed content only \(HTTP 401\)/);
});

test("public lists fall back to the filed content when Redis is not configured or unreachable", async () => {
  const saved = { url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN };
  try {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.deepEqual((await listPublicStories()).map((s) => s.slug), FILE_STORIES.map((s) => s.slug));
    assert.equal((await listPublicCalls()).length, FILE_CALLS.length);
    process.env.UPSTASH_REDIS_REST_URL = "https://bogus.invalid";
    process.env.UPSTASH_REDIS_REST_TOKEN = "bogus";
    const warn = console.warn;
    console.warn = () => {};
    try {
      assert.deepEqual((await listPublicStories()).map((s) => s.slug), FILE_STORIES.map((s) => s.slug));
      assert.equal((await listPublicCalls()).length, FILE_CALLS.length);
    } finally {
      console.warn = warn;
    }
  } finally {
    if (saved.url === undefined) delete process.env.UPSTASH_REDIS_REST_URL; else process.env.UPSTASH_REDIS_REST_URL = saved.url;
    if (saved.token === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN; else process.env.UPSTASH_REDIS_REST_TOKEN = saved.token;
  }
});

// ---------- the #40 regression: no runtime filesystem reads ----------

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .filter((path) => /\.(ts|tsx)$/.test(path))
    .map((path) => join(dir, path));
}

test("runtime code (app/, components/, lib/) never imports node:fs or the build-time loaders", () => {
  const runtime = [...sourceFiles("app"), ...sourceFiles("components"), ...sourceFiles("lib")].filter(
    (path) => !/lib\/(stories|calls)\/files\.ts$/.test(path) && !path.startsWith("lib/generated/"),
  );
  for (const path of runtime) {
    const text = readFileSync(path, "utf8");
    assert.doesNotMatch(text, /from ["'](node:)?fs(\/promises)?["']/, `${path} imports fs`);
    assert.doesNotMatch(text, /\/files(\.ts)?["']/, `${path} imports a build-time loader`);
    assert.doesNotMatch(text, /process\.cwd\(\)/, `${path} resolves paths from cwd`);
  }
});

test("generated content matches content/ (build step ran)", async () => {
  const { loadStories } = await import("../lib/stories/files.ts");
  const { loadCalls } = await import("../lib/calls/files.ts");
  assert.deepEqual(FILE_STORIES, JSON.parse(JSON.stringify(loadStories())));
  assert.deepEqual(FILE_CALLS, JSON.parse(JSON.stringify(loadCalls())));
});
