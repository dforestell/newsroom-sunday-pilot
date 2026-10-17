import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { FilingError, loadStories, parseStory } from "../lib/stories/content.ts";
import { parseMarkdown, renderMarkdown } from "../lib/stories/markdown.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/stories/${name}.md`, import.meta.url), "utf8");
const valid = fixture("valid");

function withFiles(files: Record<string, string>, check: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), "pfs-story-test-"));
  try {
    for (const [name, body] of Object.entries(files)) writeFileSync(join(directory, name), body);
    check(directory);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test("all migrated public URLs resolve from files, preserving dates, bylines and labels", () => {
  const stories = loadStories();
  for (const slug of ["tnf-det-buf-recap-highmark-2026-09-17", "staff-picks-rest-of-2026", "tnf-whats-ahead-lions-at-bills-2026-09-17", "likely-debut-not-a-plaque", "notarized-postcard-walker-week1", "conversion-referendum-arrowhead-fourth", "fifteen-plays-one-continent-zero-chill", "conversion-referendums-week1"]) {
    const story = stories.find((item) => item.slug === slug);
    assert.ok(story, slug);
    assert.ok(story.html.includes("<p>"));
    assert.equal(story.label, slug.startsWith("tnf-") ? "SATIRE" : "DEMO / SATIRE");
  }
  const staff = stories.find((story) => story.slug === "staff-picks-rest-of-2026")!;
  assert.equal(staff.dateLabel, "Filed Sep 17, 2026 · Corrected Sep 18, 2026 · Rookie picks added Oct 14, 2026");
  assert.equal(staff.bylineDetail, "with the whole newsroom");
  assert.equal((staff.html.match(/<table>/g) ?? []).length, 7);
  assert.equal((staff.html.match(/<tr>/g) ?? []).length, 42);
  assert.match(stories.find((story) => story.slug === "fifteen-plays-one-continent-zero-chill")!.html, /<em>acted<\/em>/);
  const highmark = stories.find((story) => story.slug === "tnf-det-buf-recap-highmark-2026-09-17")!;
  assert.equal(highmark.dateLabel, "Sep 17, 2026");
  assert.equal(highmark.bylineDetail, "with Desk segments");
  assert.match(highmark.html, /Lions defense, second-half edition/);
  assert.doesNotMatch(highmark.html, /Without Ben/);
  assert.doesNotMatch(highmark.html, /title="/);
});

test("a lone Markdown image becomes a figure; the title is the caption", () => {
  const html = renderMarkdown(parseMarkdown('![Alt text](/graphics/example.jpg "With Ben. Without Ben.")').tree);
  assert.match(html, /<figure>/);
  assert.match(html, /src="\/graphics\/example.jpg"/);
  assert.match(html, /alt="Alt text"/);
  assert.match(html, /<figcaption>With Ben. Without Ben.<\/figcaption>/);
  assert.doesNotMatch(html, /<p>/);
  assert.doesNotMatch(html, /title="/);
});

test("a new content-only file renders headings, tables, emphasis, lists and internal links", () => {
  withFiles({ "new-story.md": valid }, (directory) => {
    const [story] = loadStories(directory);
    assert.equal(story.slug, "fixture-column");
    assert.equal(story.dek, "");
    assert.match(story.html, /<h2 id="story-a-heading">/);
    assert.match(story.html, /<strong>bold<\/strong>/);
    assert.match(story.html, /<ul>/);
    assert.match(story.html, /class="story-table"/);
    assert.match(story.html, /<th scope="col">Category<\/th>/);
    assert.match(story.html, /href="\/cast\/chip-absolute"/);
  });
});

for (const [name, field, correction] of [["bad-slug", "slug", "lowercase"], ["bad-voice", "voiceId", "Choose a cast voiceId"]]) {
  test(`CI command fails clearly on ${name} fixture`, () => {
    withFiles({ [`${name}.md`]: fixture(name) }, (directory) => {
      const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-stories.ts", directory], { cwd: resolve("."), encoding: "utf8" });
      assert.equal(result.status, 1, result.stderr);
      assert.ok(result.stderr.includes(`${name}.md — ${field}:`), result.stderr);
      assert.ok(result.stderr.includes(correction), result.stderr);
    });
  });
}

test("duplicate slugs name both files and the required correction", () => {
  withFiles({ "first.md": valid, "second.md": valid }, (directory) => {
    assert.throws(() => loadStories(directory), /second.md — slug:.*first.md.*Choose a unique slug/);
  });
});

for (const href of ["/games/missing", "/cast/missing", "/stories/missing", "/missing", "https://poorformsports.com/stories/missing", "#missing-anchor"]) {
  test(`broken internal link fails: ${href}`, () => {
    withFiles({ "link.md": valid + `\n[Link](${href})\n` }, (directory) => {
      assert.throws(() => loadStories(directory), (error: unknown) => error instanceof FilingError && /link.md — body:\d+:/.test(error.message) && error.message.includes(href));
    });
  });
}

test("cross-story, reference-style and public asset links validate", () => {
  const second = valid.replaceAll("fixture-column", "second-column");
  withFiles({ "one.md": valid + "\n[Other][other]\n\n[other]: /stories/second-column#story-a-heading\n\n![Mark](/brand/wordmark-bar.png)\n", "two.md": second }, (directory) => {
    assert.equal(loadStories(directory).length, 2);
  });
});

for (const [field, source] of [
  ["title", valid.replace("title: Fixture column\n", "")],
  ["voiceId", valid.replace("voiceId: chip-absolute\n", "")],
  ["date", valid.replace("2026-09-17", "2026-02-30")],
  ["label", valid.replace("label: SATIRE\n", "")],
  ["body", valid.slice(0, valid.indexOf("## A heading"))],
  ["frontmatter", "No metadata"],
  ["frontmatter", valid.replace("title: Fixture column", "title: [broken")],
  ["body", valid + "\nDillon said this was ready for GitHub.\n"],
  ["body", valid + "\n<script>alert(1)</script>\n"],
  ["body", valid + "\n<Widget />\n"],
] as const) {
  test(`filing error includes actionable ${field} context`, () => {
    assert.throws(() => parseStory("bad.md", source), (error: unknown) => error instanceof FilingError && error.message.includes(`bad.md — ${field}`));
  });
}

test("unsafe URL schemes fail filing and cannot survive the renderer", () => {
  withFiles({ "unsafe.md": valid + "\n[Click](javascript:alert%281%29)\n" }, (directory) => {
    assert.throws(() => loadStories(directory), /unsafe.md — body:.*executable\/data URLs are disabled/);
  });
  const html = renderMarkdown(parseMarkdown('<script>alert(1)</script>\n\n[Click](javascript:alert%281%29)\n\n{1 + 1}').tree);
  assert.doesNotMatch(html, /<script|href="javascript:/);
  assert.match(html, /\{1 \+ 1\}/);
});

test("newest dates sort first; same-date order is explicit and deterministic", () => {
  const story = (slug: string, date: string, order?: number) => {
    const source = valid.replaceAll("fixture-column", slug).replace("2026-09-17", date);
    return order === undefined ? source : source.replace("label: SATIRE\n", `label: SATIRE\norder: ${order}\n`);
  };
  // Filenames run opposite the expected shelf so directory order cannot satisfy the assertion.
  withFiles({
    "a-older.md": story("fixture-column", "2026-09-17"),
    "w-tie-a.md": story("tie-alpha", "2026-09-21", 1),
    "x-tie-b.md": story("tie-beta", "2026-09-21", 1),
    "y-low-order.md": story("zzz-first", "2026-09-21", 0),
    "z-high-order.md": story("aaa-later", "2026-09-21", 2),
  }, (directory) => {
    assert.deepEqual(loadStories(directory).map((item) => item.slug), [
      "zzz-first",
      "tie-alpha",
      "tie-beta",
      "aaa-later",
      "fixture-column",
    ]);
  });
});

test("story links open externally and Sources renders as its own section", () => {
  const html = renderMarkdown(parseMarkdown("A [stat](https://www.espn.com/x) and [home](/calls).\n\n*— Sign-off*\n\n**Sources**\n\n- [ESPN, recap, A@B](https://www.espn.com/x)\n").tree);
  assert.match(html, /<a href="https:\/\/www\.espn\.com\/x" target="_blank" rel="noopener noreferrer">stat<\/a>/);
  assert.match(html, /<a href="\/calls">home<\/a>/);
  assert.match(html, /<section class="story-sources" aria-label="Sources"><p class="story-sources-kicker">Sources<\/p>\s*<ul>[\s\S]*ESPN, recap, A@B[\s\S]*<\/ul><\/section>/);
  assert.equal(/<strong>Sources<\/strong>/.test(html), false);
  assert.match(html, /<li><a href="https:\/\/www\.espn\.com\/x" target="_blank" rel="noopener noreferrer">ESPN, recap, A@B<\/a><\/li>/);
});

test("the Nix call and Pete's challenge are the newest stories, call first", () => {
  const stories = loadStories();
  assert.deepEqual(stories.slice(0, 2).map((story) => [story.slug, story.voiceId]), [
    ["chip-thursday-call-nix-sea-den-2026-10-15", "chip-absolute"],
    ["pete-challenge-chip-nix-call-2026-10-14", "postcard-pete"],
  ]);
  for (const story of stories.slice(0, 2)) assert.match(story.html, /<section class="story-sources" aria-label="Sources">/);
});

test("only a call column's opening gets the call rail", () => {
  const [chip, pete] = loadStories();
  assert.match(chip.html, /^<div class="story-call-rail"><p><strong>The call:<\/strong>[^]*?<\/p>\s*<p><strong>What counts as success:<\/strong>[^]*?<\/p>\s*<p><strong>Posted:<\/strong>[^]*?<\/p><\/div>/);
  assert.equal(pete.html.includes("story-call-rail"), false);
});
