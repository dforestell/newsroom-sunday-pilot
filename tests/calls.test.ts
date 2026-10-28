import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CallsFeature } from "../components/calls-record.tsx";
import { CallsList } from "../components/calls-list.tsx";
import { getCallRecord, type Call } from "../lib/calls.ts";
import { CallFilingError, parseCall, tallyCalls } from "../lib/calls/content.ts";
import { loadCalls } from "../lib/calls/files.ts";

const valid = {
  date: "2026-10-05",
  sport: "NFL",
  game: "ATL at NO",
  window: "MNF",
  take: "Atlanta should give Bijan Robinson 25 carries.",
  kind: "argument",
  postUrl: "https://x.com/ChipAbsolute/status/2107229099995353571",
  result: "Falcons won 45–24. Bijan had 19 carries for 145 yards and 2 TDs (7.6 a carry).",
  status: "still-arguing",
  note: "Atlanta won without giving him 25.",
};

function callFile(overrides: Record<string, unknown> = {}) {
  return `${JSON.stringify({ ...valid, ...overrides }, null, 2)}\n`;
}

function withFiles(files: Record<string, string>, check: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), "pfs-call-test-"));
  try {
    for (const [name, body] of Object.entries(files)) writeFileSync(join(directory, name), body);
    check(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("newest dates sort first and a later post wins a same-day tie", () => {
  // Filenames run opposite the expected shelf so directory order cannot satisfy the assertion.
  withFiles(
    {
      "2026-09-01-older.json": callFile({
        date: "2026-09-01",
        take: "Older take.",
        postUrl: "https://x.com/ChipAbsolute/status/100",
        status: "missed",
      }),
      "2026-10-01-alpha.json": callFile({
        date: "2026-10-01",
        take: "Earlier same-day take.",
        postUrl: "https://x.com/ChipAbsolute/status/200",
        window: undefined,
      }),
      "2026-10-01-zeta.json": callFile({
        date: "2026-10-01",
        take: "Later same-day take.",
        postUrl: "https://x.com/ChipAbsolute/status/300",
        status: "held-up",
      }),
    },
    (directory) => {
      const calls = loadCalls(directory);
      assert.deepEqual(
        calls.map((call) => call.take),
        ["Later same-day take.", "Earlier same-day take.", "Older take."],
      );
      assert.deepEqual(tallyCalls(calls), { "held-up": 1, missed: 1, "still-arguing": 1, pending: 0, ungraded: 0 });
      const html = renderToStaticMarkup(createElement(CallsList, { calls }));
      assert.match(html, /bg-live-green[\s\S]*Held up/);
      assert.match(html, /bg-warn[\s\S]*Missed/);
      assert.match(html, /bg-satire[\s\S]*Still arguing/);
    },
  );
});

test("both seed entries render with their posts, results and status", () => {
  const calls = loadCalls();
  const bijan = calls.find((call) => call.postUrl.endsWith("/2107229099995353571"));
  const goff = calls.find((call) => call.postUrl.endsWith("/2106965618805412204"));
  assert.ok(bijan);
  assert.ok(goff);
  assert.ok(calls.indexOf(bijan) < calls.indexOf(goff));
  assert.equal(bijan.date, "2026-10-05");
  assert.equal(bijan.game, "ATL at NO");
  assert.equal(bijan.window, "MNF");
  assert.equal(bijan.take, "Atlanta should give Bijan Robinson 25 carries.");
  assert.equal(bijan.result, "Falcons won 45–24. Bijan had 19 carries for 145 yards and 2 TDs (7.6 a carry).");
  assert.equal(bijan.status, "still-arguing");
  assert.equal(bijan.note, "Atlanta won without giving him 25.");
  assert.equal(bijan.dateLabel, "Oct 5, 2026");
  assert.equal(goff.date, "2026-10-04");
  assert.equal(goff.game, "DET at CAR");
  assert.equal(goff.window, undefined);
  assert.equal(goff.take, "Bryce Young over Jared Goff.");
  assert.equal(goff.result, "Carolina won 32–26. Goff threw for 412 yards in the loss.");
  assert.equal(goff.status, "ungraded");
  assert.equal(goff.criterion, "Argument: Bryce Young outplays Jared Goff in this game.");
  assert.equal(goff.note, undefined);
  assert.equal(goff.dateLabel, "Oct 4, 2026");

  const html = renderToStaticMarkup(createElement(CallsList, { calls }));
  assert.match(html, /Chip’s calls/);
  assert.match(html, /His takes, and how each one held up\./);
  assert.match(html, /href="\/cast\/chip-absolute"/);
  assert.match(html, /Atlanta should give Bijan Robinson 25 carries\./);
  assert.match(html, /Bryce Young over Jared Goff\./);
  assert.match(html, /ATL at NO/);
  assert.match(html, /DET at CAR/);
  assert.match(html, /Oct 5, 2026<\/time> · MNF/);
  assert.match(html, /Falcons won 45–24\. Bijan had 19 carries for 145 yards and 2 TDs \(7\.6 a carry\)\./);
  assert.match(html, /Carolina won 32–26\. Goff threw for 412 yards in the loss\./);
  assert.match(html, /Atlanta won without giving him 25\./);
  assert.match(html, /href="https:\/\/x\.com\/ChipAbsolute\/status\/2107229099995353571"/);
  assert.match(html, /href="https:\/\/x\.com\/ChipAbsolute\/status\/2106965618805412204"/);
  assert.match(html, /Held up/);
  assert.match(html, /Missed/);
  assert.match(html, /Still arguing/);
  assert.match(html, /Pending/);
  assert.match(html, /Ungraded/);
  assert.match(html, /Posted after the final, not counted\./);
  assert.match(html, /border border-ink-soft bg-transparent text-ink-soft/);
  assert.match(html, /Chip’s record/);
  // Live record state changes as calls are filed and graded; assert against computed values, not today's data.
  const liveRecord = getCallRecord(calls);
  const escapeRe = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(html, new RegExp(escapeRe(liveRecord.streak.label)));
  if (liveRecord.next) assert.match(html, new RegExp(escapeRe(liveRecord.next.take)));
  else assert.match(html, /Next call drops soon\./);
  assert.match(html, /Latest call/);
  assert.match(html, /bg-live-green/);
  assert.match(html, /bg-satire/);
  const tally = tallyCalls(calls);
  assert.match(html, new RegExp(`>${tally["held-up"]}<`));
  assert.match(html, new RegExp(`>${tally.missed}<`));
  assert.match(html, new RegExp(`>${tally["still-arguing"]}<`));
});

for (const [name, source, field, correction] of [
  ["bad-date", callFile({ date: "2026-02-30" }).replaceAll("2026-10-05", "2026-02-30"), "date", "real calendar date"],
  ["bad-status", callFile({ status: "won" }), "status", "held-up"],
  ["other-account", callFile({ postUrl: "https://x.com/PoorFormSports/status/2107229099995353571" }), "postUrl", "ChipAbsolute"],
  ["other-host", callFile({ postUrl: "https://twitter.com/ChipAbsolute/status/2107229099995353571" }), "postUrl", "x.com/ChipAbsolute"],
  ["empty-take", callFile({ take: "   " }), "take", "one-line take"],
  ["empty-result", callFile({ result: "" }), "result", "verified result"],
] as const) {
  test(`filing error names ${name}`, () => {
    const filename = name === "bad-date" ? "2026-02-30-bad-date.json" : "2026-10-05-bad.json";
    assert.throws(
      () => parseCall(filename, source),
      (error: unknown) =>
        error instanceof CallFilingError &&
        error.message.includes(`${filename} — ${field}:`) &&
        error.message.includes(correction),
    );
  });
}

test("filename date must match the date field", () => {
  assert.throws(
    () => parseCall("2026-10-04-mismatch.json", callFile()),
    /2026-10-04-mismatch\.json — filename:.*starts with 2026-10-05/,
  );
});

test("unknown field names the file and the field", () => {
  assert.throws(
    () => parseCall("2026-10-05-extra.json", callFile({ extra: "nope" })),
    /2026-10-05-extra\.json — extra:/,
  );
});

test("duplicate postUrl names both files and the required correction", () => {
  const body = callFile();
  withFiles(
    {
      "2026-10-05-alpha.json": body,
      "2026-10-05-beta.json": body,
    },
    (directory) => {
      assert.throws(
        () => loadCalls(directory),
        /2026-10-05-beta\.json — postUrl:.*2026-10-05-alpha\.json.*Each post can be filed once/,
      );
    },
  );
});

function filed(overrides: Partial<Call> & Pick<Call, "date" | "status" | "postUrl">): Call {
  return {
    sport: "NFL",
    game: "ATL at NO",
    take: "A take.",
    kind: overrides.status === "still-arguing" ? "argument" : "forecast",
    result: "A result.",
    dateLabel: overrides.date,
    ...overrides,
  };
}

test("call record is empty when nothing is filed", () => {
  const record = getCallRecord([]);
  assert.deepEqual(record.tally, { hits: 0, misses: 0, stillArguing: 0, pending: 0 });
  assert.deepEqual(record.streak, { kind: "none", label: "No streak yet" });
  assert.equal(record.latest, null);
  assert.equal(record.next, null);
});

test("call record counts still-arguing and pending separately and does not invent a streak", () => {
  const pending = filed({
    date: "2026-10-03",
    status: "still-arguing",
    postUrl: "https://x.com/ChipAbsolute/status/3",
  });
  const ungraded = filed({
    date: "2026-10-02",
    status: "open" as Call["status"],
    postUrl: "https://x.com/ChipAbsolute/status/2",
  });
  const record = getCallRecord([ungraded, pending]);
  assert.deepEqual(record.tally, { hits: 0, misses: 0, stillArguing: 1, pending: 0 });
  assert.deepEqual(record.streak, { kind: "none", label: "No streak yet" });
  assert.equal(record.latest, pending);
  assert.equal(record.next, null);
});

test("one graded call is not a streak, and a hot run needs two held-up results", () => {
  const hit = (date: string, id: string) =>
    filed({ date, status: "held-up", postUrl: `https://x.com/ChipAbsolute/status/${id}`, take: id });
  const alone = getCallRecord([hit("2026-10-01", "1")]);
  assert.equal(alone.tally.hits, 1);
  assert.deepEqual(alone.streak, { kind: "none", label: "No streak yet" });

  const hot = getCallRecord([
    hit("2026-09-01", "1"),
    filed({ date: "2026-09-15", status: "missed", postUrl: "https://x.com/ChipAbsolute/status/9", take: "old miss" }),
    hit("2026-10-02", "3"),
    hit("2026-10-01", "2"),
  ]);
  assert.deepEqual(hot.tally, { hits: 3, misses: 1, stillArguing: 0, pending: 0 });
  assert.deepEqual(hot.streak, { kind: "hot", count: 2, label: "Hot: 2 straight held up" });
  assert.equal(hot.latest?.take, "3");
});

test("cold streak counts consecutive misses and stops when the run breaks", () => {
  const cold = getCallRecord([
    filed({ date: "2026-10-03", status: "missed", postUrl: "https://x.com/ChipAbsolute/status/3" }),
    filed({ date: "2026-10-02", status: "missed", postUrl: "https://x.com/ChipAbsolute/status/2" }),
    filed({ date: "2026-10-01", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/1" }),
  ]);
  assert.deepEqual(cold.streak, { kind: "cold", count: 2, label: "Cold: 2 straight missed" });

  const broken = getCallRecord([
    filed({ date: "2026-10-03", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/3" }),
    filed({ date: "2026-10-02", status: "missed", postUrl: "https://x.com/ChipAbsolute/status/2" }),
    filed({ date: "2026-10-01", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/1" }),
  ]);
  assert.deepEqual(broken.streak, { kind: "none", label: "No streak yet" });
  assert.equal(broken.tally.hits, 2);
  assert.equal(broken.tally.misses, 1);
});

test("ungraded calls are skipped in the streak, and a pre-game call is next rather than latest", () => {
  const pregame = filed({
    date: "2026-10-06",
    status: "pending",
    postUrl: "https://x.com/ChipAbsolute/status/6",
    take: "Before the game.",
    game: "BUF at KC",
    result: undefined,
  });
  const arguing = filed({
    date: "2026-10-05",
    status: "still-arguing",
    postUrl: "https://x.com/ChipAbsolute/status/5",
    take: "Still open.",
    game: "ATL at NO",
    window: "MNF",
  });
  const olderPregame = filed({
    date: "2026-10-02",
    status: "pending",
    postUrl: "https://x.com/ChipAbsolute/status/2",
    take: "Older pregame.",
    result: undefined,
  });
  const hits = [
    filed({ date: "2026-10-04", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/4", take: "Newer hit." }),
    filed({ date: "2026-10-01", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/1", take: "Older hit." }),
  ];
  const calls = [hits[1], olderPregame, arguing, pregame, hits[0]];
  const record = getCallRecord(calls);
  assert.deepEqual(record.tally, { hits: 2, misses: 0, stillArguing: 1, pending: 2 });
  assert.deepEqual(record.streak, { kind: "hot", count: 2, label: "Hot: 2 straight held up" });
  assert.equal(record.next, pregame);
  assert.equal(record.latest, arguing);

  const html = renderToStaticMarkup(createElement(CallsList, { calls }));
  assert.match(html, /Hot: 2 straight held up/);
  assert.match(html, /Next call[\s\S]*Before the game\./);
  assert.match(html, /Latest call[\s\S]*Still open\./);
  assert.match(html, /border-border bg-transparent[\s\S]*Pending/);
  assert.ok(html.indexOf("Next call") < html.indexOf("Latest call"));
  assert.ok(html.indexOf("Before the game.") < html.indexOf("Latest call"));
});

test("next call is empty when nothing is status pending", () => {
  const calls = [
    filed({ date: "2026-10-05", status: "still-arguing", postUrl: "https://x.com/ChipAbsolute/status/5", take: "Still open." }),
    filed({ date: "2026-10-04", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/4", take: "A hit." }),
  ];
  const record = getCallRecord(calls);
  assert.equal(record.next, null);
  assert.equal(record.latest?.take, "Still open.");
  const html = renderToStaticMarkup(createElement(CallsList, { calls }));
  assert.match(html, /Next call drops soon\./);
  assert.equal(html.includes("Before the game."), false);
  const feature = renderToStaticMarkup(createElement(CallsFeature, { calls: [] }));
  assert.match(feature, /Next call drops soon\./);
  assert.match(feature, /href="\/calls"/);
  assert.match(feature, /No streak yet/);
  assert.equal(/Latest call/.test(feature), false);
});

test("homepage feature shows the pending call and does not invent one", () => {
  const pending = filed({
    date: "2026-10-12",
    status: "pending",
    postUrl: "https://x.com/ChipAbsolute/status/12",
    take: "Before the whistle.",
    game: "BUF at KC",
    window: "SNF",
    result: undefined,
  });
  const html = renderToStaticMarkup(createElement(CallsFeature, {
    calls: [
      filed({ date: "2026-10-04", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/4", take: "Older hit." }),
      pending,
    ],
  }));
  assert.match(html, /Before the whistle\./);
  assert.match(html, /BUF at KC/);
  assert.match(html, /dateTime="2026-10-12">2026-10-12<\/time> · SNF/);
  assert.match(html, /href="https:\/\/x\.com\/ChipAbsolute\/status\/12"/);
  assert.match(html, /href="\/calls"/);
  assert.equal(/Latest call/.test(html), false);
  assert.equal(/Next call drops soon\./.test(html), false);
});

test("same-day later pending post is the next call, not the latest", () => {
  const earlier = filed({
    date: "2026-10-01",
    status: "held-up",
    postUrl: "https://x.com/ChipAbsolute/status/100",
    take: "Earlier same-day take.",
  });
  const later = filed({
    date: "2026-10-01",
    status: "pending",
    postUrl: "https://x.com/ChipAbsolute/status/300",
    take: "Later same-day take.",
    result: undefined,
  });
  const record = getCallRecord([earlier, later]);
  assert.equal(record.next?.take, "Later same-day take.");
  assert.equal(record.latest?.take, "Earlier same-day take.");
  assert.deepEqual(record.streak, { kind: "none", label: "No streak yet" });
  assert.deepEqual(record.tally, { hits: 1, misses: 0, stillArguing: 0, pending: 1 });
});

test("current shelf shape stays neutral: one hit and one still-arguing call", () => {
  const record = getCallRecord([
    filed({
      date: "2026-10-05",
      status: "still-arguing",
      postUrl: "https://x.com/ChipAbsolute/status/2107229099995353571",
      take: "Atlanta should give Bijan Robinson 25 carries.",
    }),
    filed({
      date: "2026-10-04",
      status: "held-up",
      postUrl: "https://x.com/ChipAbsolute/status/2106965618805412204",
      take: "Bryce Young over Jared Goff.",
    }),
  ]);
  assert.deepEqual(record.tally, { hits: 1, misses: 0, stillArguing: 1, pending: 0 });
  assert.deepEqual(record.streak, { kind: "none", label: "No streak yet" });
  assert.equal(record.latest?.take, "Atlanta should give Bijan Robinson 25 carries.");
  assert.equal(record.next, null);
});

test("pending call may omit result, and graded statuses may not", () => {
  const { result, ...withoutResult } = valid;
  assert.equal(typeof result, "string");
  const pending = parseCall(
    "2026-10-05-pending.json",
    `${JSON.stringify({ ...withoutResult, kind: "forecast", status: "pending", postUrl: "https://x.com/ChipAbsolute/status/9" }, null, 2)}\n`,
  );
  assert.equal(pending.status, "pending");
  assert.equal(pending.result, undefined);
  assert.equal(pending.take, valid.take);

  const withResult = parseCall(
    "2026-10-05-pending.json",
    callFile({ kind: "forecast", status: "pending", postUrl: "https://x.com/ChipAbsolute/status/9" }),
  );
  assert.equal(withResult.result, valid.result);

  for (const status of ["held-up", "missed", "still-arguing"] as const) {
    assert.throws(
      () => parseCall("2026-10-05-graded.json", `${JSON.stringify({ ...withoutResult, status })}\n`),
      new RegExp(`2026-10-05-graded\\.json — result:.*verified result`),
    );
  }
});

test("check:calls accepts a pending file with no result", () => {
  const { result, ...withoutResult } = valid;
  assert.ok(result);
  withFiles(
    {
      "2026-10-05-pending.json": `${JSON.stringify({ ...withoutResult, kind: "forecast", status: "pending", postUrl: "https://x.com/ChipAbsolute/status/9" }, null, 2)}\n`,
    },
    (directory) => {
      const calls = loadCalls(directory);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].status, "pending");
      assert.equal(calls[0].result, undefined);
      const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-calls.ts", directory], {
        cwd: resolve("."),
        encoding: "utf8",
      });
      assert.equal(result.status, 0, result.stderr);
    },
  );
});

test("CI command fails clearly on a bad post URL", () => {
  withFiles(
    { "2026-10-05-bad.json": callFile({ postUrl: "https://example.com/not-a-post" }) },
    (directory) => {
      const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-calls.ts", directory], {
        cwd: resolve("."),
        encoding: "utf8",
      });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /2026-10-05-bad\.json — postUrl:/);
      assert.match(result.stderr, /ChipAbsolute/);
    },
  );
});

test("record tally shows still-arguing separately from pending", () => {
  const calls = [
    filed({ date: "2026-10-05", status: "still-arguing", postUrl: "https://x.com/ChipAbsolute/status/5", take: "Still open." }),
    filed({ date: "2026-10-04", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/4", take: "A hit." }),
  ];
  const html = renderToStaticMarkup(createElement(CallsList, { calls }));
  const start = html.indexOf("Chip’s record: ");
  assert.ok(start >= 0, "one-line record renders");
  const line = html.slice(start, html.indexOf("</p>", start));
  assert.match(line, /Record <span>1<\/span>–<span>0<\/span>/);
  assert.match(line, /<span>1<\/span> Still arguing/);
  assert.match(line, /<span>0<\/span> Pending/);
});

test("every filed call carries the kind from the grading rule", () => {
  const kinds = Object.fromEntries(loadCalls().map((call) => [call.take, call.kind]));
  assert.equal(kinds["Bryce Young over Jared Goff."], "argument");
  assert.equal(kinds["Atlanta should give Bijan Robinson 25 carries."], "argument");
  for (const call of loadCalls().filter((c) => c.date >= "2026-10-08" && c.date <= "2026-10-12")) {
    assert.equal(call.kind, "forecast", call.take);
  }
});

test("kind is required and must match the status rules", () => {
  const { kind, ...withoutKind } = valid;
  assert.equal(kind, "argument");
  assert.throws(() => parseCall("2026-10-05-x.json", `${JSON.stringify(withoutKind)}\n`), /2026-10-05-x\.json — kind:.*forecast/);
  assert.throws(() => parseCall("2026-10-05-x.json", callFile({ kind: "prescription" })), /— kind:/);
  assert.throws(() => parseCall("2026-10-05-x.json", callFile({ kind: "forecast" })), /— status:.*still-arguing" is for arguments/);
  assert.throws(() => parseCall("2026-10-05-x.json", callFile({ status: "pending" })), /— status:.*never pending/);
  assert.equal(parseCall("2026-10-05-x.json", callFile({ kind: "forecast", status: "pending" })).kind, "forecast");
});

test("ungraded calls are excluded from the tally and streak", () => {
  const calls = [
    filed({ date: "2026-10-03", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/3" }),
    filed({ date: "2026-10-02", status: "ungraded", kind: "argument", postUrl: "https://x.com/ChipAbsolute/status/2" }),
    filed({ date: "2026-10-01", status: "held-up", postUrl: "https://x.com/ChipAbsolute/status/1" }),
  ];
  const record = getCallRecord(calls);
  assert.deepEqual(record.tally, { hits: 2, misses: 0, stillArguing: 0, pending: 0 });
  assert.deepEqual(record.streak, { kind: "hot", count: 2, label: "Hot: 2 straight held up" });
});

test("live record excludes the ungraded Bryce call", () => {
  const record = getCallRecord(loadCalls());
  const counted = loadCalls().filter((call) => call.status === "held-up" || call.status === "missed");
  assert.equal(record.tally.hits + record.tally.misses, counted.length);
  assert.ok(loadCalls().some((call) => call.status === "ungraded" && call.take.startsWith("Bryce Young")));
});

test("an ungraded call may not carry its own note", () => {
  assert.throws(() => parseCall("2026-10-04-x.json", callFile({ date: "2026-10-04", status: "ungraded", kind: "argument", note: "Nope." }).replaceAll("2026-10-05", "2026-10-04")), /ungraded call/);
});
