import { getInitialScoreboard } from "@/lib/nfl/initial-scoreboard";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";

export const metadata = { title: "All games" };

export const dynamic = "force-dynamic";

export default async function AllGamesPage() {
  return <LiveScoreboard initialData={await getInitialScoreboard()} />;
}
