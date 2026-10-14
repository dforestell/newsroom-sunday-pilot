import { DeskPill } from "@/components/desk-pill";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/stories";

type LabelTone = "demo" | "satire";

/** Split a story's front-matter label ("SATIRE", "DEMO / SATIRE") into chips. */
export function storyLabelParts(label: Story["label"]): Array<{ text: string; tone: LabelTone }> {
  return label
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((text) => ({ text, tone: text.toLowerCase() as LabelTone }));
}

/** Text chips (never color-only) showing the label a story actually carries. */
export function StoryLabel({ label, className }: { label: Story["label"]; className?: string }) {
  return (
    <span
      data-story-label={label}
      className={cn("inline-flex shrink-0 items-center gap-1 align-middle", className)}
    >
      {storyLabelParts(label).map((part) => (
        <DeskPill key={part.text} tone={part.tone} className="tracking-wide">
          {part.text}
        </DeskPill>
      ))}
    </span>
  );
}
