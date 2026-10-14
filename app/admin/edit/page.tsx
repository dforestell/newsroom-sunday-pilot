import Link from "next/link";
import { DeskPill } from "@/components/desk-pill";
import { CAST } from "@/lib/cast";
import { SourcesField } from "../sources-field";
import { selectAdminStore, type AdminStory } from "@/lib/admin/store";
import { adminConfigured, currentAdmin } from "@/lib/admin/session";
import { LoginForm, NotConfigured, SignOut, button, field, label } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit story", robots: { index: false, follow: false } };

export default async function AdminEditPage({ searchParams }: PageProps<"/admin/edit">) {
  if (!adminConfigured()) return <NotConfigured />;
  const admin = await currentAdmin();
  if (!admin) return <LoginForm />;
  const params = await searchParams;
  const slug = typeof params.slug === "string" ? params.slug : "";
  const error = typeof params.error === "string" ? params.error : "";
  const saved = typeof params.saved === "string" ? params.saved : "";
  let story: AdminStory | null = null;
  try {
    story = slug ? await selectAdminStore()!.get(slug) : null;
  } catch {
    story = null;
  }
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-3xl space-y-5">
      <SignOut email={admin} />
      <p>
        <Link href="/admin" className="font-mono text-[11px] uppercase underline underline-offset-4">← All admin stories</Link>
      </p>
      <h1 className="font-heading text-3xl font-semibold">{story ? "Edit story" : "New story"}</h1>
      {story ? (
        <p className="font-mono text-[11px] uppercase text-ink-soft">
          Status: {story.status}
          {story.status === "published" ? (
            <>
              {" · "}
              <Link href={`/stories/${story.slug}`} className="underline underline-offset-4">View</Link>
            </>
          ) : null}
        </p>
      ) : null}
      {saved ? <p role="status" className="text-sm">{saved === "published" ? "Published." : "Saved as draft."}</p> : null}
      {error ? (
        <div role="alert" className="text-sm">
          <p className="font-semibold">Saved as draft. Fix before publishing:</p>
          <ul className="list-disc pl-5">{error.split("\n").map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      ) : null}

      <form method="post" action="/api/admin/stories" className="space-y-4">
        {story ? <input type="hidden" name="existingSlug" value={story.slug} /> : null}
        <label className="block space-y-1">
          <span className={label}>Title</span>
          <input name="title" required defaultValue={story?.title} className={field} />
        </label>
        <label className="block space-y-1">
          <span className={label}>Slug</span>
          <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={story?.slug ?? slug} readOnly={Boolean(story)} className={field} />
        </label>
        <label className="block space-y-1">
          <span className={label}>Dek</span>
          <input name="dek" defaultValue={story?.dek} className={field} />
        </label>
        <div className="space-y-1">
          <span className={label}>Label</span>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <DeskPill tone="satire">Satire</DeskPill>
            <span>Locked. Every admin story carries this label.</span>
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className={label}>Author</span>
            <select name="voiceId" required defaultValue={story?.voiceId ?? "chip-absolute"} className={field}>
              {CAST.map((voice) => <option key={voice.slug} value={voice.slug}>{voice.name}</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className={label}>Date</span>
            <input name="date" type="date" required defaultValue={story?.date ?? today} className={field} />
          </label>
        </div>
        <label className="block space-y-1">
          <span className={label}>Body (Markdown)</span>
          <textarea name="body" required rows={14} defaultValue={story?.body} className={`${field} font-mono text-sm`} />
        </label>
        <SourcesField
          defaultValue={story?.sources.map((source) => `${source.label} | ${source.url}`).join("\n") ?? ""}
          className={`${field} font-mono text-sm`}
          labelClass={label}
        />
        <div className="flex flex-wrap gap-3">
          <button type="submit" name="intent" value="save" className={button}>Save draft</button>
          <button type="submit" name="intent" value="preview" formTarget="_blank" className={button}>Preview</button>
          <button type="submit" name="intent" value="publish" className={`${button} font-semibold`}>Publish</button>
          {story?.status === "published" ? (
            <button type="submit" name="intent" value="unpublish" className={button}>Unpublish</button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
