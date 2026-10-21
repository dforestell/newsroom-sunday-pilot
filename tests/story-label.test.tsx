import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StoryCard, StoriesStrip } from "../components/story-card.tsx";
import { storyLabelParts } from "../components/story-label.tsx";
import StoryArticlePage from "../app/stories/[slug]/page.tsx";
import { listStories } from "../lib/stories.ts";
import { HomeFeatured, HomeStories } from "../components/home-sections.tsx";
import { listCalls } from "../lib/calls.ts";

const stories = listStories();

function chips(html: string) {
  const match = html.match(/<span[^>]*data-story-label="([^"]+)"[^>]*>(.*?)<\/span><\/span>/);
  assert.ok(match, "story label chip group is rendered");
  const texts = [...match[2].matchAll(/<span class="([^"]*)">([^<]*)/g)].map((m) => ({ cls: m[1], text: m[2] }));
  return { label: match[1], texts };
}

function assertLabel(html: string, label: string) {
  const { label: rendered, texts } = chips(html);
  assert.equal(rendered, label);
  assert.deepEqual(texts.map((t) => t.text), storyLabelParts(label as never).map((p) => p.text));
  for (const t of texts) assert.match(t.cls, t.text === "DEMO" ? /bg-demo text-ink/ : /bg-satire text-satire-fg/);
}

test("label parts follow the story's real label, DEMO before SATIRE", () => {
  assert.deepEqual(storyLabelParts("SATIRE"), [{ text: "SATIRE", tone: "satire" }]);
  assert.deepEqual(storyLabelParts("DEMO / SATIRE"), [{ text: "DEMO", tone: "demo" }, { text: "SATIRE", tone: "satire" }]);
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
    assertLabel(html, story.label);
    const kicker = html.match(/<p data-story-kicker="true"[^>]*>(.*?)<\/p>/)?.[1] ?? "";
    assert.ok(kicker.indexOf("data-story-label") < kicker.indexOf(story.dateLabel), "label precedes date");
    assert.ok(html.indexOf("data-story-kicker") < html.indexOf("<h1"), "kicker sits above the title");
    // Next story + More stories each carry their own story's label.
    const tail = html.slice(html.indexOf('aria-label="Next story"'));
    const linked = [...tail.matchAll(/href="\/stories\/([^"]+)"/g)].map((m) => m[1]);
    const labels = [...tail.matchAll(/data-story-label="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(linked.length > 0, "next story block renders");
    assert.deepEqual(labels, linked.map((slug) => stories.find((s) => s.slug === slug)!.label));
  });
}

test("stories strip renders one label group per story", () => {
  const html = renderToStaticMarkup(<StoriesStrip stories={stories} />);
  assert.equal(html.match(/data-story-label=/g)?.length, stories.length);
});

test("homepage featured block and story rows render each story's label", () => {
  for (const story of stories) {
    assertLabel(renderToStaticMarkup(<HomeFeatured story={story} calls={listCalls()} />), story.label);
  }
  const html = renderToStaticMarkup(<HomeStories stories={stories} />);
  const labels = [...html.matchAll(/data-story-label="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(labels, stories.map((s) => s.label));
});
