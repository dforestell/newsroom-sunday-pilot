// Build-time only: reads content/calls from disk. Never import from runtime code.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { CallFilingError, parseCall, sortCalls, type Call } from "./content.ts";

export function loadCalls(directory = resolve("content/calls"), root = process.cwd()): Call[] {
  const issues: string[] = [];
  const parsed: Array<{ file: string; call: Call }> = [];
  if (!existsSync(directory)) {
    throw new CallFilingError([
      `${relative(root, directory) || directory} — directory: Create content/calls and add one JSON file per call. Copy docs/calls/README.md.`,
    ]);
  }
  for (const name of readdirSync(directory).sort()) {
    const file = relative(root, join(directory, name));
    if (!name.endsWith(".json")) {
      issues.push(`${file} — filename: Keep only .json call files here. Move guides and templates to docs/calls.`);
      continue;
    }
    try {
      parsed.push({ file, call: parseCall(file, readFileSync(join(directory, name), "utf8")) });
    } catch (error) {
      if (error instanceof CallFilingError) issues.push(...error.issues);
      else throw error;
    }
  }
  const posts = new Map<string, string>();
  for (const item of parsed) {
    const previous = posts.get(item.call.postUrl);
    if (previous) {
      issues.push(
        `${item.file} — postUrl: "${item.call.postUrl}" is already used by ${previous}. Each post can be filed once.`,
      );
    }
    posts.set(item.call.postUrl, item.file);
  }
  if (issues.length) throw new CallFilingError(issues);
  return sortCalls(parsed.map(({ call }) => call));
}
