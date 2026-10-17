// Runtime stories API. No filesystem access: filed stories are inlined at build time
// (lib/generated/content.ts) and merged with published admin stories from Redis.
import { getVoice } from "./cast.ts";
import { FILE_STORIES } from "./generated/content.ts";
import { mergeStories } from "./admin/merge.ts";
import { readAdminContent } from "./admin/content.ts";
import type { Story } from "./stories/content.ts";

export type { Story } from "./stories/content.ts";

/** Filed stories only (build-time snapshot). */
export function listStories(): Story[] {
  return FILE_STORIES;
}

export function getStory(slug: string): Story | undefined {
  return FILE_STORIES.find((story) => story.slug === slug);
}

/** Filed stories plus published admin stories, newest first. Falls back to filed stories if Redis is unavailable. */
export async function listPublicStories(): Promise<Story[]> {
  const admin = await readAdminContent();
  return mergeStories(FILE_STORIES, admin.stories);
}

export async function getPublicStory(slug: string): Promise<Story | undefined> {
  return (await listPublicStories()).find((story) => story.slug === slug);
}

export function storyVoice(story: Story) {
  return getVoice(story.voiceId);
}
