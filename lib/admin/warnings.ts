export const EMPTY_SOURCES_WARNING = "No sources listed. You can still publish, but facts should link to where they came from.";

/** Warns, never blocks: returns the warning for an empty sources field. */
export function sourcesWarning(text: string): string | null {
  return text.trim() ? null : EMPTY_SOURCES_WARNING;
}
