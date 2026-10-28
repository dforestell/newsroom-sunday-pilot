import type { Call } from "./content.ts";
import { SPORTS, type Sport } from "./sports.ts";

export type CallTally = {
  hits: number;
  misses: number;
  stillArguing: number;
  pending: number;
};

export type CallStreak =
  | { kind: "hot"; count: number; label: string }
  | { kind: "cold"; count: number; label: string }
  | { kind: "none"; label: "No streak yet" };

export type CallRecord = {
  tally: CallTally;
  streak: CallStreak;
  /** Newest call that is not status `pending`. */
  latest: Call | null;
  /** Newest pre-game call (`status: "pending"`). */
  next: Call | null;
};

function isHit(status: string) {
  return status === "held-up";
}

function isMiss(status: string) {
  return status === "missed";
}

function isGraded(status: string) {
  return isHit(status) || isMiss(status);
}

/** Newest date first. A later post wins a same-day tie, matching the shelf sort. */
function compareNewest(a: Call, b: Call) {
  return b.date.localeCompare(a.date) || b.postUrl.localeCompare(a.postUrl);
}

function streakFrom(calls: Call[]): CallStreak {
  const graded = calls.filter((call) => isGraded(call.status)).sort(compareNewest);
  const first = graded[0];
  if (!first) return { kind: "none", label: "No streak yet" };

  let count = 0;
  for (const call of graded) {
    if (call.status !== first.status) break;
    count += 1;
  }
  if (count < 2) return { kind: "none", label: "No streak yet" };
  if (isHit(first.status)) return { kind: "hot", count, label: `Hot: ${count} straight held up` };
  return { kind: "cold", count, label: `Cold: ${count} straight missed` };
}

export function getCallRecord(calls: Call[]): CallRecord {
  const tally: CallTally = { hits: 0, misses: 0, stillArguing: 0, pending: 0 };
  for (const call of calls) {
    if (isHit(call.status)) tally.hits += 1;
    else if (isMiss(call.status)) tally.misses += 1;
    else if (call.status === "still-arguing") tally.stillArguing += 1;
    else if (call.status === "pending") tally.pending += 1;
  }

  const newest = [...calls].sort(compareNewest);
  return {
    tally,
    streak: streakFrom(calls),
    latest: newest.find((call) => call.status !== "pending") ?? null,
    next: newest.find((call) => call.status === "pending") ?? null,
  };
}

export type SportRecord = { sport: Sport; hits: number; misses: number; calls: number };

/** Held up–missed per sport, in SPORTS order, for sports with at least one call. */
export function sportRecords(calls: Call[]): SportRecord[] {
  return SPORTS.map((sport) => {
    const mine = calls.filter((call) => call.sport === sport);
    return {
      sport,
      calls: mine.length,
      hits: mine.filter((call) => isHit(call.status)).length,
      misses: mine.filter((call) => isMiss(call.status)).length,
    };
  }).filter((record) => record.calls > 0);
}
