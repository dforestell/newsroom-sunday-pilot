// Runtime stories API. No filesystem access: filed stories are inlined at build time
// (lib/generated/content.ts) and merged with published admin stories from Redis.
import { getVoice, isActiveVoice } from "./cast.ts";
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

/** Every public story, including ones by hidden (inactive) voices. Use for direct story URLs only. */
export async function listAllPublicStories(): Promise<Story[]> {
  const admin = await readAdminContent();
  return mergeStories(FILE_STORIES, admin.stories);
}

/**
 * Stories for listings (home, /stories, hubs, archive, staff pages, related): filed plus
 * published admin stories, newest first, without stories by hidden voices.
 * Falls back to filed stories if Redis is unavailable.
 */
export async function listPublicStories(): Promise<Story[]> {
  return (await listAllPublicStories()).filter((story) => isActiveVoice(getVoice(story.voiceId)));
}

/** Direct story URL lookup: hidden voices' stories still resolve. */
export async function getPublicStory(slug: string): Promise<Story | undefined> {
  return (await listAllPublicStories()).find((story) => story.slug === slug);
}

export function storyVoice(story: Story) {
  return getVoice(story.voiceId);
}
