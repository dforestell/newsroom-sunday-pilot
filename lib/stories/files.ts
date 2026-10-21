// Build-time only: reads content/stories, app/ and public/ from disk.
// Never import this from app/, components/ or runtime lib modules.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { resolve, relative, join, sep } from "node:path";
import { CAST } from "../cast.ts";
import { games, publicLiveEntries } from "../live/catalog.ts";
import { FilingError, checkStoryLinks, parseStory, sortStories, type Story, type StoryRoutes } from "./content.ts";

export function routeInventory(root: string): StoryRoutes {
  const routes: StoryRoutes = new Map();
  const app = join(root, "app");
  for (const entry of readdirSync(app, { recursive: true })) {
    const path = String(entry).split(sep).join("/");
    if (!/(^|\/)page\.[jt]sx?$/.test(path) || path.includes("[")) continue;
    const route = "/" + path.replace(/(^|\/)page\.[jt]sx?$/, "").replace(/\([^/]+\)\//g, "");
    routes.set(route, new Set());
  }
  for (const voice of CAST) {
    routes.set(`/cast/${voice.slug}`, new Set());
    routes.set(`/staff/${voice.slug}`, new Set());
    routes.set(`/bloggers/${voice.slug}`, new Set());
  }
  routes.set("/bloggers/lead-blogger", new Set());
  for (const game of games) {
    const anchors = new Set(publicLiveEntries.filter((entry) => entry.gameId === game.id).map((entry) => entry.id));
    routes.set(`/games/${game.id}`, anchors);
    if (game.liveBlogEnabled) routes.set(`/games/${game.id}/delayed`, anchors);
  }
  routes.set("/games/demo", routes.get("/games/sunday-pilot") ?? new Set());
  return routes;
}

export function publicAssets(root: string): string[] {
  const base = resolve(root, "public");
  if (!existsSync(base)) return [];
  return readdirSync(base, { recursive: true })
    .map((entry) => String(entry).split(sep).join("/"))
    .filter((path) => statSync(join(base, path)).isFile())
    .map((path) => `/${path}`)
    .sort();
}

export function fsAssetCheck(root: string) {
  const publicRoot = resolve(root, "public") + sep;
  return (pathname: string) => {
    const asset = resolve(root, "public", "." + pathname);
    return asset.startsWith(publicRoot) && existsSync(asset) && statSync(asset).isFile();
  };
}

/** Full validation of the filed stories plus the route map (with story anchors) used for link checks. */
export function loadStoriesWithRoutes(directory = resolve("content/stories"), root = process.cwd()): { stories: Story[]; routes: StoryRoutes } {
  const issues: string[] = [];
  const parsed: ReturnType<typeof parseStory>[] = [];
  if (!existsSync(directory)) throw new FilingError([`${directory} — directory: Create content/stories and add a .md file using the Editor template.`]);
  for (const name of readdirSync(directory).sort()) {
    const file = relative(root, join(directory, name));
    if (!name.endsWith(".md")) {
      issues.push(`${file} — filename: Keep only plain .md story files here. Move guides/templates to docs/stories; MDX is not supported.`);
      continue;
    }
    try {
      parsed.push(parseStory(file, readFileSync(join(directory, name), "utf8")));
    } catch (error) {
      if (error instanceof FilingError) issues.push(...error.issues);
      else throw error;
    }
  }
  const routes = routeInventory(root);
  const slugs = new Map<string, string>();
  for (const item of parsed) {
    const previous = slugs.get(item.story.slug);
    if (previous) issues.push(`${item.file} — slug: "${item.story.slug}" is already used by ${previous}. Choose a unique slug; preserve existing public URLs.`);
    slugs.set(item.story.slug, item.file);
    routes.set(`/stories/${item.story.slug}`, item.anchors);
  }
  issues.push(...checkStoryLinks(parsed, routes, fsAssetCheck(root)));
  if (issues.length) throw new FilingError(issues);
  return { stories: sortStories(parsed.map(({ story }) => story)), routes };
}

export function loadStories(directory = resolve("content/stories"), root = process.cwd()): Story[] {
  return loadStoriesWithRoutes(directory, root).stories;
}
