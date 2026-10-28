import { getInitialScoreboard } from "@/lib/nfl/initial-scoreboard";
import { notFound } from "next/navigation";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";

export const metadata = { title: "NFL game scores" };

export default async function NflScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    notFound();
  }
  if (!/^nfl:\d{4}:[123]:[A-Z]{2,3}:[A-Z]{2,3}$/.test(id)) notFound();
  return <LiveScoreboard gameId={id} initialData={await getInitialScoreboard()} />;
}
