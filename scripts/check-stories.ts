import { resolve } from "node:path";
import { FilingError } from "../lib/stories/content.ts";
import { loadStories } from "../lib/stories/files.ts";

try {
  const directory = process.argv[2] ? resolve(process.argv[2]) : undefined;
  const stories = loadStories(directory);
  console.log(`Story filing passed: ${stories.length} stories, valid authors, labels, copy and internal links.`);
} catch (error) {
  if (!(error instanceof FilingError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
}
