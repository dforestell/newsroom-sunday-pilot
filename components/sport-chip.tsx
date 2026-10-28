import { DeskPill } from "@/components/desk-pill";
import type { Sport } from "@/lib/calls/sports";

/** Small sport label (NFL, NBA, …) for calls. Values come from lib/calls/sports.ts. */
export function SportChip({ sport }: { sport: Sport }) {
  return (
    <DeskPill tone="outline" className="text-xs">
      <span className="sr-only">Sport: </span>
      {sport}
    </DeskPill>
  );
}
