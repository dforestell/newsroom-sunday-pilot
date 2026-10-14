import Link from "next/link";
import { selectAdminStore, type AdminStory } from "@/lib/admin/store";
import { adminConfigured, currentAdmin } from "@/lib/admin/session";
import { LoginForm, NotConfigured, SignOut } from "./ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  if (!adminConfigured()) return <NotConfigured />;
  const admin = await currentAdmin();
  const { error } = await searchParams;
  if (!admin) return <LoginForm error={error === "login"} />;

  let stories: AdminStory[] = [];
  let loadError = false;
  try {
    stories = (await selectAdminStore()!.list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    loadError = true;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <SignOut email={admin} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold">Stories</h1>
        <Link href="/admin/edit" className="inline-flex min-h-11 items-center border-2 border-border bg-card-loud px-4 font-mono text-sm uppercase">
          New story
        </Link>
      </div>
      {loadError ? <p role="alert" className="text-warn">Stories could not be loaded. Try again shortly.</p> : null}
      {stories.length === 0 && !loadError ? <p className="text-ink-soft">No admin stories yet.</p> : null}
      <ul className="divide-y divide-ink/15 border-y border-ink/15">
        {stories.map((story) => (
          <li key={story.slug} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <Link href={`/admin/edit?slug=${story.slug}`} className="min-w-0 font-heading text-lg font-semibold underline-offset-4 hover:underline">
              {story.title || story.slug}
            </Link>
            <span className="font-mono text-[11px] uppercase text-ink-soft">
              {story.status} · {story.date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
