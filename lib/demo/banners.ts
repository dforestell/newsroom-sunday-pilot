import { DEMO_BANNER as melbourneBanner, DEMO_GAME_ID as melbourneId } from "@/lib/demo/melbourne";
import { DEMO_BANNER as dalNygBanner, DEMO_GAME_ID as dalNygId } from "@/lib/demo/dal-nyg-snf";
import { DEMO_BANNER as denKcBanner, DEMO_GAME_ID as denKcId } from "@/lib/demo/den-kc-mnf";

export const HOME_DEMO_BANNER =
  "Archive · SF 27 LAR 7 · NYG 28 DAL 20 · KC 31 DEN 10 · not live";

type DemoChrome = {
  banner: string;
  kicker: string;
  sources: string;
  /** Linkable sources already named in `sources`. */
  sourceLinks?: Array<{ label: string; href: string }>;
};

const DEMO_CHROME: Record<string, DemoChrome> = {
  [melbourneId]: {
    banner: melbourneBanner,
    kicker: "Melbourne · MCG",
    sources: "Sources: ESPN recap gameId 401872657, Reuters, Rams.com, NFL gamebook",
    sourceLinks: [
      { label: "ESPN recap", href: "https://www.espn.com/nfl/recap?gameId=401872657" },
      { label: "NFL.com Game Center", href: "https://www.nfl.com/games/49ers-at-rams-2026-reg-1" },
    ],
  },
  [dalNygId]: {
    banner: dalNygBanner,
    kicker: "SNF · MetLife",
    sources: "Sources: ESPN recap gameId 401872930, CBS, NBC, Giants.com",
    sourceLinks: [
      { label: "ESPN recap", href: "https://www.espn.com/nfl/recap?gameId=401872930" },
      { label: "ESPN box score", href: "https://www.espn.com/nfl/game/_/gameId/401872930" },
      { label: "NFL.com Game Center", href: "https://www.nfl.com/games/cowboys-at-giants-2026-reg-1" },
    ],
  },
  [denKcId]: {
    banner: denKcBanner,
    kicker: "MNF · Arrowhead",
    sources: "Sources: ESPN recap gameId 401872931",
    sourceLinks: [{ label: "ESPN recap", href: "https://www.espn.com/nfl/recap/_/gameId/401872931" }],
  },
};

export function demoChrome(gameId: string): DemoChrome | undefined {
  return DEMO_CHROME[gameId];
}

export function demoBannerForPath(pathname: string | null): string {
  if (!pathname) return HOME_DEMO_BANNER;
  for (const [id, chrome] of Object.entries(DEMO_CHROME)) {
    if (pathname.startsWith(`/games/${id}`)) {
      return chrome.banner;
    }
  }
  return HOME_DEMO_BANNER;
}

export function isDemoGamePath(pathname: string): boolean {
  return (
    pathname === "/demo" ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/games/sunday-pilot") ||
    pathname.startsWith("/games/demo-")
  );
}
