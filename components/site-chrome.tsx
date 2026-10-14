import { BrandLockup, BrandMark } from "@/components/brand-lockup";
import { DemoBanner } from "@/components/demo-banner";
import { SiteNav } from "@/components/site-nav";
import Link from "next/link";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <DemoBanner />
      <header className="relative border-b border-border bg-paper">
        <div className="mx-auto flex h-14 w-full max-w-5xl min-w-0 items-center justify-between gap-4 px-4 sm:h-auto sm:py-3 sm:px-6">
          <BrandLockup />
          <SiteNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl min-w-0 flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-2 px-4 py-4 font-mono text-[11px] tracking-wide text-ink-soft uppercase sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="flex min-w-0 items-start gap-2 leading-5">
            <BrandMark size={16} />
            <span className="min-w-0">Poor Form Sports · Lead: Chip Absolute · Archive: Melbourne · SNF · MNF</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-4">
            <a href="https://x.com/PoorFormSports" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-masthead hover:underline">Follow the Desk</a>
            <Link href="/about" className="inline-flex min-h-11 items-center hover:text-masthead hover:underline">About</Link>
            <Link href="/mail" className="inline-flex min-h-11 items-center hover:text-masthead hover:underline">Mail the Desk</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
