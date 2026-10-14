import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseSources, validateAdminStory } from "@/lib/admin/stories";
import { selectAdminStore, type AdminStory } from "@/lib/admin/store";
import { currentAdmin, sameOrigin } from "@/lib/admin/session";
import { listStories } from "@/lib/stories";

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

export async function POST(request: Request) {
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);
  const store = selectAdminStore();
  const admin = await currentAdmin();
  if (!store || !sameOrigin(request) || !admin) return to("/admin");

  const form = await request.formData();
  const intent = text(form, "intent");
  const slug = (text(form, "existingSlug") || text(form, "slug")).toLowerCase();
  const existing = text(form, "existingSlug") ? await store.get(slug) : null;
  if (intent !== "preview" && !text(form, "existingSlug") && (await store.get(slug))) {
    return to(`/admin/edit?error=${encodeURIComponent("Slug: already used by another admin story.")}`);
  }
  const { sources, issues: sourceIssues } = parseSources(String(form.get("sources") ?? ""));
  const now = new Date().toISOString();
  const story: AdminStory = {
    slug,
    title: text(form, "title"),
    dek: text(form, "dek"),
    body: String(form.get("body") ?? "").replace(/\r\n/g, "\n").trim(),
    voiceId: text(form, "voiceId"),
    date: text(form, "date") || now.slice(0, 10),
    sources,
    status: existing?.status ?? "draft",
    updatedAt: now,
    publishedAt: existing?.publishedAt,
  };

  if (intent === "preview") {
    // Admin-only: unsaved values go to a short-lived per-admin slot, never the public list.
    await store.putPreview(admin, { ...story, slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : "preview" });
    return to("/admin/preview");
  }

  const issues = [...sourceIssues, ...validateAdminStory(story, listStories().map((item) => item.slug))];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return to(`/admin/edit?error=${encodeURIComponent(issues.join("\n") || "Slug: lowercase words separated by hyphens.")}`);
  }

  if (intent === "publish" && issues.length === 0) {
    story.status = "published";
    story.publishedAt ??= now;
  } else if (intent === "unpublish") {
    story.status = "draft";
  } else if (issues.length) {
    // Invalid copy never stays public: keep the edit as a draft.
    story.status = "draft";
  }
  await store.put(story);

  if (story.status === "published" || existing?.status === "published") {
    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath(`/stories/${slug}`);
  }
  const query = new URLSearchParams({ slug });
  if (issues.length) query.set("error", issues.join("\n"));
  else query.set("saved", story.status);
  return to(`/admin/edit?${query}`);
}
