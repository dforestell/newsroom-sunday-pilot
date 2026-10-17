import { stringify } from "yaml";
import { CAST } from "../cast.ts";
import { FilingError, checkStoryLinks, parseStory, type Story, type StoryRoutes } from "../stories/content.ts";
import { PUBLIC_ASSETS, ROUTES } from "../generated/content.ts";

/** Admin stories always carry the SATIRE label. The form cannot change it. */
export const ADMIN_STORY_LABEL = "SATIRE" as const;

export type AdminStoryStatus = "published" | "unpublished";

export type AdminStoryRecord = {
  slug: string;
  title: string;
  dek: string;
  body: string;
  voiceId: string;
  date: string;
  status: AdminStoryStatus;
  updatedAt: string;
  updatedBy: string;
};

export type AdminStoryInput = Pick<AdminStoryRecord, "slug" | "title" | "dek" | "body" | "voiceId" | "date">;

const assets = new Set(PUBLIC_ASSETS);

function knownRoutes(extraStorySlugs: Iterable<string>): StoryRoutes {
  const routes: StoryRoutes = new Map(Object.entries(ROUTES).map(([path, anchors]) => [path, new Set(anchors)]));
  for (const slug of extraStorySlugs) if (!routes.has(`/stories/${slug}`)) routes.set(`/stories/${slug}`, new Set());
  return routes;
}

export function storySource(input: AdminStoryInput): string {
  const frontmatter = stringify({
    title: input.title.trim(),
    slug: input.slug.trim(),
    date: input.date.trim(),
    voiceId: input.voiceId.trim(),
    dek: input.dek.trim(),
    label: ADMIN_STORY_LABEL,
  });
  return `---\n${frontmatter}---\n${input.body.replace(/\r\n/g, "\n").trim()}\n`;
}

/**
 * Validates an admin story with the same rules as filed stories (schema, copy rules,
 * markdown and link checks). Pure: no filesystem access.
 */
export function buildAdminStory(input: AdminStoryInput, knownStorySlugs: Iterable<string> = []): { story: Story } | { issues: string[] } {
  const file = `admin story "${input.slug || "untitled"}"`;
  try {
    const parsed = parseStory(file, storySource(input));
    const routes = knownRoutes(knownStorySlugs);
    routes.set(`/stories/${parsed.story.slug}`, parsed.anchors);
    const issues = checkStoryLinks([parsed], routes, (pathname) => assets.has(pathname));
    if (issues.length) return { issues };
    return { story: { ...parsed.story, label: ADMIN_STORY_LABEL, demo: false } };
  } catch (error) {
    if (error instanceof FilingError) return { issues: error.issues };
    throw error;
  }
}

/** Write-time validation: rejects slugs that clash with filed stories. */
export function validateAdminStory(
  input: AdminStoryInput,
  { fileSlugs, adminSlugs }: { fileSlugs: string[]; adminSlugs: string[] },
): { story: Story } | { issues: string[] } {
  if (fileSlugs.includes(input.slug.trim())) {
    return { issues: [`slug: "${input.slug}" is already used by a filed story. Choose a different slug.`] };
  }
  return buildAdminStory(input, [...fileSlugs, ...adminSlugs]);
}

export function parseStoryRecord(value: string): AdminStoryRecord | null {
  try {
    const data = JSON.parse(value) as Partial<AdminStoryRecord>;
    const text = ["slug", "title", "dek", "body", "voiceId", "date", "updatedAt", "updatedBy"] as const;
    if (!data || typeof data !== "object" || text.some((key) => typeof data[key] !== "string")) return null;
    if (data.status !== "published" && data.status !== "unpublished") return null;
    return data as AdminStoryRecord;
  } catch {
    return null;
  }
}

export const VOICE_OPTIONS = CAST.map((voice) => ({ id: voice.slug, name: voice.name }));
