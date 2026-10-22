"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = ["All", "NFL", "NBA"] as const;
type Option = (typeof OPTIONS)[number];

/** All / NFL / NBA toggle. Panels are rendered on the server; this only picks one. */
export function SportFilter({ panels, label }: { panels: Record<Option, React.ReactNode>; label: string }) {
  const [active, setActive] = useState<Option>("All");
  return (
    <div className="space-y-2">
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={active === option}
            onClick={() => setActive(option)}
            className={cn(
              "inline-flex min-h-11 min-w-14 items-center justify-center border-2 border-border px-3 font-mono text-sm tracking-[0.08em] uppercase",
              active === option ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-card-loud",
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <div data-sport-panel={active}>{panels[active]}</div>
    </div>
  );
}
