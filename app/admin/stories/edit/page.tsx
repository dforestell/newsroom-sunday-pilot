import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin/session";
import { VOICE_OPTIONS } from "@/lib/admin/stories";
import { adminContentOrNull } from "../../data";
import { StoryForm } from "../../forms";

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

export default async function EditStoryPage({ searchParams }: PageProps<"/admin/stories/edit">) {
  if (!(await currentAdmin())) redirect("/admin");
  const { slug } = await searchParams;
  let initial: Record<string, string> = { slug: "", title: "", dek: "", body: "", voiceId: "chip-absolute", date: today(), status: "published" };
  if (typeof slug === "string" && slug) {
    const content = await adminContentOrNull();
    const story = content?.stories.find((item) => item.slug === slug);
    if (!story) notFound();
    initial = { slug: story.slug, title: story.title, dek: story.dek, body: story.body, voiceId: story.voiceId, date: story.date, status: story.status };
  }
  const editing = Boolean(slug);
  return (
    <section className="max-w-3xl space-y-4">
      <Link href="/admin" className="font-mono text-sm text-masthead uppercase underline-offset-4 hover:underline">← Admin</Link>
      <h1 className="font-heading text-3xl font-semibold">{editing ? "Edit story" : "New story"}</h1>
      <StoryForm initial={initial} voices={VOICE_OPTIONS} editing={editing} />
    </section>
  );
}
