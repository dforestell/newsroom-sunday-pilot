import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin/session";
import { mergeCalls } from "@/lib/admin/merge";
import { FILE_CALLS } from "@/lib/generated/content";
import { adminContentOrNull } from "../../data";
import { CallForm } from "../../forms";

export default async function EditCallPage({ searchParams }: PageProps<"/admin/calls/edit">) {
  if (!(await currentAdmin())) redirect("/admin");
  const { postUrl } = await searchParams;
  let initial: Record<string, string> = { kind: "forecast", status: "pending" };
  const editing = typeof postUrl === "string" && Boolean(postUrl);
  if (editing) {
    const content = await adminContentOrNull();
    const call = mergeCalls(FILE_CALLS, content?.calls ?? []).find((item) => item.postUrl === postUrl);
    if (!call) notFound();
    const { dateLabel: _label, ...fields } = call;
    void _label;
    initial = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, String(value ?? "")]));
  }
  return (
    <section className="max-w-3xl space-y-4">
      <Link href="/admin#calls" className="font-mono text-sm text-masthead uppercase underline-offset-4 hover:underline">← Admin</Link>
      <h1 className="font-heading text-3xl font-semibold">{editing ? "Grade or edit call" : "Add call"}</h1>
      <p className="text-sm text-ink-soft">Uses the same rules as the filed calls. A saved call replaces the filed version of the same post on the site.</p>
      <CallForm initial={initial} editing={editing} />
    </section>
  );
}
