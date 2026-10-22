import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StoryCard, StoriesStrip } from "../components/story-card.tsx";
import { storyLabelParts, visibleLabelParts } from "../components/story-label.tsx";
import StoryArticlePage from "../app/stories/[slug]/page.tsx";
import { listStories } from "../lib/stories.ts";
import { HomeFeatured, HomeStories } from "../components/home-sections.tsx";
import { listCalls } from "../lib/calls.ts";

const stories = listStories();

function chips(html: string) {
  if (!html.includes("data-story-label=")) return { label: "", texts: [] as Array<{ cls: string; text: string }> };
  const match = html.match(/<span[^>]*data-story-label="([^"]+)"[^>]*>(.*?)<\/span><\/span>/);
  assert.ok(match, "story label chip group is rendered");
  const texts = [...match[2].matchAll(/<span class="([^"]*)">([^<]*)/g)].map((m) => ({ cls: m[1], text: m[2] }));
  return { label: match[1], texts };
}

function assertLabel(html: string, label: string) {
  const { label: rendered, texts } = chips(html);
  const visible = visibleLabelParts(label as never).map((p) => p.text);
  assert.equal(rendered, visible.length ? label : "");
  assert.deepEqual(texts.map((t) => t.text), visible);
  for (const t of texts) assert.match(t.cls, /bg-demo text-ink/);
  assert.equal(/bg-satire/.test(html), false, "no SATIRE chip on article pages or cards");
}

test("SATIRE is never a visible chip; label parts follow the story's real label, DEMO before SATIRE", () => {
  assert.deepEqual(storyLabelParts("SATIRE"), [{ text: "SATIRE", tone: "satire" }]);
  assert.deepEqual(storyLabelParts("DEMO / SATIRE"), [{ text: "DEMO", tone: "demo" }, { text: "SATIRE", tone: "satire" }]);
  assert.deepEqual(visibleLabelParts("SATIRE"), []);
  assert.deepEqual(visibleLabelParts("DEMO / SATIRE").map((p) => p.text), ["DEMO"]);
  assert.ok(stories.some((s) => s.label === "SATIRE"));
  assert.ok(stories.some((s) => s.label === "DEMO / SATIRE"));
});

for (const story of stories) {
  test(`card renders ${story.label} for ${story.slug}`, () => {
    assertLabel(renderToStaticMarkup(<StoryCard story={story} />), story.label);
    assertLabel(renderToStaticMarkup(<StoryCard story={story} featured />), story.label);
  });

  test(`story page renders ${story.label} before the date for ${story.slug}`, async () => {
    const page = await StoryArticlePage({ params: Promise.resolve({ slug: story.slug }) } as never);
    const html = renderToStaticMarkup(page);
    const kicker = html.match(/<p data-story-kicker="true"[^>]*>(.*?)<\/p>/)?.[1] ?? "";
    assertLabel(`${kicker}</span>`, story.label);
    assert.equal(/bg-satire/.test(html), false);
    if (visibleLabelParts(story.label).length) assert.ok(kicker.indexOf("data-story-label") < kicker.indexOf(story.dateLabel), "label precedes date");
    else assert.equal(kicker.includes("·"), false, "no dangling separator");
    assert.ok(html.indexOf("data-story-kicker") < html.indexOf("<h1"), "kicker sits above the title");
    // Next story + More stories each carry their own story's label.
    const tail = html.slice(html.indexOf('aria-label="Next story"'));
    const linked = [...tail.matchAll(/href="\/stories\/([^"]+)"/g)].map((m) => m[1]);
    const labels = [...tail.matchAll(/data-story-label="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(linked.length > 0, "next story block renders");
    assert.deepEqual(labels, linked.map((slug) => stories.find((s) => s.slug === slug)!.label).filter((l) => visibleLabelParts(l).length));
  });
}

test("stories strip renders one label group per story", () => {
  const html = renderToStaticMarkup(<StoriesStrip stories={stories} />);
  assert.equal(html.match(/data-story-label=/g)?.length ?? 0, stories.filter((s) => visibleLabelParts(s.label).length).length);
  assert.equal(/bg-satire/.test(html), false);
});

test("homepage featured block and story rows render each story's label", () => {
  for (const story of stories) {
    assertLabel(renderToStaticMarkup(<HomeFeatured story={story} calls={listCalls()} />), story.label);
  }
  const html = renderToStaticMarkup(<HomeStories stories={stories} />);
  const labels = [...html.matchAll(/data-story-label="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(labels, stories.map((s) => s.label).filter((l) => visibleLabelParts(l).length));
  assert.equal(/bg-satire|>Satire</.test(html), false);
});
