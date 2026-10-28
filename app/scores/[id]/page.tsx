import { notFound } from "next/navigation";
import { LiveScoreboard } from "@/components/scoreboard/live-scoreboard";

import { siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: "NFL game scores", alternates: { canonical: siteUrl(`/scores/${id}`) } };
}

export default async function NflScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    notFound();
  }
  if (!/^nfl:\d{4}:[123]:[A-Z]{2,3}:[A-Z]{2,3}$/.test(id)) notFound();
  return <LiveScoreboard gameId={id} />;
}
