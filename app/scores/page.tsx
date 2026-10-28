import { siteUrl } from "@/lib/site";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";

export const metadata = { title: "All games", alternates: { canonical: siteUrl("/scores") } };

export default function AllGamesPage() {
  return <LiveScoreboard />;
}
