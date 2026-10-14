import { getVoice } from "./cast.ts";
import { loadStories, type Story } from "./stories/content.ts";

export type { Story } from "./stories/content.ts";

export function listStories(): Story[] {
  return loadStories();
}

export function getStory(slug: string): Story | undefined {
  return listStories().find((story) => story.slug === slug);
}

export function storyVoice(story: Story) {
  return getVoice(story.voiceId);
}
