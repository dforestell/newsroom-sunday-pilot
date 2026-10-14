import { stringify } from "yaml";
import { CAST } from "../cast.ts";
import { FilingError, parseStory, type Story } from "../stories/content.ts";
import type { AdminSource, AdminStory, AdminStoryStore } from "./store.ts";
export { EMPTY_SOURCES_WARNING, sourcesWarning } from "./warnings.ts";

export type PublicStory = Story & { sources?: AdminSource[]; source?: "admin" };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseSources(text: string): { sources: AdminSource[]; issues: string[] } {
  const sources: AdminSource[] = [];
  const issues: string[] = [];
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    const split = line.lastIndexOf("|");
    const label = split > 0 ? line.slice(0, split).trim() : line;
    const url = split > 0 ? line.slice(split + 1).trim() : line;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
      sources.push({ label: split > 0 && label ? label : parsed.hostname, url: parsed.toString() });
    } catch {
      issues.push(`Source line ${index + 1}: use "Label | https://link".`);
    }
  }
  return { sources, issues };
}

/** Admin stories always carry the SATIRE label. The form cannot change it. */
export const ADMIN_STORY_LABEL = "SATIRE" as const;

function markdownLabel(text: string) {
  return text.replace(/[\\[\]]/g, "\\$&");
}

/** Sources render the same way as filed stories: a bold "Sources" line and a list. */
export function bodyWithSources(body: string, sources: AdminSource[]) {
  if (sources.length === 0) return body;
  const list = sources.map((source) => `- [${markdownLabel(source.label)}](<${source.url}>)`).join("\n");
  return `${body.trim()}\n\n**Sources**\n\n${list}`;
}

/** Runs an admin story through the same validation and rendering as filed stories. */
export function renderAdminStory(story: AdminStory): PublicStory {
  const frontmatter = stringify({
    title: story.title,
    slug: story.slug,
    date: story.date,
    voiceId: story.voiceId,
    dek: story.dek,
    label: ADMIN_STORY_LABEL,
  });
  const source = `---\n${frontmatter}---\n${bodyWithSources(story.body, story.sources)}\n`;
  const { story: rendered } = parseStory(`admin:${story.slug}`, source);
  return { ...rendered, sources: story.sources, source: "admin" };
}

export function validateAdminStory(story: AdminStory, fileSlugs: string[]): string[] {
  const issues: string[] = [];
  if (!slugPattern.test(story.slug)) issues.push("Slug: lowercase words separated by hyphens.");
  if (fileSlugs.includes(story.slug)) issues.push("Slug: already used by a filed story. Pick another.");
  if (!CAST.some((voice) => voice.slug === story.voiceId)) issues.push("Author: choose a cast member.");
  if (issues.length) return issues;
  try {
    renderAdminStory(story);
  } catch (error) {
    if (error instanceof FilingError) return error.issues.map((issue) => issue.replace(/^admin:[^ ]+ — /, ""));
    throw error;
  }
  return [];
}

export async function publishedAdminStories(store: AdminStoryStore | null, fileSlugs: string[]): Promise<PublicStory[]> {
  if (!store) return [];
  let stories: AdminStory[];
  try {
    stories = await store.list();
  } catch {
    return [];
  }
  const out: PublicStory[] = [];
  for (const story of stories) {
    if (story.status !== "published" || fileSlugs.includes(story.slug)) continue;
    try {
      out.push(renderAdminStory(story));
    } catch {
      // An invalid record never breaks the public site.
    }
  }
  return out;
}
