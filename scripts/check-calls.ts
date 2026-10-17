import { resolve } from "node:path";
import { CallFilingError } from "../lib/calls/content.ts";
import { loadCalls } from "../lib/calls/files.ts";
import { getCallRecord } from "../lib/calls/record.ts";

try {
  const directory = process.argv[2] ? resolve(process.argv[2]) : undefined;
  const calls = loadCalls(directory);
  const counted = calls.filter((call) => call.status === "held-up" || call.status === "missed");
  const ungraded = calls.filter((call) => call.status === "ungraded");
  if (ungraded.some((call) => counted.includes(call))) throw new Error("Ungraded calls must not be counted.");
  const record = getCallRecord(calls);
  const held = counted.filter((call) => call.status === "held-up").length;
  if (record.tally.hits !== held || record.tally.misses !== counted.length - held) {
    console.error(`Call record mismatch: record ${record.tally.hits}–${record.tally.misses}, data ${held}–${counted.length - held}.`);
    process.exitCode = 1;
  }
  console.log(
    `Call filing passed: ${calls.length} calls, valid posts, results and status. Record ${record.tally.hits}–${record.tally.misses}; ${ungraded.length} ungraded (not counted).`,
  );
} catch (error) {
  if (!(error instanceof CallFilingError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
}
