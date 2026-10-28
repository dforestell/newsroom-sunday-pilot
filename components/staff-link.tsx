import Link from "next/link";
import { cn } from "@/lib/utils";
import { staffPath } from "@/lib/staff";
import { getVoice, isActiveVoice } from "@/lib/cast";

/**
 * A byline or name that links to /staff/<slug>. Inside a card that is itself a link,
 * use `raised` with the card's stretched title link so the two links don't nest.
 */
export function StaffLink({
  slug,
  children,
  className,
  raised = false,
}: {
  slug: string;
  children: React.ReactNode;
  className?: string;
  raised?: boolean;
}) {
  // Hidden (inactive) voices keep their byline as plain text: no link to a redirected page.
  if (!isActiveVoice(getVoice(slug))) return <span className={className}>{children}</span>;
  return (
    <Link
      href={staffPath(slug)}
      className={cn("underline-offset-4 hover:underline", raised && "relative z-10", className)}
    >
      {children}
    </Link>
  );
}
