import { sortCalls, type Call } from "../calls/content.ts";
import { sortStories, type Story } from "../stories/content.ts";
import { validateAdminCall, type AdminCallRecord } from "./calls.ts";
import { DEFAULT_SPORT } from "../calls/sports.ts";
import { buildAdminStory, type AdminStoryRecord } from "./stories.ts";

/**
 * Filed stories plus published admin stories. Filed stories win a slug clash (writes
 * reject clashes too). Unpublished or invalid admin stories never show.
 */
export function mergeStories(filed: Story[], admin: AdminStoryRecord[]): Story[] {
  const slugs = new Set(filed.map((story) => story.slug));
  const allSlugs = [...slugs, ...admin.map((record) => record.slug)];
  const extra: Story[] = [];
  for (const record of admin) {
    if (record.status !== "published" || slugs.has(record.slug)) continue;
    const built = buildAdminStory(record, allSlugs);
    if ("story" in built) {
      extra.push(built.story);
      slugs.add(record.slug);
    }
  }
  return sortStories([...filed, ...extra]);
}

/**
 * Filed calls merged with admin calls, keyed by postUrl. An admin record for the same
 * post replaces the filed version (that is how a filed call gets graded). Invalid
 * admin records are skipped.
 */
export function mergeCalls(filed: Call[], admin: AdminCallRecord[]): Call[] {
  const byPost = new Map(filed.map((call) => [call.postUrl, call]));
  for (const record of admin) {
    // Admin calls saved before `sport` existed are read as the default sport.
    const built = validateAdminCall({ ...record, sport: record.sport?.trim() || DEFAULT_SPORT });
    if ("call" in built) byPost.set(built.call.postUrl, built.call);
  }
  return sortCalls([...byPost.values()]);
}
