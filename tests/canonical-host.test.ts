import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalRedirect, REDIRECT_HOSTS } from "../lib/canonical-host.ts";
import { DEFAULT_SITE_URL, resolveSiteUrl, SITE_URL, siteUrl } from "../lib/site.ts";
import { shareMetadata } from "../lib/share.ts";

const get = (host: string | null, pathname = "/", search = "", method = "GET") =>
  canonicalRedirect({ method, host, pathname, search }, "https://poorformsports.com");

test("SITE_URL defaults to poorformsports.com and accepts an origin override", () => {
  assert.equal(DEFAULT_SITE_URL, "https://poorformsports.com");
  assert.equal(SITE_URL, resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL));
  assert.equal(resolveSiteUrl(undefined), "https://poorformsports.com");
  assert.equal(resolveSiteUrl(" "), "https://poorformsports.com");
  assert.equal(resolveSiteUrl("https://staging.example.com/some/path/"), "https://staging.example.com");
  assert.equal(resolveSiteUrl("http://localhost:3000"), "http://localhost:3000");
  assert.equal(resolveSiteUrl("not a url"), "https://poorformsports.com");
  assert.equal(resolveSiteUrl("javascript:alert(1)"), "https://poorformsports.com");
  if (!process.env.NEXT_PUBLIC_SITE_URL) assert.equal(siteUrl("/calls"), "https://poorformsports.com/calls");
});

test("the old Vercel host and www 308 to the apex with path and query kept", () => {
  assert.deepEqual([...REDIRECT_HOSTS], ["newsroom-sunday-pilot.vercel.app", "www.poorformsports.com"]);
  assert.equal(get("newsroom-sunday-pilot.vercel.app"), "https://poorformsports.com/");
  assert.equal(get("www.poorformsports.com", "/calls", "?a=1&b=two"), "https://poorformsports.com/calls?a=1&b=two");
  assert.equal(get("WWW.PoorFormSports.com:443", "/stories/x"), "https://poorformsports.com/stories/x");
  assert.equal(get("www.poorformsports.com.", "/"), "https://poorformsports.com/");
  assert.equal(get("newsroom-sunday-pilot.vercel.app", "/admin/calls/edit", "?postUrl=x"), "https://poorformsports.com/admin/calls/edit?postUrl=x");
  assert.equal(get("newsroom-sunday-pilot.vercel.app", "/_next/static/chunk.js"), "https://poorformsports.com/_next/static/chunk.js");
  assert.equal(get("www.poorformsports.com", "/", "", "HEAD"), "https://poorformsports.com/");
  assert.equal(get("www.poorformsports.com", "/", "", "get"), "https://poorformsports.com/");
});

test("previews, deployments, localhost, the apex and unknown hosts are not redirected", () => {
  for (const host of [
    "poorformsports.com",
    "newsroom-sunday-pilot-g8ggf4ji0-poor-form-sports.vercel.app",
    "newsroom-sunday-pilot-git-feat-canonical-domain-poor-form-sports.vercel.app",
    "newsroom-sunday-pilot.vercel.app.evil.com",
    "evil-newsroom-sunday-pilot.vercel.app",
    "poorformsports.com.example",
    "localhost:3000",
    "127.0.0.1:3147",
    "",
  ]) {
    assert.equal(get(host, "/calls"), null, host);
  }
  assert.equal(get(null), null);
});

test("server actions, POSTs and other writes pass through on every host", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    assert.equal(get("www.poorformsports.com", "/admin", "", method), null, method);
    assert.equal(get("newsroom-sunday-pilot.vercel.app", "/admin/login", "", method), null, method);
  }
});

test("redirects never loop onto the site's own host", () => {
  assert.equal(canonicalRedirect({ method: "GET", host: "www.poorformsports.com", pathname: "/", search: "" }, "https://www.poorformsports.com"), null);
});

test("share metadata uses absolute canonical, Open Graph and Twitter URLs on SITE_URL", () => {
  const meta = shareMetadata("Chip’s calls", "Takes.", "/calls");
  assert.equal(meta.alternates?.canonical, siteUrl("/calls"));
  const og = meta.openGraph as { url: string; images: { url: string }[] };
  assert.equal(og.url, siteUrl("/calls"));
  assert.equal(og.images[0].url, siteUrl("/brand/wordmark-bar.png"));
  assert.deepEqual((meta.twitter as { images: string[] }).images, [siteUrl("/brand/wordmark-bar.png")]);
});

test("proxy uses a 308 and the pure redirect function", () => {
  const source = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.match(source, /canonicalRedirect\(/);
  assert.match(source, /NextResponse\.redirect\(location, 308\)/);
  assert.match(source, /export function proxy/);
});

test("no public code hard-codes the old Vercel host", () => {
  for (const file of ["app/layout.tsx", "lib/share.ts", "lib/site.ts", "components/site-chrome.tsx"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.equal(/vercel\.app/.test(source), false, file);
  }
});
