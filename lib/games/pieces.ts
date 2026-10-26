// Per-game staff pieces that lead /scores/<gameId>. Sport-neutral: game ids are
// "<sport>:<season>:<seasonType>:<AWAY>:<HOME>", e.g. "nfl:2026:2:NE:CHI" or "nba:2026:2:HOU:SAS".
// Add a piece by adding an entry to GAME_PIECES. `author` defaults to chip-absolute.
// Never file invented facts: until the real piece is written, keep placeholder copy.
import type { Call } from "../calls/content.ts";

export type GamePieceAuthor = "chip-absolute" | "nora-median";

export type GamePieceInput = {
  headline: string;
  /** Short body, one paragraph per entry. */
  body: string[];
  author?: GamePieceAuthor;
};

export type GamePiece = Required<GamePieceInput>;

export const DEFAULT_PIECE_AUTHOR: GamePieceAuthor = "chip-absolute";

export const GAME_PIECES: Record<string, GamePieceInput> = {
  "nfl:2026:2:NE:CHI": {
    headline: "Chip on New England at Chicago",
    body: ["Chip’s piece drops before kickoff."],
  },
  "nfl:2026:2:PIT:NO": {
    "headline": "Paris gets the same quarterback twice. I'm taking the one with the run game.",
    "body": [
      "Pittsburgh and New Orleans fly to the Stade de France for an 8:30 AM CT kickoff, and the quarterback lines are basically photocopies. Aaron Rodgers: 1,487 yards, 12 touchdowns, 5 picks. Tyler Shough: 1,443 yards, 12 touchdowns, 5 picks. Anybody selling this as a quarterback duel is selling a tie.",
      "So it comes down to the stuff behind them. Jaylen Warren has 460 rushing yards for the Steelers. The Saints' leading rusher, Kendre Miller, has 153, and Travis Etienne Jr. is on IR. Pittsburgh is 4-2 and has won two straight, including an overtime game in Tampa. New Orleans is 2-4 and coming off a 34-27 win at the Giants.",
      "I'm taking Pittsburgh. The pass rushers cancel out too, with T.J. Watt at 4.5 sacks and Chase Young at 5.5, so the team that can hand it off and stay on schedule wins the breakfast game."
    ]
  },
  "nfl:2026:2:SF:ATL": {
    "headline": "A 6-0 team is a 2.5-point favorite. The line is the bad take.",
    "body": [
      "San Francisco is 6-0 and the number at Atlanta is 2.5. The Falcons are 2-4 and have lost two straight, to Baltimore in overtime and Chicago 31-23. Somebody out there is treating this like a coin flip.",
      "Brock Purdy has 14 touchdown passes against 2 interceptions. Christian McCaffrey has 7 rushing touchdowns. Nick Bosa and Mike Evans are both listed questionable, which matters, but this roster has already won games without everything going right.",
      "Atlanta's whole case is Bijan Robinson, who has 641 rushing yards and is the real reason anyone thinks it's close. I'm taking San Francisco to get to 7-0, and I'll own it if Bijan makes me eat it."
    ]
  },
  "nfl:2026:2:CLE:TEN": {
    "headline": "The lowest total on the board, and I'm all in on boring",
    "body": [
      "Cleveland at Tennessee has a total of 36.5, the lowest of the noon games. The Browns just beat Baltimore 13-10. Nobody is buying a ticket for the offense here, and that's the point.",
      "Cleveland is 4-2 and wins with defense. Mason Graham has 4 sacks, and Deshaun Watson has kept it to 7 touchdowns and 2 picks. Tennessee is 1-5, and its only win came last week, 26-20 at Indianapolis. Cam Ward has 4 touchdowns and 4 interceptions.",
      "I'm taking Cleveland. Jeffery Simmons, with 4 sacks of his own, will make it ugly, but one Titans win doesn't make them a streak."
    ]
  },
  "nfl:2026:2:IND:MIN": {
    "headline": "Minnesota is undefeated without a passing game. Undefeated still counts.",
    "body": [
      "The Vikings are 5-0 and coming off a bye. Kyler Murray leads them with 662 passing yards. They've won games 9-3 over Chicago and 15-10 over Miami. That's not pretty, and it doesn't have to be.",
      "Dallas Turner has 5.5 sacks and gets a crack at Daniel Jones, who has 6 interceptions and 4 touchdowns. Indianapolis is 2-4 and has lost two straight, to Pittsburgh and then Tennessee. Jonathan Taylor's 7 rushing touchdowns are the only part of that offense keeping up.",
      "Minnesota is a 6.5-point favorite and I'm taking the Vikings. T.J. Hockenson and Christian Darrisaw are listed questionable, but this team has won without style points for five weeks."
    ]
  },
  "nfl:2026:2:MIA:NYJ": {
    "headline": "Miami had two weeks to fix it. The 'bounce-back spot' crowd is back too.",
    "body": [
      "The Dolphins are 0-5 and coming off a bye, so here comes the annual 'rested team, desperate team' take. Their last game was a 31-24 loss to Cincinnati. Malik Willis has 2 touchdown passes and 4 interceptions.",
      "The Jets are 2-4 and lost 26-19 at New England last week, but Geno Smith has 7 touchdowns against 1 interception and Garrett Wilson has 418 receiving yards. David Bailey has 5 sacks.",
      "New York is a 4.5-point favorite at home and I'm taking the Jets. A bye week gives you rest. It doesn't give you a passing game."
    ]
  },
  "nfl:2026:2:TB:CAR": {
    "headline": "Carolina is the team on a streak. Act like it.",
    "body": [
      "The Panthers are 3-2 and have won two straight, 32-26 over Detroit and 25-14 at Philadelphia. Bryce Young has 1,549 yards, 11 touchdowns and 2 interceptions. Tetairoa McMillan has 471 receiving yards.",
      "Tampa Bay is 1-5 and just lost 26-19 in overtime to Pittsburgh. Baker Mayfield is listed questionable and has played three games this season. Emeka Egbuka is listed questionable too. Bucky Irving has 452 rushing yards and has been the steady part.",
      "Carolina is a 3-point favorite and I'm taking the Panthers. Anyone still filing this under 'Young needs to prove it' is watching last year's tape."
    ]
  },
  "nfl:2026:2:CIN:BAL": {
    "headline": "Lamar is questionable. Derrick Henry is not. I'm taking Baltimore.",
    "body": [
      "Lamar Jackson is listed questionable for Cincinnati at Baltimore, and the line is only 1.5. When he's played, he's been sharp: 967 yards, 6 touchdowns, 1 interception.",
      "Derrick Henry has 534 rushing yards and 7 touchdowns, and he doesn't need Lamar's status settled to get carries. Baltimore is 4-2 but lost 13-10 at Cleveland last week. Cincinnati is 3-2, off a bye, and Joe Burrow has 11 touchdowns against 3 interceptions with Tee Higgins at 423 receiving yards.",
      "I'm taking the Ravens. Burrow can make this a shootout, but the team with the 7-touchdown back gets the last word at home."
    ]
  },
  "nfl:2026:2:NYG:HOU": {
    "headline": "Ten and a half is the wrong number",
    "body": [
      "Houston is 2-4. The Giants are 3-2-1. Houston is a 10.5-point favorite. Whoever set that line is scoring the last two weeks and ignoring the rest of the table.",
      "To be fair to the Texans, they've won two straight, 26-3 at Tennessee and 34-31 over Jacksonville. C.J. Stroud has 1,714 yards with 1 interception, and Will Anderson Jr. has 7.5 sacks. Giants tackles Andrew Thomas and Jermaine Eluemunor are both listed questionable, and that's the matchup to watch.",
      "Jameis Winston has 7 touchdowns and 5 interceptions, so the Giants will hand Houston chances. I'm taking Houston to win and the Giants to keep it inside double digits. Malik Nabers, with 494 receiving yards, is why."
    ]
  },
  "nfl:2026:2:DEN:ARI": {
    "headline": "Denver's defense keeps winning ugly. I'm not betting against ugly.",
    "body": [
      "The Broncos are 4-2 and their quarterback is the part everybody's worried about. Bo Nix has 1,049 yards, 6 touchdowns and 3 picks, and he threw for 107 yards in last week's 17-14 overtime win over Seattle. Denver won anyway, which is kind of the whole scouting report.",
      "Arizona is 2-4 and just snapped a four-game skid with an 18-16 win at the Rams, with Chad Ryland kicking six field goals. The Cardinals haven't won at home in nine straight games. Jacoby Brissett has 9 touchdowns and 6 interceptions, and Trey McBride leads them with 361 receiving yards.",
      "Denver is a 4.5-point favorite and I'm taking the Broncos. Zach Allen has 4.5 sacks, Pat Surtain II is listed questionable, and six field goals is a great Sunday that nobody repeats on purpose."
    ]
  },
  "nfl:2026:2:GB:DET": {
    "headline": "The highest total on the board, so of course I took the Packers receiver",
    "body": [
      "Green Bay at Detroit has a 53.5 total, the biggest of the week, and the Lions are 3-point favorites. Detroit is 3-2 after a 45-21 win in Arizona. Green Bay is 4-2 and has won three straight, the last one 23-13 over Dallas.",
      "My call is already posted on [Chip's calls](https://poorformsports.com/calls): Christian Watson goes for 100 receiving yards. He has 538 yards and 6 touchdowns, and Detroit safeties Brian Branch and Kerby Joseph are both listed out. Josh Jacobs is expected to play his first game of the season, which helps a Packers run game that ranks last in rushing yards.",
      "None of that means I'm picking against Detroit. Jared Goff has 12 touchdowns and zero picks, and Jahmyr Gibbs has 7 rushing touchdowns. I'm taking the Lions to win a shootout and Watson to cash his yards in the loss. Both can be true."
    ]
  },
  "nfl:2026:2:LAR:LV": {
    "headline": "The Rams are 2-4 and still the favorite. I'm fine with that.",
    "body": [
      "Los Angeles is 2-4 after an 18-16 loss to Arizona. The injury list is long: Myles Garrett and Kobie Turner are on IR, Nate Landman is out, and Puka Nacua and Trent McDuffie are listed questionable.",
      "Las Vegas is 3-3 but has lost three straight, including 30-27 to Kansas City and 33-30 to Buffalo. Kirk Cousins has 14 touchdowns against 5 interceptions, and Brock Bowers leads them with 382 receiving yards.",
      "I'm taking the Rams. Matthew Stafford has 1,794 yards and Davante Adams has 480 receiving yards with Nacua in question. The '2-4 means they're cooked' crowd is grading the record, not the roster."
    ]
  },
  "nfl:2026:2:KC:SEA": {
    "headline": "Kansas City is 5-0 and getting points. Kenneth Walker would like a word.",
    "body": [
      "The Chiefs are undefeated, and Seattle is a 3-point favorite at home. The Seahawks are 3-3 and have lost two straight, 32-29 to San Francisco and 17-14 in overtime at Denver. Somebody set this line off the stadium, not the standings.",
      "Kenneth Walker III now leads the league at 133 rushing yards per game for Kansas City, with 665 yards and 6 rushing touchdowns. Patrick Mahomes has 9 touchdowns and 3 interceptions. Rashee Rice is out.",
      "Seattle's best answer is Jaxon Smith-Njigba, who has 717 receiving yards and 7 touchdowns. Sam Darnold has 7 touchdowns and 7 interceptions, though, and that's the number I'm taking. Chiefs win and stay perfect."
    ]
  },
  "nfl:2026:2:DAL:PHI": {
    "headline": "Two 2-4 teams, one division nobody wants. I'll take the team with a quarterback.",
    "body": [
      "Dallas and Philadelphia are both 2-4, and the NFC East is somehow still wide open. The Eagles have lost four straight, most recently 25-14 to Carolina. The Cowboys have dropped two in a row, 24-16 to Tampa Bay and 23-13 at Green Bay. Dallas is a 4.5-point favorite on the road, with a 43.5 total.",
      "Tanner McKee makes his second straight start for Philadelphia with Jalen Hurts on injured reserve. DeVonta Smith and Dontayvion Wicks are both out, and so is Nolan Smith. Saquon Barkley is questionable after missing two games. The Eagles ran for 22 and 35 yards in the two games he sat.",
      "Dak Prescott has 1,639 yards, 10 touchdowns and 5 interceptions, CeeDee Lamb has 577 receiving yards, and Javonte Williams has 7 rushing touchdowns. DeMarvion Overshown and Cobie Durant are back for the defense. I'm taking the Cowboys. The 'never bet against Philly at home' take is grading a roster that isn't suiting up tonight."
    ]
  },
};

export type BodySegment = { text: string; href?: string };

const SITE_ORIGIN = "https://poorformsports.com";

/** Internal path for a piece link, or null. Only relative paths and https://poorformsports.com URLs. */
export function safePieceHref(raw: string): string | null {
  let href = raw.trim();
  if (href === SITE_ORIGIN) href = "/";
  else if (href.startsWith(SITE_ORIGIN + "/")) href = href.slice(SITE_ORIGIN.length);
  if (!href.startsWith("/") || href.startsWith("//") || /[\\\s]/.test(href)) return null;
  return href;
}

/** Splits a body paragraph on [label](url) links. Disallowed URLs render as plain label text. */
export function parseBodyLinks(paragraph: string): BodySegment[] {
  const out: BodySegment[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of paragraph.matchAll(re)) {
    if (m.index > last) out.push({ text: paragraph.slice(last, m.index) });
    const href = safePieceHref(m[2]);
    out.push(href ? { text: m[1], href } : { text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < paragraph.length) out.push({ text: paragraph.slice(last) });
  return out;
}

export type ParsedGameId = { sport: string; season: number; away: string; home: string };

const GAME_ID = /^(nfl|nba):(\d{4}):([1-5]):([A-Z]{2,4}):([A-Z]{2,4})$/;

export function parseGameId(id: string): ParsedGameId | null {
  const m = GAME_ID.exec(id);
  if (!m) return null;
  return { sport: m[1].toUpperCase(), season: Number(m[2]), away: m[4], home: m[5] };
}

export function getGamePiece(id: string, pieces: Record<string, GamePieceInput> = GAME_PIECES): GamePiece | null {
  const input = pieces[id];
  if (!input) return null;
  return { headline: input.headline, body: input.body, author: input.author ?? DEFAULT_PIECE_AUTHOR };
}

/**
 * Chip's call for this game, matched on existing call fields only (sport, "AWAY at HOME",
 * and the call date's year within the season window). Latest match wins.
 */
export function findGameCall(id: string, calls: Call[]): Call | null {
  const game = parseGameId(id);
  if (!game) return null;
  const label = `${game.away} AT ${game.home}`;
  const matches = calls.filter((call) => {
    if (call.sport.toUpperCase() !== game.sport || call.game.trim().toUpperCase() !== label) return false;
    const year = Number(call.date.slice(0, 4));
    return year === game.season || year === game.season + 1;
  });
  return matches.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}
