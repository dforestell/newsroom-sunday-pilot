"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { ADMIN_COOKIE, createSession, sessionCookieOptions } from "@/lib/admin/auth";
import { adminDirectory, currentAdmin, adminReady, isOwner } from "@/lib/admin/session";
import { clearUserFailures, clientIp, isLimited, recordFailure } from "@/lib/admin/ratelimit";
import { UserStore } from "@/lib/admin/users";
import { ADMIN_CONTENT_TAG } from "@/lib/admin/keys";
import { redisConfig } from "@/lib/admin/redis";
import { deleteAdminCall, fetchAdminContent, putAdminCall, putAdminStory } from "@/lib/admin/store";
import { validateAdminStory, type AdminStoryInput, type AdminStoryRecord } from "@/lib/admin/stories";
import { CALL_FIELDS, validateAdminCall, type AdminCallRecord } from "@/lib/admin/calls";
import { FILE_STORIES } from "@/lib/generated/content";

export type FormState = { issues: string[]; values?: Record<string, string> };

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "");
}

async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) redirect("/admin");
  return user;
}

function refreshPublicPages() {
  updateTag(ADMIN_CONTENT_TAG);
  revalidatePath("/", "layout");
}

async function loadAdmin() {
  const config = redisConfig();
  if (!config) throw new Error("Redis is not configured.");
  return fetchAdminContent(config);
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  if (!adminReady()) return { issues: ["Admin is not configured."] };
  const username = text(form, "username").trim().toLowerCase();
  const values = { username };
  const config = redisConfig();
  const ip = clientIp(await headers());
  if (await isLimited(config, username, ip)) {
    return { issues: ["Too many failed sign-ins. Wait 15 minutes and try again."], values };
  }
  const user = await adminDirectory().verify(username, text(form, "password"));
  if (!user) {
    await recordFailure(config, username, ip);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { issues: ["That username and password did not match."], values };
  }
  await clearUserFailures(config, username);
  (await cookies()).set(ADMIN_COOKIE, createSession(user), sessionCookieOptions());
  redirect("/admin");
}

// ---------- users (owner only) ----------

async function requireOwner() {
  const user = await requireAdmin();
  if (!isOwner(user)) redirect("/admin/users");
  const config = redisConfig();
  if (!config) throw new Error("Redis is not configured.");
  return new UserStore(config);
}

const storeDown = ["Could not reach the user store. Nothing was changed; try again."];

export async function createUserAction(_: FormState, form: FormData): Promise<FormState> {
  const store = await requireOwner();
  const values = { username: text(form, "username").trim(), label: text(form, "label") };
  let issues: string[];
  try {
    issues = await store.create({ ...values, password: text(form, "password"), confirm: text(form, "confirm") });
  } catch {
    return { issues: storeDown, values };
  }
  if (issues.length) return { issues, values };
  redirect(`/admin/users?saved=${encodeURIComponent(values.username)}`);
}

export async function resetPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const store = await requireOwner();
  const username = text(form, "username");
  let issues: string[];
  try {
    issues = await store.resetPassword(username, text(form, "password"), text(form, "confirm"));
  } catch {
    return { issues: storeDown };
  }
  if (issues.length) return { issues };
  redirect(`/admin/users?saved=${encodeURIComponent(username)}`);
}

export async function setUserDisabledAction(form: FormData) {
  const store = await requireOwner();
  const username = text(form, "username");
  await store.setDisabled(username, text(form, "disabled") === "true");
  redirect(`/admin/users?saved=${encodeURIComponent(username)}`);
}

export async function deleteUserAction(form: FormData) {
  const store = await requireOwner();
  await store.remove(text(form, "username"));
  redirect("/admin/users");
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function saveStoryAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const values: Record<string, string> = {};
  for (const key of ["slug", "title", "dek", "body", "voiceId", "date", "originalSlug", "status"]) values[key] = text(form, key);
  const editing = values.originalSlug;
  if (editing && editing !== values.slug.trim()) return { issues: ["slug: The slug of a saved story cannot change; it is the public URL."], values };
  let existing: AdminStoryRecord[];
  try {
    existing = (await loadAdmin()).stories;
  } catch {
    return { issues: ["Could not reach the content store. Nothing was saved; try again."], values };
  }
  if (!editing && existing.some((story) => story.slug === values.slug.trim())) {
    return { issues: [`slug: "${values.slug}" is already used by an admin story. Edit that story instead.`], values };
  }
  const input: AdminStoryInput = { slug: values.slug.trim(), title: values.title, dek: values.dek, body: values.body, voiceId: values.voiceId, date: values.date.trim() };
  const result = validateAdminStory(input, { fileSlugs: FILE_STORIES.map((story) => story.slug), adminSlugs: existing.map((story) => story.slug) });
  if ("issues" in result) return { issues: result.issues, values };
  const record: AdminStoryRecord = {
    ...input,
    title: input.title.trim(),
    dek: input.dek.trim(),
    body: input.body.replace(/\r\n/g, "\n").trim(),
    status: values.status === "unpublished" ? "unpublished" : "published",
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
  };
  try {
    await putAdminStory(record);
  } catch {
    return { issues: ["Could not save to the content store. Nothing was saved; try again."], values };
  }
  refreshPublicPages();
  redirect(`/admin?saved=${encodeURIComponent(record.slug)}`);
}

export async function setStoryStatusAction(form: FormData) {
  const user = await requireAdmin();
  const slug = text(form, "slug");
  const status = text(form, "status") === "published" ? "published" : "unpublished";
  const story = (await loadAdmin()).stories.find((item) => item.slug === slug);
  if (!story) redirect("/admin?error=missing");
  await putAdminStory({ ...story, status, updatedAt: new Date().toISOString(), updatedBy: user.id });
  refreshPublicPages();
  redirect(`/admin?saved=${encodeURIComponent(slug)}`);
}

export async function saveCallAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const values: Record<string, string> = {};
  for (const key of [...CALL_FIELDS, "originalPostUrl"]) values[key] = text(form, key);
  if (values.originalPostUrl && values.originalPostUrl !== values.postUrl.trim()) {
    return { issues: ["postUrl: The post of a saved call cannot change. Add a new call instead."], values };
  }
  const record: AdminCallRecord = Object.fromEntries(CALL_FIELDS.map((key) => [key, values[key]]));
  const result = validateAdminCall(record);
  if ("issues" in result) return { issues: result.issues, values };
  try {
    await putAdminCall({ ...result.json, postUrl: result.call.postUrl, updatedAt: new Date().toISOString(), updatedBy: user.id });
  } catch {
    return { issues: ["Could not save to the content store. Nothing was saved; try again."], values };
  }
  refreshPublicPages();
  redirect(`/admin?saved=${encodeURIComponent(result.call.take)}#calls`);
}

export async function revertCallAction(form: FormData) {
  await requireAdmin();
  await deleteAdminCall(text(form, "postUrl"));
  refreshPublicPages();
  redirect("/admin#calls");
}
