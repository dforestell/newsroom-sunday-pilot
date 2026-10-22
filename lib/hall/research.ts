// Hall of Wrong: preseason takes that are already provably dead, from the research file
// star-debunked-takes.md (Oct 21, 2026). Wording is the file's own or a faithful
// paraphrase. Mock the take, never the person. On-field facts only.
//
// Left out on purpose (the file marks them as not provable yet, or not debunks):
// - FOX staff "trending wrong" picks (Chargers, Texans, Chiefs): outcomes still open.
// - Opening-night overreaction watch: not debunked takes.
// - "Next candidates to check": unverified.
import type { Sport } from "../calls/sports.ts";

export type HallSource = { label: string; url: string };

export type HallEntry = {
  id: string;
  sport: Sport;
  take: string;
  /** Who made the take, where and when, as the file records it. */
  credit: string;
  verdict: string;
  /** Extra framing note (for example, an injury: the projection is the subject, not the injury). */
  note?: string;
  sources: HallSource[];
};

const CBS_FINAL_UNDEFEATED = "https://www.cbssports.com/nfl/news/who-will-be-the-nfls-final-undefeated-team-in-2026/";
const NBC_RAMS_RESULT = "https://www.nbcsportsbayarea.com/nfl/san-francisco-49ers/bill-plaschke-hot-take-rams-columnist-undefeated/1962577/";

export const HALL_RESEARCH: HallEntry[] = [
  {
    id: "rams-undefeated",
    sport: "NFL",
    take: "“Rams will go undefeated on their way to winning another home Super Bowl title.” 17–0 in the regular season, 20–0 overall.",
    credit: "LA Times column, Sep 6, 2026. The column itself said it “sounds like a blazing hot take that will chill soon.”",
    verdict: "The Rams lost Week 1, 27–7 to the 49ers in Melbourne. The undefeated season died in Game 1, and the column got a follow-up owning it on Sep 13.",
    sources: [
      { label: "LA Times, the take", url: "https://www.latimes.com/sports/rams/story/2026-09-06/rams-will-go-undefeated-win-super-bowl-title" },
      { label: "NBC Sports Bay Area, the result", url: NBC_RAMS_RESULT },
      { label: "LA Times, the follow-up", url: "https://www.latimes.com/sports/rams/story/2026-09-13/bill-plaschke-writes-about-predictable-reaction-to-rams-unbeaten-prediction" },
    ],
  },
  {
    id: "ravens-last-unbeaten",
    sport: "NFL",
    take: "The Ravens will be the NFL’s final undefeated team, starting 7–0 before losing at Buffalo in Week 8.",
    credit: "CBS Sports, Aug 19, 2026.",
    verdict: "The Ravens lost Week 2 at home, 24–17 to the Saints.",
    sources: [
      { label: "CBS Sports, the take", url: CBS_FINAL_UNDEFEATED },
      { label: "Ravens.com, the recap", url: "https://www.baltimoreravens.com/news/ravens-fall-to-saints-in-home-opener-week-2-2026" },
    ],
  },
  {
    id: "niners-lose-week-1",
    sport: "NFL",
    take: "The 49ers lose Week 1 to the Rams. “I like the Rams… better roster.”",
    credit: "CBS Sports, Aug 19, 2026 (same piece).",
    verdict: "The 49ers won 27–7 and were 6–0 by Week 6.",
    sources: [
      { label: "CBS Sports, the take", url: CBS_FINAL_UNDEFEATED },
      { label: "NBC Sports Bay Area, the result", url: NBC_RAMS_RESULT },
    ],
  },
  {
    id: "rams-first-loss-week-3",
    sport: "NFL",
    take: "The Rams’ first loss comes in Week 3 at Denver.",
    credit: "CBS Sports, Aug 19, 2026 (same piece).",
    verdict: "Their first loss came in Week 1.",
    sources: [
      { label: "CBS Sports, the take", url: CBS_FINAL_UNDEFEATED },
      { label: "NBC Sports Bay Area, the result", url: NBC_RAMS_RESULT },
    ],
  },
  {
    id: "simmons-opening-night",
    sport: "NBA",
    take: "Ben Simmons in the Kings’ opening-night rotation (Oct 21 vs the Clippers).",
    credit: "Kings On SI, Sep 6, 2026.",
    verdict: "Simmons tore his right Achilles in practice and is expected to miss all of 2026–27.",
    note: "The projection is what missed. The injury is not the joke.",
    sources: [
      { label: "SI, the projection", url: "https://www.si.com/nba/kings/onsi/predicting-kings-full-opening-night-rotation-with-ben-simmons" },
      { label: "The Athletic, the update", url: "https://www.nytimes.com/athletic/7702805/2026/10/18/ben-simmons-achilles-injury-kings/" },
    ],
  },
];
