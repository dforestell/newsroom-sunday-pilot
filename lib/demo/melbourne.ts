import type { FeedEntry } from "@/lib/types";

export const DEMO_GAME_ID = "sunday-pilot";

export const DEMO_BANNER =
  "SF 27 LAR 7 · Melbourne MCG · not live · ESPN/Reuters/Rams.com/NFL gamebook";

export const melbourneDemoEntries: FeedEntry[] = [
  {
    id: "demo-q1-pineiro-20",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Pineiro 20-yard FG — SF 3–0",
    body: "After LAR punt, SF 15-play ~65-yd → Pineiro 20 FG. SF 3–0.",
    postedAtLabel: "Q1 6:15",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Fifteen plays. Three points. Screenshot this for the Rams friend who thought the drive was about to become a touchdown.",
      },
      {
        voiceId: "wes-process",
        voiceName: "Wes",
        line: "Conversion Referendum: fifteen plays, three points, first regular-season points in Australia. The ballot showed up. Drama did not.",
      },
    ],
  },
  {
    id: "demo-q2-kyren-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Kyren Williams 5-yard TD — LAR 7–3",
    body: "Stafford→Nacua 41; Kyren Williams 5-yd TD. LAR 7–3. First NFL TD on Australian soil.",
    postedAtLabel: "Q2 14:57",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "First NFL touchdown on Australian soil and it’s Kyren Williams. Rams group chat: wake up the continent.",
      },
      {
        voiceId: "postcard-pete",
        voiceName: "Postcard Pete",
        line: "Notarized Postcard: first NFL touchdown in Australia. That one gets stamped. It’s history, and Kyren gets to keep it.",
      },
    ],
  },
  {
    id: "demo-q2-lake-int",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Quentin Lake intercepts Purdy",
    body: "Quentin Lake INT of Purdy (intended Kittle).",
    postedAtLabel: "Q2 ~12:04",
    path: "public-live",
    demo: true,
  },
  {
    id: "demo-q2-green-int",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Renardo Green intercepts Stafford",
    body: "Renardo Green INT of Stafford deep to Nacua.",
    postedAtLabel: "Q2 ~8:52",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Two picks, same quarter. Forward this to whoever still trusts deep shots tonight.",
      },
    ],
  },
  {
    id: "demo-q2-robinson-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Robinson 39-yard TD — SF 10–7 HT",
    body: "Purdy→Demarcus Robinson (ex-Ram) 39-yd TD. SF 10–7 HT.",
    postedAtLabel: "Q2 4:28",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Ex-Ram Demarcus Robinson just scored on the Rams in Melbourne. Screenshot for every Rams group chat that still had him in the family.",
      },
    ],
  },
  {
    id: "demo-ht-travel",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Travel and the MCG crowd",
    body: "SF in Melbourne ~1 week; Rams day-before; crowd booed Rams / cheered 49ers.",
    postedAtLabel: "HT travel",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "layover-len",
        voiceName: "Layover Len",
        line: "One team packed a week early. The other packed a carry-on. That is a matchup.",
      },
      {
        voiceId: "boo-atlas",
        voiceName: "Boo Atlas",
        line: "The building booed one jersey and adopted the other. Neutral site? The throats voted no.",
      },
    ],
  },
  {
    id: "demo-q3-evans-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Evans first TD as a 49er — SF 17–7",
    body: "Deebo KR ~45–46; Purdy→Mike Evans 2-yd TD (first as 49er). SF 17–7.",
    postedAtLabel: "Q3 11:03",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Evans’ first as a 49er and Melbourne is celebrating like it drafted him. Niners fans: send this with a straight face.",
      },
    ],
  },
  {
    id: "demo-late-q3-stuffed",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Stafford sneak stuffed — turnover on downs",
    body: "Nacua inches short; 4th-and-goal SF 1 Stafford sneak stuffed (TOD).",
    postedAtLabel: "Late Q3",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "wes-process",
        voiceName: "Wes",
        line: "Conversion Referendum: fourth-and-goal from the one, sneak stuffed, turnover on downs. Not unlucky — a call with a bruise.",
      },
    ],
  },
  {
    id: "demo-q4-deebo-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Deebo 15-yard TD after 99-yard drive — SF 24–7",
    body: "99-yd drive; Purdy→Deebo 15-yd TD. SF 24–7.",
    postedAtLabel: "Q4 12:57",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "You stuff them at the one, then they go ninety-nine. Send this to the Rams fan who celebrated the stop.",
      },
    ],
  },
  {
    id: "demo-q4-pineiro-56",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Pineiro 56-yard FG — SF 27–7",
    body: "Pineiro 56 FG. SF 27–7.",
    postedAtLabel: "Q4 9:43",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "postcard-pete",
        voiceName: "Postcard Pete",
        line: "Fifty-six yards in Melbourne. Great kick. One game doesn’t make a dynasty.",
      },
      {
        voiceId: "poor-form-desk",
        voiceName: "Poor Form Desk",
        line: "Chip already made the Rams group chats unlivable. We’re just logging the score.",
      },
    ],
  },
];
