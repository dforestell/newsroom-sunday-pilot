import { StaffView } from "@/components/staff-view";
import { listPublicCalls, sortCalls } from "@/lib/calls";
import { shareMetadata } from "@/lib/share";
import { STAFF_SLUGS, callsForStaff, getStaff, requireStaff, staffPath, storiesByStaff } from "@/lib/staff";
import { STAFF_FONTS } from "@/lib/staff/fonts";
import { staffTheme } from "@/lib/staff/themes";
import { listPublicStories } from "@/lib/stories";

// Stories and calls include admin content, refreshed every 30 seconds.
export const revalidate = 30;
export const dynamicParams = false;

export function generateStaticParams() {
  return STAFF_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/staff/[slug]">) {
  const { slug } = await params;
  const voice = getStaff(slug);
  if (!voice) return { title: "Staff" };
  const share = shareMetadata(`${voice.name} · ${voice.title}`, `${voice.publicLead ?? voice.bio} Poor Form Sports.`);
  // Relative canonical resolves against the layout's metadataBase (the public site URL).
  return { ...share, alternates: { canonical: staffPath(voice.slug) } };
}

export default async function StaffPage({ params }: PageProps<"/staff/[slug]">) {
  const { slug } = await params;
  const voice = requireStaff(slug);
  const theme = staffTheme(voice);
  const [stories, calls] = await Promise.all([listPublicStories(), listPublicCalls()]);
  return (
    <StaffView
      voice={voice}
      theme={theme}
      stories={storiesByStaff(stories, voice.slug)}
      calls={sortCalls(callsForStaff(calls, voice.slug))}
      font={theme.font ? STAFF_FONTS[theme.font] : undefined}
    />
  );
}
