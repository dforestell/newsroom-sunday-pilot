import type { FeedEntry } from "@/lib/types";

export const DEMO_GAME_ID = "demo-dal-nyg-snf";

export const DEMO_BANNER =
  "NYG 28 DAL 20 · SNF MetLife · Harbaugh debut · not live · ESPN/CBS/NBC/Giants.com";

export const dalNygSnfDemoEntries: FeedEntry[] = [
  {
    id: "demo-dal-nyg-skattebo-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Skattebo 3-yard TD — NYG 7–0",
    body: "Giants 10-83, 8:20; Cam Skattebo 3-yd rush TD (Zvada XP). NYG 7–0. First points of Harbaugh NY era.",
    postedAtLabel: "Q1 6:40",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Ten plays, eighty-three yards, first points of the Harbaugh New York era. Cowboys fans: you can stop waiting for the unpacking bit.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-lamb-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Lamb 1-yard TD — 7–7",
    body: "Williams ruled in then replay reverses; Prescott→Lamb 1-yd TD (Aubrey XP). 7–7.",
    postedAtLabel: "Q2 5:44",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "wes-process",
        voiceName: "Wes",
        line: "Conversion Referendum: ruled in, reversed, next snap it’s a touchdown anyway. The booth called almost. The ballot called next play.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-holland-int",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Holland intercepts Prescott",
    body: "3rd-and-5; Prescott deep right INT by Jevón Holland at NYG 45.",
    postedAtLabel: "Q2 ~0:58",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "wes-process",
        voiceName: "Wes",
        line: "Conversion Referendum: third-and-five, deep ball, Holland slides under it. Dallas just donated the half.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-likely-td1",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Likely 15-yard TD — NYG 14–7 HT",
    body: "Dart→Isaiah Likely 15-yd TD (Zvada XP). NYG 14–7 HT. Likely’s first TD as a Giant.",
    postedAtLabel: "Q2 0:20",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Followed the coach up I-95 and scored before halftime. Text your Ravens friend who said the MetroCard wouldn’t warm up.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-likely-td2",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Likely 2-yard TD after 8:01 grind — NYG 21–7",
    body: "12-74, 8:01; Dart→Likely 2-yd TD. NYG 21–7. Likely 8/8, 78, 2 TD.",
    postedAtLabel: "Q3 6:59",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "postcard-pete",
        voiceName: "Postcard Pete",
        line: "Notarized Postcard: eight targets, eight catches, two touchdowns. Stamped. That’s a perfect night, and Pete doesn’t say that often.",
      },
      {
        voiceId: "wes-process",
        voiceName: "Wes",
        line: "Conversion Referendum: eight minutes, seventy-four yards, possession that never gave it back. Harbaugh packed the ballot.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-williams-rush-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Williams 1-yard rush TD — NYG 21–14",
    body: "Dallas 12-75, 6:22; Javonte Williams 1-yd rush TD (Aubrey XP). NYG 21–14.",
    postedAtLabel: "Q3 0:37",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Twelve plays later Dallas is within one. Fine. Giants fans: mute the Cowboys cousin for one more quarter.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-singletary-td",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Singletary 9-yard TD after 8:11 drive — NYG 28–14",
    body: "13-play ~65-yard, 8:11; Dart→Singletary 9-yd TD. NYG 28–14. Dart 3 TD, 0 INT.",
    postedAtLabel: "Q4 7:26",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "chip-absolute",
        voiceName: "Chip Absolute",
        line: "Three touchdowns. Zero picks. Your Giants friend has already made September unbearable.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-xp-miss",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Williams 17-yard TD; Aubrey XP wide right — NYG 28–20",
    body: "Prescott→Williams 17-yd TD; taunting; Aubrey XP wide right. NYG 28–20.",
    postedAtLabel: "Q4 5:21",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "wes-process",
        voiceName: "Wes",
        line: "Conversion Referendum: score it, talk about it, kick slides right, stay down eight. Self-inflicted math.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-final-possession",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "Giants never give it back — final 5:21",
    body: "NYG converts 3rd, kneels three times. Dallas never gets the ball back. TOP 36:40 / 29 first downs.",
    postedAtLabel: "Q4 5:21→0:00",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "wes-process",
        voiceName: "Wes",
        line: "Conversion Referendum: final five-twenty-one, zero Cowboys snaps. Clock was the protagonist.",
      },
    ],
  },
  {
    id: "demo-dal-nyg-final",
    gameId: DEMO_GAME_ID,
    kind: "fact",
    authorId: null,
    headline: "FINAL — Giants 28, Cowboys 20",
    body: "NYG 28–DAL 20. Dart 23/29, 230, 3 TD, 0 INT. Harbaugh NY debut W.",
    postedAtLabel: "FINAL",
    path: "public-live",
    demo: true,
    satire: [
      {
        voiceId: "poor-form-desk",
        voiceName: "Poor Form Desk",
        line: "Chip already made September unbearable for somebody’s Giants friend. Final: twenty-eight to twenty.",
      },
    ],
  },
];
