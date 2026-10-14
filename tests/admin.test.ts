import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLogin, createSession, readSession, authConfigured } from "../lib/admin/auth.ts";
import { MemoryAdminStore, selectAdminStore, RedisAdminStore, type AdminStory, type AdminStoryStore } from "../lib/admin/store.ts";
import { ADMIN_STORY_LABEL, EMPTY_SOURCES_WARNING, parseSources, publishedAdminStories, renderAdminStory, sourcesWarning, validateAdminStory } from "../lib/admin/stories.ts";

const env = { ADMIN_EMAILS: "Editor@Example.com, desk@example.com", ADMIN_PASSWORD: "correct horse", ADMIN_SESSION_SECRET: "s3cret" };

function story(overrides: Partial<AdminStory> = {}): AdminStory {
  return {
    slug: "admin-test-story", title: "Admin test story", dek: "A dek.", body: "Chip has a take.\n\n## Then\n\nMore take.",
    voiceId: "chip-absolute", date: "2026-10-14", sources: [], status: "draft", updatedAt: "2026-10-14T00:00:00Z", ...overrides,
  };
}

test("admin auth is off without an allowlist and password", () => {
  assert.equal(authConfigured({}), false);
  assert.equal(authConfigured({ ADMIN_EMAILS: "a@b.c" }), false);
  assert.equal(checkLogin("a@b.c", "x", { ADMIN_EMAILS: "a@b.c" }), null);
  assert.equal(authConfigured(env), true);
});

test("login needs an allowlisted email and the right password", () => {
  assert.equal(checkLogin(" editor@example.com ", "correct horse", env), "editor@example.com");
  assert.equal(checkLogin("other@example.com", "correct horse", env), null);
  assert.equal(checkLogin("editor@example.com", "wrong", env), null);
});

test("sessions are signed, expire, and drop when the email leaves the allowlist", () => {
  const now = 1_000_000;
  const token = createSession("desk@example.com", now, env);
  assert.equal(readSession(token, now + 1000, env), "desk@example.com");
  assert.equal(readSession(token, now + 13 * 3600 * 1000, env), null);
  assert.equal(readSession(token.replace(/.$/, (c) => (c === "A" ? "B" : "A")), now, env), null);
  assert.equal(readSession(token, now, { ...env, ADMIN_SESSION_SECRET: "rotated" }), null);
  assert.equal(readSession(token, now, { ...env, ADMIN_EMAILS: "editor@example.com" }), null);
  assert.equal(readSession(undefined, now, env), null);
});

test("store uses Upstash env names and never the memory store in production", () => {
  assert.ok(selectAdminStore({ UPSTASH_REDIS_REST_URL: "https://x.upstash.io", UPSTASH_REDIS_REST_TOKEN: "t" }) instanceof RedisAdminStore);
  assert.ok(selectAdminStore({ KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "t" }) instanceof RedisAdminStore);
  assert.equal(selectAdminStore({ NODE_ENV: "production", ADMIN_DEV_MEMORY: "1" }), null);
  assert.equal(selectAdminStore({ NODE_ENV: "development" }), null);
  assert.ok(selectAdminStore({ NODE_ENV: "development", ADMIN_DEV_MEMORY: "1" }) instanceof MemoryAdminStore);
});

test("sources parse as Label | URL and reject non-web links", () => {
  const { sources, issues } = parseSources("Box score | https://www.espn.com/nfl/game\n\nhttps://www.nfl.com/\nBad | javascript:alert(1)");
  assert.deepEqual(sources, [
    { label: "Box score", url: "https://www.espn.com/nfl/game" },
    { label: "www.nfl.com", url: "https://www.nfl.com/" },
  ]);
  assert.equal(issues.length, 1);
});

test("admin stories use the filed-story checks and shape", () => {
  const rendered = renderAdminStory(story({ sources: [{ label: "Box", url: "https://example.com/" }] }));
  assert.equal(rendered.slug, "admin-test-story");
  assert.equal(rendered.dateLabel, "Oct 14, 2026");
  assert.match(rendered.html, /<h2[^>]*>Then<\/h2>/);
  assert.deepEqual(rendered.sources, [{ label: "Box", url: "https://example.com/" }]);
  assert.deepEqual(validateAdminStory(story(), []), []);
  assert.ok(validateAdminStory(story(), ["admin-test-story"]).some((issue) => issue.startsWith("Slug")));
  assert.ok(validateAdminStory(story({ voiceId: "nobody" }), []).some((issue) => issue.startsWith("Author")));
  assert.ok(validateAdminStory(story({ body: "Built on GitHub." }), []).length > 0);
  assert.ok(validateAdminStory(story({ body: "<script>x</script>" }), []).length > 0);
});

test("only published, valid, non-colliding admin stories go public", async () => {
  const store = new MemoryAdminStore();
  await store.put(story({ slug: "live-one", status: "published" }));
  await store.put(story({ slug: "draft-one", status: "draft" }));
  await store.put(story({ slug: "filed-slug", status: "published" }));
  await store.put(story({ slug: "broken", status: "published", body: "" }));
  const out = await publishedAdminStories(store, ["filed-slug"]);
  assert.deepEqual(out.map((item) => item.slug), ["live-one"]);
});

test("a store outage leaves the public story list alone", async () => {
  const failing: AdminStoryStore = { kind: "redis", list: async () => { throw new Error("down"); }, get: async () => null, put: async () => {}, putPreview: async () => {}, getPreview: async () => null };
  assert.deepEqual(await publishedAdminStories(failing, []), []);
  assert.deepEqual(await publishedAdminStories(null, []), []);
});

test("the SATIRE label is locked server-side, whatever the form sends", () => {
  const forged = { ...story(), label: "NONE" } as AdminStory & { label: string };
  const rendered = renderAdminStory(forged);
  assert.equal(rendered.label, "SATIRE");
  assert.equal(rendered.demo, false);
  assert.equal(ADMIN_STORY_LABEL, "SATIRE");
});

test("an empty sources list warns but does not block publishing", () => {
  assert.equal(sourcesWarning(""), EMPTY_SOURCES_WARNING);
  assert.equal(sourcesWarning("  \n "), EMPTY_SOURCES_WARNING);
  assert.equal(sourcesWarning("Box | https://example.com/"), null);
  assert.deepEqual(validateAdminStory(story({ sources: [] }), []), []);
});

test("sources render like filed stories: a bold Sources line and a link list", () => {
  const rendered = renderAdminStory(story({ sources: [{ label: "Box [score]", url: "https://example.com/a" }] }));
  assert.match(rendered.body, /\*\*Sources\*\*\n\n- \[Box \\\[score\\\]\]\(<https:\/\/example\.com\/a>\)/);
  assert.match(rendered.html, /href="https:\/\/example\.com\/a"/);
});

test("previews are per admin and separate from saved stories", async () => {
  const store = new MemoryAdminStore();
  await store.putPreview("a@example.com", story({ title: "Unsaved" }));
  assert.equal((await store.getPreview("a@example.com"))?.title, "Unsaved");
  assert.equal(await store.getPreview("b@example.com"), null);
  assert.deepEqual(await store.list(), []);
  assert.deepEqual(await publishedAdminStories(store, []), []);
});
