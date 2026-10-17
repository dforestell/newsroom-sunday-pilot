import { CallsList } from "@/components/calls-list";
import { listPublicCalls } from "@/lib/calls";
import { shareMetadata } from "@/lib/share";

// Filed content is inlined at build time; admin content is read from Redis and refreshed
// every 30 seconds (or immediately after an admin save).
export const revalidate = 30;

export const metadata = shareMetadata(
  "Chip’s calls",
  "Chip Absolute’s takes, and how each one held up.",
);

export default async function CallsPage() {
  return <CallsList calls={await listPublicCalls()} />;
}
