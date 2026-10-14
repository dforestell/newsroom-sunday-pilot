"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDemoGamePath } from "@/lib/demo/banners";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Board", match: (path: string) => path === "/" },
  {
    href: "/calls",
    label: "Calls",
    match: (path: string) => path.startsWith("/calls"),
  },
  {
    href: "/stories",
    label: "Stories",
    match: (path: string) => path.startsWith("/stories"),
  },
  {
    href: "/cast",
    label: "Cast",
    match: (path: string) => path === "/cast",
  },
  {
    href: "/archive",
    label: "Archive",
    match: (path: string) => isDemoGamePath(path),
  },
  {
    href: "/mail",
    label: "Mail the Desk",
    match: (path: string) => path.startsWith("/mail"),
  },
  {
    href: "/cast/chip-absolute",
    label: "Chip Absolute",
    match: (path: string) => path.startsWith("/cast/chip-absolute"),
  },
];

function NavGroup({
  items,
  pathname,
}: {
  items: typeof nav;
  pathname: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center underline-offset-4",
              active
                ? "font-medium text-masthead"
                : "text-ink-soft hover:text-masthead hover:underline",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function SiteNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="flex flex-col font-mono text-xs tracking-wide uppercase sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
      <NavGroup items={nav.slice(0, 4)} pathname={pathname} />
      <NavGroup items={nav.slice(4)} pathname={pathname} />
    </nav>
  );
}
