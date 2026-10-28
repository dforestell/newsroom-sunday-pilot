// Sports a call can be filed under. Add a sport by appending it here; check:calls,
// the admin form and the /calls per-sport record all read this list.
export const SPORTS = ["NFL", "NBA"] as const;
export type Sport = (typeof SPORTS)[number];

/** Admin calls saved before `sport` existed are read as NFL. */
export const DEFAULT_SPORT: Sport = "NFL";

export function isSport(value: unknown): value is Sport {
  return typeof value === "string" && (SPORTS as readonly string[]).includes(value);
}
