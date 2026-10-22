import { notFound } from "next/navigation";
import { GamePieceLead } from "@/components/game-piece";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";
import { listPublicCalls } from "@/lib/calls";
import { findGameCall, getGamePiece, parseGameId } from "@/lib/games/pieces";

export const metadata = { title: "Game" };

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    notFound();
  }
  const game = parseGameId(id);
  if (!game) notFound();
  const piece = getGamePiece(id);
  const call = findGameCall(id, await listPublicCalls());
  // Only the NFL board has a live box today; other sports show the piece alone.
  if (game.sport !== "NFL" && !piece && !call) notFound();
  return (
    <div className="space-y-8">
      <GamePieceLead piece={piece} call={call} />
      {game.sport === "NFL" ? <LiveScoreboard gameId={id} /> : null}
    </div>
  );
}
