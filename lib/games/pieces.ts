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
    "headline": "Paris gets the same quarterback twice. Give me the one with the run game.",
    "body": [
      "Pittsburgh and New Orleans fly to the Stade de France for an 8:30 AM CT kickoff, and the quarterback lines are basically photocopies. Aaron Rodgers: 1,487 yards, 12 touchdowns, 5 picks. Tyler Shough: 1,443 yards, 12 touchdowns, 5 picks. Anybody selling this as a quarterback duel is selling a tie.",
      "So it comes down to the stuff behind them. Jaylen Warren has 460 rushing yards for the Steelers. The Saints' leading rusher, Kendre Miller, has 153, and Travis Etienne Jr. is on IR. Pittsburgh is 4-2 and has won two straight, including an overtime game in Tampa. New Orleans is 2-4 and coming off a 34-27 win at the Giants.",
      "Pittsburgh wins. The pass rushers cancel out too, with T.J. Watt at 4.5 sacks and Chase Young at 5.5, so the team that can hand it off and stay on schedule wins the breakfast game."
    ]
  },
  "nfl:2026:2:SF:ATL": {
    "headline": "A 6-0 team against a 2-4 team. Don't overthink it.",
    "body": [
      "San Francisco is 6-0 and plays at Atlanta. The Falcons are 2-4 and have lost two straight, to Baltimore in overtime and Chicago 31-23. Somebody out there is treating this like a toss-up.",
      "Brock Purdy has 14 touchdown passes against 2 interceptions. Christian McCaffrey has 7 rushing touchdowns. Nick Bosa and Mike Evans are both listed questionable, which matters, but this roster has already won games without everything going right.",
      "Atlanta's whole case is Bijan Robinson, who has 641 rushing yards and is the real reason anyone thinks it's close. San Francisco gets to 7-0, and I'll own it if Bijan makes me eat it."
    ]
  },
  "nfl:2026:2:CLE:TEN": {
    "headline": "The quietest offense on the noon slate, and I'm all in on boring",
    "body": [
      "Cleveland at Tennessee won't be the shootout of the noon games. The Browns just beat Baltimore 13-10. Nobody is buying a ticket for the offense here, and that's the point.",
      "Cleveland is 4-2 and wins with defense. Mason Graham has 4 sacks, and Deshaun Watson has kept it to 7 touchdowns and 2 picks. Tennessee is 1-5, and its only win came last week, 26-20 at Indianapolis. Cam Ward has 4 touchdowns and 4 interceptions.",
      "Cleveland wins. Jeffery Simmons, with 4 sacks of his own, will make it ugly, but one Titans win doesn't make them a streak."
    ]
  },
  "nfl:2026:2:IND:MIN": {
    "headline": "Minnesota is undefeated without a passing game. Undefeated still counts.",
    "body": [
      "The Vikings are 5-0 and coming off a bye. Kyler Murray leads them with 662 passing yards. They've won games 9-3 over Chicago and 15-10 over Miami. That's not pretty, and it doesn't have to be.",
      "Dallas Turner has 5.5 sacks and gets a crack at Daniel Jones, who has 6 interceptions and 4 touchdowns. Indianapolis is 2-4 and has lost two straight, to Pittsburgh and then Tennessee. Jonathan Taylor's 7 rushing touchdowns are the only part of that offense keeping up.",
      "The Vikings win. T.J. Hockenson and Christian Darrisaw are listed questionable, but this team has won without style points for five weeks."
    ]
  },
  "nfl:2026:2:MIA:NYJ": {
    "headline": "Miami had two weeks to fix it. The 'rested team' crowd is back too.",
    "body": [
      "The Dolphins are 0-5 and coming off a bye, so here comes the annual 'rested team, desperate team' take. Their last game was a 31-24 loss to Cincinnati. Malik Willis has 2 touchdown passes and 4 interceptions.",
      "The Jets are 2-4 and lost 26-19 at New England last week, but Geno Smith has 7 touchdowns against 1 interception and Garrett Wilson has 418 receiving yards. David Bailey has 5 sacks.",
      "The Jets win at home. A bye week gives you rest. It doesn't give you a passing game."
    ]
  },
  "nfl:2026:2:TB:CAR": {
    "headline": "Carolina is the team on a streak. Act like it.",
    "body": [
      "The Panthers are 3-2 and have won two straight, 32-26 over Detroit and 25-14 at Philadelphia. Bryce Young has 1,549 yards, 11 touchdowns and 2 interceptions. Tetairoa McMillan has 471 receiving yards.",
      "Tampa Bay is 1-5 and just lost 26-19 in overtime to Pittsburgh. Baker Mayfield is listed questionable and has played three games this season. Emeka Egbuka is listed questionable too. Bucky Irving has 452 rushing yards and has been the steady part.",
      "The Panthers win. Anyone still filing this under 'Young needs to prove it' is watching last year's tape."
    ]
  },
  "nfl:2026:2:CIN:BAL": {
    "headline": "Derrick Henry doesn't need a status update. Baltimore wins.",
    "body": [
      "Lamar Jackson is listed questionable for Cincinnati at Baltimore. When he's played, he's been sharp: 967 yards, 6 touchdowns, 1 interception.",
      "Derrick Henry has 534 rushing yards and 7 touchdowns, and he doesn't need Lamar's status settled to get carries. Baltimore is 4-2 but lost 13-10 at Cleveland last week. Cincinnati is 3-2, off a bye, and Joe Burrow has 11 touchdowns against 3 interceptions with Tee Higgins at 423 receiving yards.",
      "The Ravens win. Burrow can make this a shootout, but the team with the 7-touchdown back gets the last word at home."
    ]
  },
  "nfl:2026:2:NYG:HOU": {
    "headline": "Houston is 2-4. Don't crown them yet.",
    "body": [
      "Houston is 2-4. The Giants are 3-2-1. Anyone treating Houston as a lock is scoring the last two weeks and ignoring the rest of the table.",
      "To be fair to the Texans, they've won two straight, 26-3 at Tennessee and 34-31 over Jacksonville. C.J. Stroud has 1,714 yards with 1 interception, and Will Anderson Jr. has 7.5 sacks. Giants tackles Andrew Thomas and Jermaine Eluemunor are both listed questionable, and that's the matchup to watch.",
      "Jameis Winston has 7 touchdowns and 5 interceptions, so the Giants will hand Houston chances. Houston wins, and the Giants keep it inside double digits. Malik Nabers, with 494 receiving yards, is why."
    ]
  },
  "nfl:2026:2:DEN:ARI": {
    "headline": "Denver's defense keeps winning ugly. I'm not picking against ugly.",
    "body": [
      "The Broncos are 4-2 and their quarterback is the part everybody's worried about. Bo Nix has 1,049 yards, 6 touchdowns and 3 picks, and he threw for 107 yards in last week's 17-14 overtime win over Seattle. Denver won anyway, which is kind of the whole scouting report.",
      "Arizona is 2-4 and just snapped a four-game skid with an 18-16 win at the Rams, with Chad Ryland kicking six field goals. The Cardinals haven't won at home in nine straight games. Jacoby Brissett has 9 touchdowns and 6 interceptions, and Trey McBride leads them with 361 receiving yards.",
      "The Broncos win. Zach Allen has 4.5 sacks, Pat Surtain II is listed questionable, and six field goals is a great Sunday that nobody repeats on purpose."
    ]
  },
  "nfl:2026:2:GB:DET": {
    "headline": "The biggest shootout of the week, so of course I took the Packers receiver",
    "body": [
      "Detroit is 3-2 after a 45-21 win in Arizona. Green Bay is 4-2 and has won three straight, the last one 23-13 over Dallas.",
      "My call is already posted on [Chip's calls](https://poorformsports.com/calls): Christian Watson goes for 100 receiving yards. He has 538 yards and 6 touchdowns, and Detroit safeties Brian Branch and Kerby Joseph are both listed out. Josh Jacobs is expected to play his first game of the season, which helps a Packers run game that ranks last in rushing yards.",
      "None of that means I'm picking against Detroit. Jared Goff has 12 touchdowns and zero picks, and Jahmyr Gibbs has 7 rushing touchdowns. The Lions win a shootout and Watson gets his yards in the loss. Both can be true."
    ]
  },
  "nfl:2026:2:LAR:LV": {
    "headline": "The Rams are 2-4 and I still like them.",
    "body": [
      "Los Angeles is 2-4 after an 18-16 loss to Arizona.",
      "Las Vegas is 3-3 but has lost three straight, including 30-27 to Kansas City and 33-30 to Buffalo. Kirk Cousins has 14 touchdowns against 5 interceptions, and Brock Bowers leads them with 382 receiving yards.",
      "The Rams win. Matthew Stafford has 1,794 yards and Davante Adams has 480 receiving yards with Nacua in question. The '2-4 means they're cooked' crowd is grading the record, not the roster."
    ]
  },
  "nfl:2026:2:KC:SEA": {
    "headline": "Kansas City is 5-0 and playing at Seattle. Kenneth Walker would like a word.",
    "body": [
      "The Chiefs are undefeated, and Seattle is at home. The Seahawks are 3-3 and have lost two straight, 32-29 to San Francisco and 17-14 in overtime at Denver. Anyone picking Seattle is reading the stadium, not the standings.",
      "Kenneth Walker III now leads the league at 133 rushing yards per game for Kansas City, with 665 yards and 6 rushing touchdowns. Patrick Mahomes has 9 touchdowns and 3 interceptions. Rashee Rice is out.",
      "Seattle's best answer is Jaxon Smith-Njigba, who has 717 receiving yards and 7 touchdowns. Sam Darnold has 7 touchdowns and 7 interceptions, though, and that's the number I'm watching. Chiefs win and stay perfect."
    ]
  },
  "nfl:2026:2:DAL:PHI": {
    "headline": "Two 2-4 teams, one division nobody wants. Give me the team with a quarterback.",
    "body": [
      "Dallas and Philadelphia are both 2-4, and the NFC East is somehow still wide open. The Eagles have lost four straight, most recently 25-14 to Carolina. The Cowboys have dropped two in a row, 24-16 to Tampa Bay and 23-13 at Green Bay.",
      "Tanner McKee makes his second straight start for Philadelphia with Jalen Hurts on injured reserve. DeVonta Smith and Dontayvion Wicks are both out, and so is Nolan Smith. Saquon Barkley is questionable after missing two games. The Eagles ran for 22 and 35 yards in the two games he sat.",
      "Dak Prescott has 1,639 yards, 10 touchdowns and 5 interceptions, CeeDee Lamb has 577 receiving yards, and Javonte Williams has 7 rushing touchdowns. DeMarvion Overshown and Cobie Durant are back for the defense. The Cowboys win. The 'never doubt Philly at home' take is grading a roster that isn't suiting up tonight.",
      "My call tonight: CeeDee Lamb for 100+ receiving yards. [Track it on /calls](https://poorformsports.com/calls)."
    ]
  },
  // Week 8 Friday Chip previews — Sunday Nov 1 2026 noon CT (preview until Dillon OK)

  "nfl:2026:2:BAL:BUF": {
    headline: "Lamar is questionable again. I already got burned once.",
    body: [
      "Last week I took Baltimore because Derrick Henry didn't need Lamar Jackson's status settled. Cincinnati won 35-13 in Baltimore. Lamar is listed questionable again, and his numbers haven't moved: 967 yards, 6 touchdowns, 1 interception.",
      "Buffalo is 5-1 and has won two straight, 37-34 in overtime at the Rams and 33-30 at Las Vegas. Josh Allen has 1,504 yards and 9 touchdowns, and James Cook III has 627 rushing yards and 6 scores. Baltimore is 4-3 and has lost two straight. Roquan Smith and Kyle Hamilton are both listed questionable too.",
      "Buffalo is a 3-point favorite with a 54.5 total, and I'm taking the Bills. Henry has 579 yards and 7 touchdowns, so he'll get his. I'm just done paying for the same take twice.",
    ],
  },
  "nfl:2026:2:TEN:CIN": {
    headline: "Twelve and a half is a lot. Cincinnati earned every bit of it.",
    body: [
      "Cincinnati just went to Baltimore and won 35-13. Joe Burrow has 15 touchdown passes against 3 interceptions, and Tee Higgins has 571 receiving yards. The Bengals are 4-2.",
      "Tennessee is 1-6 and lost 27-24 to Cleveland last week. Cam Ward has 4 touchdowns and 5 interceptions. Tony Pollard, with 478 rushing yards, is the reliable part. Calvin Ridley, Carnell Tate and Tyjae Spears are all listed questionable, which thins out a group that was already thin.",
      "I'm taking Cincinnati to win and cover. Anyone holding onto 'the Titans are scrappy' should know that scrappy is 1-6.",
    ],
  },
  "nfl:2026:2:ARI:DAL": {
    headline: "Dallas found its offense in Philadelphia. Arizona can't keep up with it.",
    body: [
      "The Cowboys went into Philadelphia on Monday and won 38-21. Dak Prescott has 1,851 yards and 13 touchdowns, CeeDee Lamb has 651 receiving yards, and Javonte Williams has 8 rushing touchdowns. Dallas is 3-4 and gets a short week at home.",
      "Arizona is 2-5 and has lost four of its last five, most recently 30-16 to Denver. Jacoby Brissett has 10 touchdowns and 6 picks, and Trey McBride leads the team with 472 receiving yards. Jeremiyah Love, the leading rusher at 245 yards, is listed questionable.",
      "Dallas is a 7-point favorite and I'm taking the Cowboys. Quinnen Williams and Caleb Downs are listed questionable for Dallas, so Brissett gets a window. It isn't big enough.",
    ],
  },
  "nfl:2026:2:MIN:DET": {
    headline: "Minnesota is 6-0 and a road underdog. I'm still riding Gibbs.",
    body: [
      "The Vikings are 6-0, and they've won by scores of 9-3, 15-10 and 16-10. Kyler Murray has 812 passing yards and 3 touchdowns. Detroit is a 3-point favorite anyway, and I don't hate the line.",
      "The Lions are 4-2 and have won two straight, including 20-17 over Green Bay. Jared Goff has 14 touchdowns and no interceptions. Jahmyr Gibbs has 620 rushing yards and 7 touchdowns, which is about 103 a game, and Aaron Jones Sr. is listed questionable on the other side. Kerby Joseph is out for Detroit.",
      "My call is on the record: Gibbs goes for 100-plus rushing yards, and it's on the board at [poorformsports.com/calls](https://poorformsports.com/calls). Dallas Turner has 6 sacks and will make Goff move. I'm taking Detroit to hand Minnesota its first loss, mostly by handing it to Gibbs.",
    ],
  },
  "nfl:2026:2:LV:NYJ": {
    headline: "I took the Jets last week. Miami took the Jets too.",
    body: [
      "Last Sunday I picked the Jets over a winless Miami team. Miami won 28-25. New York is 2-5 and has lost two straight, and the market is still making them a 1.5-point favorite.",
      "Las Vegas is 3-4 but has lost four straight, the last one 35-21 to the Rams. Kirk Cousins has 16 touchdown passes, the most of anyone in this game, and Tre Tucker has 474 receiving yards. Geno Smith has 10 touchdowns and 2 picks, with Garrett Wilson at 444 yards.",
      "The Jets have Breece Hall and David Bailey listed questionable and two defensive linemen listed doubtful. I'm taking Las Vegas. A losing streak is bad. Trusting the Jets twice in a row is worse.",
    ],
  },
  "nfl:2026:2:CLE:PIT": {
    headline: "Cleveland already beat Pittsburgh once. The line forgot.",
    body: [
      "Both teams are 5-2. Cleveland beat the Steelers 27-24 earlier this season and just won 27-24 again, at Tennessee. Pittsburgh is a 3.5-point favorite at home anyway.",
      "The Steelers are coming off a 16-10 win over New Orleans in Paris. Jaylen Warren has 561 rushing yards, Aaron Rodgers has 13 touchdowns and 5 picks, and T.J. Watt has 5.5 sacks. Alex Highsmith is listed questionable. Deshaun Watson has 7 touchdowns and only 3 interceptions, and Mason Graham has 4 sacks.",
      "The total is 39.5, the lowest of the noon games, and that's the Browns' kind of afternoon. I'm taking Cleveland to make it two.",
    ],
  },
  "nfl:2026:2:ATL:TB": {
    headline: "Both of these teams beat me last week. One of them has to lose now.",
    body: [
      "Last Sunday I took 6-0 San Francisco at Atlanta. The Falcons won 29-20. I also took Carolina over Tampa Bay, and the Bucs won 43-13. So I'm going to be careful with my words.",
      "Atlanta is 3-4 and Bijan Robinson has 704 rushing yards, the most of anyone on the noon slate. Michael Penix Jr. has 9 touchdowns and 1 interception, and Drake London has 616 receiving yards. Tampa Bay is 2-5, and Baker Mayfield has played enough to throw for 679 yards and 3 touchdowns. Emeka Egbuka is listed questionable again.",
      "Tampa Bay is a 2.5-point home favorite. I'm taking Atlanta, because Bijan is the best player on the field and I'm out of reasons to keep picking against him.",
    ],
  },
  "nfl:2026:2:IND:JAX": {
    headline: "Daniel Jones has more picks than touchdowns. The line is 10 for a reason.",
    body: [
      "Indianapolis is 2-5 and has lost three straight, most recently 16-10 at Minnesota. Daniel Jones has 4 touchdown passes and 7 interceptions. Jonathan Taylor has 587 rushing yards and 8 touchdowns, and he's doing almost all of it alone.",
      "Jacksonville is 4-2 and lost a 34-31 shootout to Houston last week. Trevor Lawrence has 14 touchdowns against 4 interceptions, and Parker Washington leads the team with 416 receiving yards. Jakobi Meyers is listed questionable.",
      "Jacksonville is a 10-point favorite and I'm taking the Jaguars. Taylor will get his touchdown. The rest of the offense would need to show up for this to stay close.",
    ],
  },

  // Week 8 Saturday Chip previews — Sun Nov 1 afternoon + SNF (preview until Dillon OK)
  "nfl:2026:2:LAC:LAR": {
    headline: "The Chargers had a bye to fix 0-6. The Rams don't care what they fixed.",
    body: [
      "The Chargers are the league's only winless team and its lowest-scoring one. Justin Herbert has 5 touchdowns, 8 interceptions and 21 sacks taken, and Omarion Hampton leads the team with 289 rushing yards. They lost Derwin James Jr. for this one too.",
      "The Rams are 3-4 and just beat Las Vegas 35-21, with Kyren Williams and Blake Corum both running for more than 90 yards. Matthew Stafford leads the NFL with 1,989 passing yards, and Puka Nacua has at least five catches in 15 straight games.",
      "The Rams are 6.5-point favorites and I'm taking them, same as last week. A bye week of self-examination is nice. Stafford's yardage is nicer.",
    ],
  },
  "nfl:2026:2:KC:DEN": {
    headline: "I picked Kansas City to stay perfect. Seattle held them to 3.",
    body: [
      "Last Sunday I took the Chiefs at Seattle. They lost 20-3, and Patrick Mahomes has now gone consecutive games without a touchdown pass for the first time in his career. Kansas City is still 5-1 and somehow a 1.5-point favorite in Denver.",
      "Denver is 5-2 and has won four of five, most recently 30-16 at Arizona with a 62-yard Bo Nix touchdown run. Nix has 7 touchdowns and 3 picks, and the defense led by Zach Allen and Nik Bonitto is doing the heavy lifting. Allen and Jaylen Waddle are both listed questionable.",
      "Kenneth Walker III has 701 rushing yards and Travis Kelce is averaging a career-best 14.3 yards per catch at 37. The total is 40.5. I'm taking Denver, because I already paid for trusting Kansas City's offense once this month.",
    ],
  },
  "nfl:2026:2:NE:MIA": {
    headline: "Miami finally won one. New England is still a touchdown better.",
    body: [
      "The Dolphins are 1-5 and coming off their first win, 28-25 over the Jets. Malik Willis threw for 208 yards and two scores and ran for another. Miami has rushed for 100-plus yards in five straight games, and Ollie Gordon II has a rushing touchdown in each of the last four.",
      "New England is 4-3 after a 30-24 loss in Chicago. Drake Maye has 13 touchdowns and 8 interceptions, Hunter Henry leads them with 296 receiving yards, and Elijah Ponder has 5.5 sacks. A.J. Brown and TreVeyon Henderson are listed questionable.",
      "Willis gets his old Tennessee coach, Mike Vrabel, on the other sideline. That's a nice story. The Patriots are 7-point favorites, and I'm taking New England to win and cover.",
    ],
  },
  "nfl:2026:2:PHI:WSH": {
    headline: "Sunday night gets 2-5 against 1-4-1. Somebody has to win it.",
    body: [
      "Philadelphia has lost five straight, the last one 38-21 to Dallas. Jalen Hurts is out, likely for the season, and Tanner McKee has 426 yards, 2 touchdowns and 1 interception in two starts. DeVonta Smith, the team's leading receiver at 310 yards, is out too.",
      "Washington is 1-4-1 and coming off a bye. Terry McLaurin is on injured reserve for the season and so is Jacory Croskey-Merritt, the leading rusher. Jayden Daniels is a full participant and averaging 8.5 yards per carry, the best in the league.",
      "Washington is a 6-point favorite and the Eagles are 1-6 against the spread. I'm taking the Commanders. The loser of this game is in last place, and Philadelphia keeps volunteering for it.",
    ],
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