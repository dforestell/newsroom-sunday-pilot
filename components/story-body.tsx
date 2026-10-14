// html is produced by the plain Markdown + sanitization pipeline in lib/stories.
export function StoryBody({ html }: { html: string }) {
  return (
    <div
      className="story-body min-w-0 space-y-5 border-t border-border pt-5 text-ink"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
