import type { Metadata } from "next";

export const metadata: Metadata = { title: "Desk admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}
