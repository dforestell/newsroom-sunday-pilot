// Game hook cards for HOU at SAS, Fri Oct 23, 2026. Facts only from
// research/nba-fri-2026-10-23-pack.md and research/star-cheatsheet-nba.md, each with its source.
export const HOU_SAS_GAME = {
  matchup: "Rockets at Spurs",
  when: "Fri Oct 23 · 8:30 PM CT",
  tv: "Prime Video",
  venue: "Moody Center, Austin, TX",
  source: { label: "NBA.com game page", url: "https://www.nba.com/game/hou-vs-sas-0022600009" },
};

export type HookCard = { kicker: string; fact: string; source: { label: string; url: string } };

export const HOU_SAS_HOOKS: HookCard[] = [
  {
    kicker: "The box score that started it",
    fact: "Opening night, the Spurs lost 116–104 to OKC. Wembanyama went 1-for-13 from the field and still had 12 points, 13 rebounds and 6 blocks.",
    source: { label: "ESPN game summary", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=401909090" },
  },
  {
    kicker: "Last season, for scale",
    fact: "Wembanyama’s 2025–26: 25.0 points and 11.5 rebounds a game on 51.2% shooting. Defensive Player of the Year, third in MVP, All-NBA First Team.",
    source: { label: "ESPN player page", url: "https://www.espn.com/nba/player/_/id/5104157" },
  },
  {
    kicker: "One roster, two trophies",
    fact: "Wembanyama (2023–24) and Stephon Castle (2024–25) are back-to-back Rookies of the Year on the same Spurs roster.",
    source: { label: "ESPN player page", url: "https://www.espn.com/nba/player/_/id/5104157" },
  },
];
