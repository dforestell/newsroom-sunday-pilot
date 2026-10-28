import { SportHub } from "@/components/sport-hub";
import { listPublicCalls } from "@/lib/calls";
import { listPublicStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";

export const revalidate = 30;

export const metadata = shareMetadata("NBA", "Chip Absolute’s NBA calls and the desk’s NBA columns.");

export default async function NbaHub() {
  const [calls, stories] = await Promise.all([listPublicCalls(), listPublicStories()]);
  return <SportHub sport="NBA" intro="Chip’s NBA calls and the desk’s NBA columns." calls={calls} stories={stories} />;
}
