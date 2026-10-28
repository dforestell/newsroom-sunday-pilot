import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getCallRecord } from "../lib/calls.ts";
import { StaffView } from "../components/staff-view.tsx";
import { StoryCard } from "../components/story-card.tsx";
import { HomeFeatured, HomeStories } from "../components/home-sections.tsx";
import { ACTIVE_CAST, CAST, INACTIVE_SLUGS, LEAD_VOICE_ID, getVoice, isActiveVoice } from "../lib/cast.ts";
import { FILE_CALLS, FILE_STORIES } from "../lib/generated/content.ts";
import { STAFF_SLUGS, callsForStaff, getStaff, requireStaff, staffPath, storiesByStaff } from "../lib/staff.ts";
import { FALLBACK_TOKENS, PERSONA_THEMES, countLabel, staffTheme, staffThemeStyle } from "../lib/staff/themes.ts";

const source = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const view = (slug: string) => {
  const voice = requireStaff(slug);
  return renderToStaticMarkup(
    createElement(StaffView, { voice, theme: staffTheme(voice), stories: storiesByStaff(FILE_STORIES, slug), calls: callsForStaff(FILE_CALLS, slug), chipCalls: callsForStaff(FILE_CALLS, "chip-absolute") }),
  );
};
const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");

test("every cast slug is a staff slug, and lookup is exact", () => {
  assert.deepEqual(STAFF_SLUGS, ACTIVE_CAST.map((voice) => voice.slug));
  assert.deepEqual(STAFF_SLUGS, ["chip-absolute", "nora-median", "benny-faithful", "poor-form-desk"]);
  for (const slug of INACTIVE_SLUGS) assert.equal(getStaff(slug), undefined, `${slug} is hidden`);
  assert.match(source("app/staff/[slug]/page.tsx"), /STAFF_SLUGS\.map\(\(slug\) => \(\{ slug \}\)\)/);
  for (const slug of STAFF_SLUGS) assert.equal(getStaff(slug)?.slug, slug);
  assert.equal(getStaff("chip-absolute")?.name, "Chip Absolute");
  for (const bad of ["Chip-Absolute", "chip", "lead-blogger", "", "chip-absolute/", "../cast", "desk"]) assert.equal(getStaff(bad), undefined, bad);
  assert.equal(staffPath("wes-process"), "/staff/wes-process");
});

test("story filter keeps only that author's stories", () => {
  for (const slug of STAFF_SLUGS) {
    const mine = storiesByStaff(FILE_STORIES, slug);
    assert.ok(mine.every((story) => story.voiceId === slug), slug);
  }
  const total = STAFF_SLUGS.reduce((sum, slug) => sum + storiesByStaff(FILE_STORIES, slug).length, 0);
  assert.equal(total, FILE_STORIES.filter((s) => isActiveVoice(getVoice(s.voiceId))).length, "every listed story belongs to exactly one staff page");
  const fake = [{ ...FILE_STORIES[0], slug: "a", voiceId: "wes-process" }, { ...FILE_STORIES[0], slug: "b", voiceId: "boo-atlas" }];
  assert.deepEqual(storiesByStaff(fake, "wes-process").map((story) => story.slug), ["a"]);
  assert.deepEqual(storiesByStaff(fake, "nobody"), []);
});

test("calls belong to Chip only", () => {
  assert.equal(callsForStaff(FILE_CALLS, LEAD_VOICE_ID).length, FILE_CALLS.length);
  assert.deepEqual(callsForStaff(FILE_CALLS, "wes-process"), []);
});

test("an unknown staff slug 404s and is not prerendered", () => {
  for (const bad of ["nobody", "Chip-Absolute", "desk"]) {
    assert.throws(() => requireStaff(bad), (error: { digest?: string }) => /404/.test(String(error.digest)), bad);
  }
  const page = source("app/staff/[slug]/page.tsx");
  assert.match(page, /export const dynamicParams = false/);
  assert.match(page, /requireStaff\(slug\)/);
  assert.match(page, /if \(!voice\) return \{ title: "Staff" \}/);
});

test("staff pages have a canonical /staff URL resolved against metadataBase", () => {
  assert.match(source("app/staff/[slug]/page.tsx"), /alternates: \{ canonical: staffPath\(voice\.slug\) \}/);
  assert.match(source("app/layout.tsx"), /metadataBase/);
});

test("Chip's page lists his calls with sport chips and his stories; others list only their own stories", () => {
  const chip = view("chip-absolute");
  assert.match(chip, /data-persona="chip-absolute"/);
  for (const story of storiesByStaff(FILE_STORIES, "chip-absolute")) assert.ok(chip.includes(`href="/stories/${story.slug}"`), story.slug);
  for (const story of FILE_STORIES.filter((story) => story.voiceId !== "chip-absolute")) assert.equal(chip.includes(`href="/stories/${story.slug}"`), false, story.slug);
  assert.match(chip, /id="staff-calls"[^>]*>The Calls</);
  assert.match(chip, /Sport: <\/span>NFL/);
  assert.match(chip, /Christian McCaffrey runs for 100\+ yards/);
  assert.ok(chip.includes(`${FILE_CALLS.length} takes on the record`));

  {
    const html = view("nora-median");
    const { hits, misses } = getCallRecord(callsForStaff(FILE_CALLS, "chip-absolute")).tally;
    assert.match(html, /data-persona-record[^>]*>The Median Ledger: 0–0</);
    assert.equal(/id="staff-stories"/.test(html), false, "no empty stories row on Nora launch");
    assert.equal(html.includes("Nothing filed yet."), false);
    assert.equal(html.includes("My first call goes"), false);
    assert.ok(html.includes("Launch (Oct 28)"));
    assert.ok(html.includes("Nora replies") && html.includes("Chip replies"));
    assert.ok(html.includes(`data-chip-record="true">${hits}–${misses}<`) || html.includes(`data-chip-record="">${hits}–${misses}<`));
    assert.ok(html.includes(`Chip&#x27;s is <!-- -->${hits}–${misses}`) || html.includes(`Chip&#x27;s is ${hits}–${misses}`));
    assert.ok(html.includes("Two columns. Record and replies. Both get filled."));
  }
  for (const slug of ["benny-faithful"]) {
    const html = view(slug);
    assert.match(html, /id="staff-stories"[^>]*>Stories by /);
    assert.equal(/id="staff-calls"/.test(html), false, "no calls are faked");
    assert.match(html, /data-persona-record[^>]*>The (Median Ledger|Believer&#x27;s Record): 0–0</);
    assert.ok(html.includes("Nothing filed yet."));
  }
  for (const slug of STAFF_SLUGS) {
    const html = view(slug);
    const theme = staffTheme(getStaff(slug)!);
    assert.ok(html.includes(escape(theme.bio)), `${slug} bio`);
    if (slug !== LEAD_VOICE_ID && slug !== "nora-median" && storiesByStaff(FILE_STORIES, slug).length === 0) assert.ok(html.includes(escape(theme.labels.empty)), `${slug} empty`);
    assert.match(html, new RegExp(`<a [^>]*aria-current="page"[^>]*href="/staff/${slug}"|<a [^>]*href="/staff/${slug}"[^>]*aria-current="page"`));
    assert.equal(/class="[^"]*border-2[^"]*"[^>]*>\s*<a href="\/stories/.test(html), false, "stories are rows, not cards");
  }
});

test("each persona maps to a repo slug; unknown cast members get the shared fallback", () => {
  assert.deepEqual(Object.keys(PERSONA_THEMES).sort(), CAST.map((voice) => voice.slug).sort(), "every voice (hidden ones too) keeps its theme");
  const unknown = { ...CAST[0], slug: "special-teams-goblin", name: "Special Teams Goblin" };
  const fallback = staffTheme(unknown);
  assert.equal(fallback.specified, false);
  assert.deepEqual(fallback.tokens, FALLBACK_TOKENS);
  assert.equal(fallback.labels.section, "Stories by Special Teams Goblin");
  assert.equal(fallback.labels.empty, "Nothing filed yet.");
  assert.equal(countLabel(fallback.labels.count, 3), "3 stories");
  assert.equal(fallback.labels.back, "← All staff");
  assert.equal(fallback.bio, unknown.publicLead ?? unknown.bio, "fallback bio is existing cast copy");
  assert.equal(fallback.font, undefined);
});

test("persona tokens stay scoped: only --persona-* variables, one extra font at most", () => {
  for (const voice of CAST) {
    for (const key of Object.keys(staffThemeStyle(staffTheme(voice)))) assert.match(key, /^--persona-/, `${voice.slug} sets ${key}`);
  }
  const chip = staffThemeStyle(staffTheme(getStaff("chip-absolute")!), "'Anton'");
  assert.equal(chip["--persona-display-font"], "'Anton', var(--font-newsreader), serif");
  assert.equal(chip["--persona-header-bg"], "#7a0f0a");
  const fonts = STAFF_SLUGS.map((slug) => PERSONA_THEMES[slug].font).filter(Boolean);
  assert.equal(new Set(fonts).size, fonts.length);
  assert.match(source("lib/staff/fonts.ts"), /preload: false/);
  assert.equal(/staff\/fonts/.test(source("app/layout.tsx")), false, "persona fonts are not loaded site-wide");
});

test("persona text colors meet WCAG AA, and DEMO chip text passes on orange", () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const paper = "#f4ebe0";
  for (const voice of [...CAST, { ...CAST[0], slug: "unknown-seat" }]) {
    const t = staffTheme(voice).tokens;
    const bg = t["--persona-header-bg"]!;
    assert.ok(ratio(t["--persona-header-fg"]!, bg) >= 4.5, `${voice.slug} header fg`);
    assert.ok(ratio(t["--persona-header-meta"]!, bg) >= 4.5, `${voice.slug} header meta`);
    assert.ok(ratio(t["--persona-link"]!, paper) >= 4.5, `${voice.slug} link`);
    assert.ok(ratio(t["--persona-link-hover"]!, paper) >= 4.5, `${voice.slug} link hover`);
  }
  assert.ok(ratio("#0c0908", "#e85d04") >= 4.5);
  assert.ok(ratio("#fff8ef", "#e85d04") < 4.5, "cream on DEMO orange fails, hence the fix");
});

test("DEMO chips use near-black text, not cream", () => {
  assert.match(source("components/desk-pill.tsx"), /tone === "demo" && "bg-demo text-ink"/);
  for (const file of ["components/desk-pill.tsx", "components/demo-banner.tsx", "components/scorebug.tsx", "components/game-score.tsx", "components/scoreboard/game-score-card.tsx"]) {
    assert.equal(/bg-demo[^"]*text-demo-foreground/.test(source(file)), false, file);
  }
});

test("persona bios are the Editor-reviewed text", () => {
  assert.match(source("lib/staff/themes.ts"), /EDITOR-REVIEWED 2026-10-21/);
  const bio = (slug: string) => PERSONA_THEMES[slug].bio;
  assert.equal(bio("layover-len"), "Day-before arrivals are vibes. Week-early arrivals are violence. I argue clocks, never bodies.");
  assert.equal(bio("boo-atlas"), "I keep a list of 'home games' that sounded like road trips — and I redraw the map when the building proves me wrong.");
  assert.equal(bio("chyron-carl"), "I watch the broadcast like a second game — usually the closer one. Sometimes the intro works on me anyway.");
  assert.equal(PERSONA_THEMES["wes-process"].labels?.empty, "No fourth down worth a ballot. Default is skip.");
  assert.equal(PERSONA_THEMES["chyron-carl"].labels?.empty, "Nothing aired worth a chyron. Dead air is the correct call.");
});

test("staff pages show no cast titles, and Chip's calls link is absolute", () => {
  for (const voice of ACTIVE_CAST) {
    const html = view(voice.slug);
    assert.equal(html.includes(`>${voice.title}<`), false, `${voice.slug} shows its title`);
  }
  for (const file of ["components/staff-view.tsx", "app/staff/[slug]/page.tsx", "app/staff/page.tsx", "components/cast-strip.tsx", "components/home-sections.tsx", "app/stories/[slug]/page.tsx"]) {
    assert.equal(/voice\.title/.test(source(file)), false, `${file} renders a cast title`);
  }
  assert.equal(/STAFF_TITLE_SLOT/.test(source("components/staff-view.tsx")), false);
  assert.deepEqual(CAST.map((voice) => voice.name), ["Chip Absolute", "Wes Process", "Layover Len", "Boo Atlas", "Chyron Carl", "Postcard Pete", "Nora Median", "Benny Faithful", "Poor Form Desk"]);
  for (const voice of CAST) assert.equal(voice.name.toLowerCase().replace(/ /g, "-"), voice.slug, `${voice.slug} name matches slug`);
  assert.ok(view("chip-absolute").includes('href="https://poorformsports.com/calls"'));
});

test("bylines and names link to /staff/<slug> without nesting links", () => {
  const hidden = FILE_STORIES.find((entry) => entry.voiceId === "postcard-pete")!;
  const plain = renderToStaticMarkup(createElement(StoryCard, { story: hidden }));
  assert.equal(plain.includes('href="/staff/postcard-pete"'), false, "hidden voices keep a plain-text byline");
  assert.ok(plain.includes("Postcard Pete"));
  const story = FILE_STORIES.find((entry) => entry.voiceId === "chip-absolute")!;
  for (const html of [
    renderToStaticMarkup(createElement(StoryCard, { story })),
    renderToStaticMarkup(createElement(HomeStories, { stories: [story] })),
    renderToStaticMarkup(createElement(HomeFeatured, { story, calls: [] })),
  ]) {
    assert.ok(html.includes(`href="/staff/${story.voiceId}"`));
    assert.ok(html.includes(`href="/stories/${story.slug}"`));
    assert.equal(/<a [^>]*>(?:(?!<\/a>)[\s\S])*<a /.test(html), false, "no nested links");
  }
  for (const file of ["components/cast-strip.tsx", "components/game-view.tsx", "components/entry-list.tsx", "components/home-sections.tsx", "components/story-card.tsx", "components/site-nav.tsx", "components/calls-list.tsx", "app/staff/page.tsx", "app/stories/[slug]/page.tsx", "components/staff-view.tsx", "app/bloggers/[id]/page.tsx"]) {
    assert.equal(/["`]\/cast\/\$?\{?[a-z]/.test(source(file)), false, `${file} still links to /cast/<slug>`);
  }
});

test("/cast/<slug> 308s to /staff/<slug> but avatar images still load", async () => {
  const { default: config } = await import("../next.config.ts");
  const rule = (await config.redirects!()).find((entry) => entry.destination === "/staff/:slug");
  assert.ok(rule);
  assert.equal(rule.permanent, true);
  assert.equal(rule.source, `/cast/:slug(${ACTIVE_CAST.map((v) => v.slug).join("|")})`);
  const fallback = (await config.redirects!()).find((entry) => entry.source === "/cast/:slug([a-z0-9-]+)");
  assert.equal(fallback?.destination, "/staff", "unknown /cast/<slug> lands on the staff index, never a dead /staff/<slug>");
  const pattern = /^\/cast\/([a-z0-9-]+)$/;
  assert.ok(pattern.test("/cast/chip-absolute"));
  assert.equal(pattern.test("/cast/chip-absolute.png"), false);
});

test("staff page copy stays public-safe and has no hard-coded preview host", () => {
  for (const file of ["app/staff/[slug]/page.tsx", "lib/staff.ts", "lib/staff/themes.ts", "lib/staff/fonts.ts", "components/staff-link.tsx", "components/staff-view.tsx"]) {
    const text = source(file).replace(/\/\/.*$/gm, "");
    for (const pattern of [/\bDillon\b/, /\bDEMO\b/, /\bGitHub\b/i, /\bCursor\b/, /vercel\.app/]) assert.equal(pattern.test(text), false, `${file} ${pattern}`);
  }
});

test("hidden voices: /staff/<slug>, /cast/<slug> and /cast 307 to /staff; nothing deleted", async () => {
  assert.deepEqual(INACTIVE_SLUGS, ["wes-process", "layover-len", "boo-atlas", "chyron-carl", "postcard-pete"]);
  const { default: config } = await import("../next.config.ts");
  const rules = await config.redirects!();
  const match = (path: string) => rules.find((r) => new RegExp(`^${r.source.replace(/:slug\(([^)]+)\)/, "($1)")}$`).test(path));
  for (const slug of INACTIVE_SLUGS) {
    for (const path of [`/staff/${slug}`, `/cast/${slug}`]) {
      const rule = match(path);
      assert.equal(rule?.destination, "/staff", path);
      assert.equal(rule?.permanent, false, `${path} is temporary (307)`);
    }
    assert.ok(PERSONA_THEMES[slug], `${slug} theme kept`);
    assert.ok(CAST.some((voice) => voice.slug === slug), `${slug} cast entry kept`);
  }
  assert.equal(match("/cast")?.destination, "/staff");
  assert.equal(match("/cast")?.permanent, false);
  assert.equal(match("/staff/nora-median"), undefined);
  for (const file of ["components/cast-strip.tsx", "components/home-sections.tsx", "components/staff-view.tsx", "app/staff/page.tsx"]) {
    assert.match(source(file), /ACTIVE_CAST\.map/, file);
  }
});

test("new personas use the spec bios verbatim and names only", () => {
  assert.equal(PERSONA_THEMES["nora-median"].bio, "I'm Nora Median. I pick the same games Chip does. I'll let the ledger do the talking.");
  assert.equal(PERSONA_THEMES["benny-faithful"].bio, "I'm Benny Faithful. I tail every Chip call. The official record and I disagree on several counts.");
  assert.equal(PERSONA_THEMES["nora-median"].font, "inter");
  assert.equal(PERSONA_THEMES["benny-faithful"].font, "bebas-neue");
});
