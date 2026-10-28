import { getScoreboard } from "@/lib/nfl/scoreboard-service";
import type { ScoreboardResponse } from "@/lib/nfl/types";

/** Last-known scoreboard for server render; null if it takes too long or fails. */
export async function getInitialScoreboard(timeoutMs = 4000): Promise<ScoreboardResponse | null> {
  try {
    return await Promise.race([
      getScoreboard(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
}
