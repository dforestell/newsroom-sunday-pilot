import { notFound } from "next/navigation";
import { CAST, LEAD_VOICE_ID, type Voice } from "./cast.ts";
import type { Call } from "./calls/content.ts";
import type { Story } from "./stories/content.ts";

export const STAFF_SLUGS = CAST.map((voice) => voice.slug);

export function staffPath(slug: string) {
  return `/staff/${slug}`;
}

/** Exact, case-sensitive slug lookup. Unknown slugs return undefined (the page 404s). */
export function getStaff(slug: string): Voice | undefined {
  return CAST.find((voice) => voice.slug === slug);
}

export function storiesByStaff(stories: Story[], slug: string): Story[] {
  return stories.filter((story) => story.voiceId === slug);
}

/** Calls are Chip's: the lead voice gets every call, everyone else none. */
export function callsForStaff(calls: Call[], slug: string): Call[] {
  return slug === LEAD_VOICE_ID ? calls : [];
}

/** Lookup for the staff page: unknown slugs 404. */
export function requireStaff(slug: string): Voice {
  const voice = getStaff(slug);
  if (!voice) notFound();
  return voice;
}
