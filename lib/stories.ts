import { getVoice } from "./cast.ts";
import { loadStories, type Story } from "./stories/content.ts";
import { publishedAdminStories, type PublicStory } from "./admin/stories.ts";
import { selectAdminStore } from "./admin/store.ts";

export type { Story } from "./stories/content.ts";
export type { PublicStory } from "./admin/stories.ts";

export function listStories(): Story[] {
  return loadStories();
}

export function getStory(slug: string): Story | undefined {
  return listStories().find((story) => story.slug === slug);
}

function newestFirst(a: Story, b: Story) {
  return b.date.localeCompare(a.date) || a.order - b.order || a.slug.localeCompare(b.slug);
}

/** Filed stories plus published admin stories. Drafts and store outages never show. */
export async function listPublicStories(): Promise<PublicStory[]> {
  const filed = listStories();
  const admin = await publishedAdminStories(selectAdminStore(), filed.map((story) => story.slug));
  return [...filed, ...admin].sort(newestFirst);
}

export async function getPublicStory(slug: string): Promise<PublicStory | undefined> {
  return (await listPublicStories()).find((story) => story.slug === slug);
}

export function storyVoice(story: Story) {
  return getVoice(story.voiceId);
}
