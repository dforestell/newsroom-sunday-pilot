import { GameView } from "@/components/game-view";
import { getPublicGame, listPublicGames } from "@/lib/live/public";
import { shareMetadata } from "@/lib/share";

export function generateStaticParams() {
  return listPublicGames()
    .filter((game) => game.liveBlogEnabled)
    .map((game) => ({ id: game.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/[id]/delayed">) {
  const { id } = await params;
  const game = getPublicGame(id);
  if (!game) return { title: "Game" };
  if (game.demo) {
    return shareMetadata(
      `${game.name} · Archive`,
      `${game.windowLabel}: a filed archive, never a live score.`,
      `/games/${game.id}/delayed`,
    );
  }
  return { title: `${game.name} · Updates delayed` };
}

export default async function DelayedGamePage({
  params,
}: PageProps<"/games/[id]/delayed">) {
  const { id } = await params;
  return <GameView id={id} paused />;
}
