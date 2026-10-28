import { getInitialScoreboard } from "@/lib/nfl/initial-scoreboard";
import { notFound } from "next/navigation";
import { GamePieceLead } from "@/components/game-piece";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";
import { listPublicCalls } from "@/lib/calls";
import { fetchPastFinal } from "@/lib/nfl/past-final";
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
  const initialData = game.sport === "NFL" ? await getInitialScoreboard() : null;
  // Past games with a Chip piece or call fall out of the live window: pull ESPN's final for the call date.
  const inWindow = Boolean(initialData?.games.some(g => g.id === id));
  const pastFinal = game.sport === "NFL" && !inWindow && call ? await fetchPastFinal(id, call.date) : null;
  return (
    <div className="space-y-8">
      {game.sport === "NFL" ? <LiveScoreboard gameId={id} initialData={initialData} pastFinal={pastFinal} /> : null}
      <GamePieceLead piece={piece} call={call} />
    </div>
  );
}
