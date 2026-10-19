import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { combinedDirectory, createSession, envDirectory, readSession, redisDirectory } from "../lib/admin/auth.ts";
import { hashPassword, passwordIssues, verifyPassword } from "../lib/admin/passwords.ts";
import { clearUserFailures, clientIp, isLimited, MAX_FAILURES, recordFailure } from "../lib/admin/ratelimit.ts";
import { UserStore, usernameIssues } from "../lib/admin/users.ts";
import { fakeRedis } from "./fake-redis.ts";

const env = {
  ADMIN_EMAILS: "desk@example.com",
  ADMIN_PASSWORD: "owner password here",
  ADMIN_SESSION_SECRET: "s".repeat(40),
};

function setup(clock = { t: 1_000_000 }) {
  const redis = fakeRedis({ now: () => clock.t });
  const store = new UserStore(redis.config, { fetcher: redis.fetcher });
  const directory = combinedDirectory(envDirectory(env), redisDirectory(store));
  return { redis, store, directory, clock };
}

const pm = { username: "pm", label: "Product Manager", password: "pm-password-123", confirm: "pm-password-123" };

// ---------- hashing ----------

test("scrypt hashes use a per-user salt, verify the right password only, and never contain the password", async () => {
  const a = await hashPassword("correct horse battery");
  const b = await hashPassword("correct horse battery");
  assert.match(a, /^scrypt\$16384\$8\$1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$/);
  assert.notEqual(a, b, "different salts");
  assert.ok(!a.includes("correct horse"));
  assert.equal(await verifyPassword("correct horse battery", a), true);
  assert.equal(await verifyPassword("correct horse batterY", a), false);
  assert.equal(await verifyPassword("x", "not-a-hash"), false);
  assert.equal(await verifyPassword("x", "scrypt$99999999$8$1$AA$AA"), false, "refuses absurd cost");
});

test("password and username rules", () => {
  assert.deepEqual(passwordIssues("123456789012", "123456789012"), []);
  assert.match(passwordIssues("short", "short")[0], /at least 12/);
  assert.match(passwordIssues("123456789012", "123456789013")[0], /do not match/);
  assert.deepEqual(usernameIssues("chip-absolute"), []);
  assert.deepEqual(usernameIssues("pm"), []);
  for (const bad of ["p", "Chip", "chip_absolute", "chip absolute", "a".repeat(33), ""]) assert.equal(usernameIssues(bad).length, 1, bad);
  assert.match(usernameIssues("dillon")[0], /reserved/);
});

// ---------- users + directory ----------

test("owner signs in with 'dillon' or the ADMIN_EMAILS email; editors from Redis get the editor role", async () => {
  const { store, directory } = setup();
  assert.deepEqual(await store.create(pm), []);
  assert.deepEqual(await directory.verify("dillon", env.ADMIN_PASSWORD), { id: "owner:dillon", label: "dillon", role: "owner" });
  assert.equal((await directory.verify("DESK@example.com", env.ADMIN_PASSWORD))?.role, "owner");
  assert.deepEqual(await directory.verify("pm", pm.password), { id: "user:pm", label: "Product Manager", role: "editor" });
  assert.equal(await directory.verify("pm", "wrong-password-1"), null);
  assert.equal(await directory.verify("dillon", pm.password), null);
  assert.equal(await directory.verify("nobody", pm.password), null);
});

test("stored records hold a hash, never the password, and the list never exposes hashes", async () => {
  const { redis, store } = setup();
  await store.create(pm);
  const raw = redis.hashes.get("admin:users:v1")!.get("pm")!;
  const record = JSON.parse(raw);
  assert.deepEqual(Object.keys(record).sort(), ["createdAt", "disabled", "label", "passwordHash", "role", "username"]);
  assert.equal(record.role, "editor");
  assert.equal(record.disabled, false);
  assert.ok(!raw.includes(pm.password));
  const [listed] = await store.list();
  assert.equal("passwordHash" in listed, false);
});

test("create rejects duplicates, reserved and invalid names, short or mismatched passwords", async () => {
  const { store } = setup();
  assert.deepEqual(await store.create(pm), []);
  assert.match((await store.create(pm))[0], /already exists/);
  assert.match((await store.create({ ...pm, username: "dillon" }))[0], /reserved/);
  assert.match((await store.create({ ...pm, username: "PM!" }))[0], /lowercase/);
  assert.match((await store.create({ ...pm, username: "pm2", password: "short", confirm: "short" })).join(), /at least 12/);
  assert.match((await store.create({ ...pm, username: "pm3", confirm: "different-password" })).join(), /do not match/);
  assert.match((await store.create({ ...pm, username: "pm4", label: " " })).join(), /Display name/);
});

test("disabled or deleted users cannot sign in, and their existing sessions end on the next request", async () => {
  const { store, directory } = setup();
  await store.create(pm);
  const user = (await directory.verify("pm", pm.password))!;
  const token = createSession(user, Date.now(), env);
  assert.equal((await readSession(token, { env, directory }))?.role, "editor");
  await store.setDisabled("pm", true);
  assert.equal(await readSession(token, { env, directory }), null, "disabled ends session");
  assert.equal(await directory.verify("pm", pm.password), null, "disabled cannot sign in");
  await store.setDisabled("pm", false);
  assert.equal((await readSession(token, { env, directory }))?.label, "Product Manager", "re-enabled");
  await store.remove("pm");
  assert.equal(await readSession(token, { env, directory }), null, "deleted ends session");
});

test("password reset replaces the hash: old password stops working", async () => {
  const { store, directory } = setup();
  await store.create(pm);
  assert.match((await store.resetPassword("pm", "short", "short"))[0], /at least 12/);
  assert.deepEqual(await store.resetPassword("pm", "a-brand-new-password", "a-brand-new-password"), []);
  assert.equal(await directory.verify("pm", pm.password), null);
  assert.equal((await directory.verify("pm", "a-brand-new-password"))?.id, "user:pm");
});

test("if Redis is down, the owner env login and owner sessions still work; editors cannot sign in", async () => {
  const { redis, store, directory } = setup();
  await store.create(pm);
  const editorToken = createSession((await directory.verify("pm", pm.password))!, Date.now(), env);
  redis.setDown(true);
  const owner = await directory.verify("dillon", env.ADMIN_PASSWORD);
  assert.equal(owner?.role, "owner");
  assert.equal((await readSession(createSession(owner!, Date.now(), env), { env, directory }))?.role, "owner");
  assert.equal(await directory.verify("pm", pm.password), null);
  assert.equal(await readSession(editorToken, { env, directory }), null);
});

// ---------- rate limit ----------

test("rate limit: 10 failures per username or per IP within 15 minutes, then it resets", async () => {
  const clock = { t: 1_000_000 };
  const redis = fakeRedis({ now: () => clock.t });
  const options = { fetcher: redis.fetcher, log: () => {} };
  for (let i = 0; i < MAX_FAILURES - 1; i++) await recordFailure(redis.config, "pm", "1.1.1.1", options);
  assert.equal(await isLimited(redis.config, "pm", "1.1.1.1", options), false, "9 failures still allowed");
  await recordFailure(redis.config, "pm", "1.1.1.1", options);
  assert.equal(await isLimited(redis.config, "pm", "2.2.2.2", options), true, "username limited from another IP");
  assert.equal(await isLimited(redis.config, "chip", "1.1.1.1", options), true, "IP limited for another username");
  assert.equal(await isLimited(redis.config, "chip", "3.3.3.3", options), false);
  clock.t += 15 * 60 * 1000 + 1;
  assert.equal(await isLimited(redis.config, "pm", "1.1.1.1", options), false, "window expired");
});

test("rate limit: success clears the username counter; Redis down or missing fails open", async () => {
  const redis = fakeRedis();
  const logs: string[] = [];
  const options = { fetcher: redis.fetcher, log: (line: string) => logs.push(line) };
  for (let i = 0; i < MAX_FAILURES; i++) await recordFailure(redis.config, "pm", `10.0.0.${i}`, options);
  assert.equal(await isLimited(redis.config, "pm", "9.9.9.9", options), true);
  await clearUserFailures(redis.config, "pm", options);
  assert.equal(await isLimited(redis.config, "pm", "9.9.9.9", options), false);
  redis.setDown(true);
  assert.equal(await isLimited(redis.config, "pm", "9.9.9.9", options), false);
  await recordFailure(redis.config, "pm", "9.9.9.9", options);
  assert.equal(logs.length, 2);
  assert.equal(await isLimited(null, "pm", "9.9.9.9", options), false);
});

test("client IP comes from the first x-forwarded-for address", () => {
  const headers = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });
  assert.equal(clientIp(headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })), "203.0.113.7");
  assert.equal(clientIp(headers({ "x-real-ip": "198.51.100.2" })), "198.51.100.2");
  assert.equal(clientIp(headers({})), "unknown");
});

// ---------- pages and actions ----------

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("/admin/users and every user action are owner-only", () => {
  const page = read("app/admin/users/page.tsx");
  assert.match(page, /if \(!user\) redirect\("\/admin"\)/);
  assert.match(page, /if \(!isOwner\(user\)\)[\s\S]*Only the owner can manage users/);
  const actions = read("app/admin/actions.ts");
  for (const name of ["createUserAction", "resetPasswordAction", "setUserDisabledAction", "deleteUserAction"]) {
    const body = actions.slice(actions.indexOf(`export async function ${name}`));
    assert.match(body.slice(0, body.indexOf("\n}")), /await requireOwner\(\)/, name);
  }
  assert.match(actions, /async function requireOwner\(\) \{\n  const user = await requireAdmin\(\);\n  if \(!isOwner\(user\)\)/);
  assert.match(read("app/admin/page.tsx"), /isOwner\(user\) \? <Link href="\/admin\/users"/);
});

test("sign-in form fields are labelled Username and Password", () => {
  const forms = read("app/admin/forms.tsx");
  assert.match(forms, /<label htmlFor="username"[^>]*>Username<\/label>\s*<input id="username" name="username" type="text" autoComplete="username"/);
  assert.match(forms, /<label htmlFor="password"[^>]*>Password<\/label>\s*<input id="password" name="password" type="password" autoComplete="current-password"/);
});

test("login and user code never log passwords or hashes", () => {
  for (const path of ["app/admin/actions.ts", "lib/admin/auth.ts", "lib/admin/users.ts", "lib/admin/passwords.ts", "lib/admin/ratelimit.ts"]) {
    for (const line of read(path).split("\n").filter((l) => /console\.|log\(/.test(l))) {
      assert.doesNotMatch(line, /password|hash/i, `${path}: ${line.trim()}`);
    }
  }
});
