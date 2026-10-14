import { StoryArticle } from "@/components/story-article";
import { renderAdminStory, validateAdminStory } from "@/lib/admin/stories";
import { selectAdminStore, type AdminStory } from "@/lib/admin/store";
import { adminConfigured, currentAdmin } from "@/lib/admin/session";
import { listStories } from "@/lib/stories";
import { LoginForm, NotConfigured } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function AdminPreviewPage() {
  if (!adminConfigured()) return <NotConfigured />;
  const admin = await currentAdmin();
  if (!admin) return <LoginForm />;

  let draft: AdminStory | null = null;
  try {
    draft = await selectAdminStore()!.getPreview(admin);
  } catch {
    draft = null;
  }
  if (!draft) return <p className="text-ink-soft">Nothing to preview yet. Use Preview in the editor.</p>;

  const issues = validateAdminStory(draft, listStories().map((story) => story.slug)).filter((issue) => !issue.startsWith("Slug: already used by a filed"));
  let rendered = null;
  try {
    rendered = renderAdminStory(draft);
  } catch {
    rendered = null;
  }

  return (
    <div className="space-y-6">
      <p role="status" className="border-y border-ink/15 py-2 font-mono text-[11px] tracking-wide text-ink-soft uppercase">
        Preview only. Not published. Close this tab to keep editing.
      </p>
      {issues.length ? (
        <div role="alert" className="text-sm">
          <p className="font-semibold">Fix before publishing:</p>
          <ul className="list-disc pl-5">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        </div>
      ) : null}
      {rendered ? <StoryArticle story={rendered} /> : null}
    </div>
  );
}
