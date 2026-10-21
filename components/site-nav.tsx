"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  {
    href: "/stories",
    label: "Stories",
    match: (path: string) => path.startsWith("/stories"),
  },
  {
    href: "/calls",
    label: "Calls",
    match: (path: string) => path.startsWith("/calls"),
  },
  {
    href: "/cast",
    label: "Cast",
    match: (path: string) => path === "/cast",
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

function linkClass(active: boolean) {
  return cn(
    "inline-flex items-center underline-offset-[6px] [text-decoration-color:var(--ink)] [text-decoration-thickness:2px]",
    active
      ? "font-semibold text-masthead underline [font-weight:600]"
      : "font-medium text-ink-soft hover:text-masthead hover:underline",
  );
}

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <nav aria-label="Main" className="font-mono tracking-[0.08em] uppercase">
      <ul className="hidden flex-wrap items-center justify-end gap-x-4 text-[15px] lg:flex lg:flex-nowrap lg:whitespace-nowrap">
        {nav.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("min-h-11", linkClass(active))}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        ref={toggleRef}
        type="button"
        className="inline-flex min-h-11 items-center border-2 border-border px-3 font-mono text-sm tracking-[0.08em] uppercase lg:hidden"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {open ? (
        <ul
          id="site-menu"
          className="absolute inset-x-0 top-full z-40 border-b-2 border-border bg-paper text-sm lg:hidden"
        >
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href} className="border-t border-ink/15">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn("h-12 w-full px-4", linkClass(active))}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </nav>
  );
}

