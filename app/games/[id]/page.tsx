import { GameView } from "@/components/game-view";
import { getPublicGame, listPublicGames } from "@/lib/live/public";
import { shareMetadata } from "@/lib/share";

export function generateStaticParams() {
  return listPublicGames().map((game) => ({ id: game.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/[id]">) {
  const { id } = await params;
  const game = getPublicGame(id);
  if (!game) return { title: "Game" };
  const label = game.demo ? "Archive" : "NFL scoreboard";
  return shareMetadata(
    `${game.name} · ${label}`,
    game.demo
      ? `${game.windowLabel}: a filed archive, never a live score.`
      : "Live NFL game detail from the Poor Form scoreboard.",
    `/games/${game.id}`,
  );
}

export default async function GamePage({
  params,
}: PageProps<"/games/[id]">) {
  const { id } = await params;
  return <GameView id={id} paused={false} />;
}
