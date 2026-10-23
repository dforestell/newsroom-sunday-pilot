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
      "Cleveland at Tennessee has a total of 37.5, the lowest of the noon games. The Browns just beat Baltimore 13-10. Nobody is buying a ticket for the offense here, and that's the point.",
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
};

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
