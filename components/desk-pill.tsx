import { cn } from "@/lib/utils";

export function DeskPill({
  tone = "outline",
  children,
  className,
}: {
  tone?: "demo" | "satire" | "final" | "live" | "sim" | "warn" | "outline" | "lead" | "ungraded" | "arguing";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 font-mono text-[10px] font-medium tracking-wide uppercase",
        tone === "demo" && "bg-demo text-ink",
        tone === "satire" && "bg-satire text-satire-fg",
        tone === "final" && "bg-bar text-bar-foreground",
        tone === "live" && "bg-live-green text-ink",
        tone === "sim" && "bg-sim text-sim-foreground",
        tone === "warn" && "bg-warn text-bar-foreground",
        tone === "lead" && "bg-masthead text-bar-foreground",
        tone === "outline" && "border border-border bg-transparent text-ink-soft",
        tone === "ungraded" && "border border-ink bg-transparent text-ink",
        tone === "arguing" && "bg-demo text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
