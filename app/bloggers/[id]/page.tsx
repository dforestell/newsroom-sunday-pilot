import { redirect } from "next/navigation";
import { CAST } from "@/lib/cast";

export function generateStaticParams() {
  return [
    { id: "lead-blogger" },
    ...CAST.map((voice) => ({ id: voice.slug })),
  ];
}

export default async function BloggerRedirectPage({
  params,
}: PageProps<"/bloggers/[id]">) {
  const { id } = await params;
  if (id === "lead-blogger") {
    redirect("/staff/chip-absolute");
  }
  redirect(`/staff/${id}`);
}
