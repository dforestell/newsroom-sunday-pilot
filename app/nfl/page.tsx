import { SportHub } from "@/components/sport-hub";
import { listPublicCalls } from "@/lib/calls";
import { listPublicStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

export const revalidate = 30;

export const metadata = shareMetadata("NFL", "Chip Absolute’s NFL calls and the desk’s NFL columns.");

export default async function NflHub() {
  const [calls, stories] = await Promise.all([listPublicCalls(), listPublicStories()]);
  return <SportHub sport="NFL" intro="Chip’s NFL calls and the desk’s NFL columns." calls={calls} stories={stories} />;
}
