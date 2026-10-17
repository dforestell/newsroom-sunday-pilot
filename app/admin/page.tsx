import Link from "next/link";
import { missingAuthSettings } from "@/lib/admin/auth";
import { redisConfig } from "@/lib/admin/redis";
import { currentAdmin } from "@/lib/admin/session";
import { mergeCalls } from "@/lib/admin/merge";
import { CALL_STATUS_LABEL } from "@/lib/calls";
import { FILE_CALLS } from "@/lib/generated/content";
import { logoutAction, revertCallAction, setStoryStatusAction } from "./actions";
import { adminContentOrNull } from "./data";
import { LoginForm } from "./forms";

const small = "inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const missing = [...missingAuthSettings(), ...(redisConfig() ? [] : ["UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN"])];
  if (missing.length) {
    return (
      <section className="max-w-xl space-y-2">
        <h1 className="font-heading text-3xl font-semibold">Desk admin</h1>
        <p className="text-sm text-ink-soft">Admin is switched off until these environment settings exist:</p>
        <ul className="list-disc pl-5 font-mono text-sm">{missing.map((name) => <li key={name}>{name}</li>)}</ul>
      </section>
    );
  }
  const user = await currentAdmin();
  if (!user) {
    return (
      <section className="space-y-4">
        <h1 className="font-heading text-3xl font-semibold">Desk admin</h1>
        <LoginForm />
      </section>
    );
  }
  const params = await searchParams;
  const content = await adminContentOrNull();
  const calls = mergeCalls(FILE_CALLS, content?.calls ?? []);
  const adminPosts = new Set((content?.calls ?? []).map((call) => call.postUrl));
  const stories = [...(content?.stories ?? [])].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Desk admin</h1>
          <p className="text-sm text-ink-soft">Signed in as {user.label}. Changes show on the site within a few seconds.</p>
        </div>
        <form action={logoutAction}><button className={small}>Sign out</button></form>
      </section>
      {params.saved ? <p role="status" className="border-2 border-live-green px-4 py-2 text-sm">Saved: {String(params.saved)}</p> : null}
      {!content ? <p role="alert" className="border-2 border-masthead px-4 py-2 text-sm">The content store is not reachable right now. Lists below may be incomplete; saving is disabled until it is back.</p> : null}

      <section aria-labelledby="admin-stories" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="admin-stories" className="font-heading text-2xl font-semibold">Admin stories</h2>
          <Link href="/admin/stories/edit" className={small}>New story →</Link>
        </div>
        <p className="text-sm text-ink-soft">Stories filed in the repo are edited in the repo; they are not listed here.</p>
        {stories.length ? (
          <ul className="divide-y divide-border border-y border-border">
            {stories.map((story) => (
              <li key={story.slug} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="font-heading text-lg font-semibold">{story.title}</p>
                  <p className="font-mono text-[13px] text-ink-soft uppercase">{story.date} · {story.status} · /stories/{story.slug}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/admin/stories/edit?slug=${encodeURIComponent(story.slug)}`} className={small}>Edit</Link>
                  {story.status === "published" ? <Link href={`/stories/${story.slug}`} className={small}>View</Link> : null}
                  <form action={setStoryStatusAction}>
                    <input type="hidden" name="slug" value={story.slug} />
                    <input type="hidden" name="status" value={story.status === "published" ? "unpublished" : "published"} />
                    <button className={small}>{story.status === "published" ? "Unpublish" : "Publish"}</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm">No admin stories yet.</p>}
      </section>

      <section id="calls" aria-labelledby="admin-calls" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="admin-calls" className="font-heading text-2xl font-semibold">Chip’s calls</h2>
          <Link href="/admin/calls/edit" className={small}>Add call →</Link>
        </div>
        <ul className="divide-y divide-border border-y border-border">
          {calls.map((call) => (
            <li key={call.postUrl} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-semibold">{call.take}</p>
                <p className="font-mono text-[13px] text-ink-soft uppercase">
                  {call.date} · {call.game} · {CALL_STATUS_LABEL[call.status]} · {adminPosts.has(call.postUrl) ? "edited in admin" : "filed in repo"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/admin/calls/edit?postUrl=${encodeURIComponent(call.postUrl)}`} className={small}>Grade / edit</Link>
                {adminPosts.has(call.postUrl) ? (
                  <form action={revertCallAction}>
                    <input type="hidden" name="postUrl" value={call.postUrl} />
                    <button className={small}>{FILE_CALLS.some((item) => item.postUrl === call.postUrl) ? "Revert to filed" : "Delete"}</button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
