import { z } from "zod";
import { SPORTS } from "./sports.ts";

const oneLine = (empty: string) =>
  z
    .string({ error: empty })
    .trim()
    .min(1, empty)
    .refine((value) => !/[\r\n]/.test(value), "Keep this to one line.");

const chipPostUrl = z
  .string({ error: "Use an https://x.com/ChipAbsolute/status/<id> URL." })
  .trim()
  .regex(
    /^https:\/\/x\.com\/ChipAbsolute\/status\/\d+$/,
    "Use an https://x.com/ChipAbsolute/status/<id> URL. Other hosts, accounts, and query strings are rejected.",
  );

const schema = z
  .object({
    date: z
      .string({ error: "Use a quoted YYYY-MM-DD date." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a quoted YYYY-MM-DD date.")
      .refine((date) => {
        const value = new Date(`${date}T00:00:00Z`);
        return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date;
      }, "Use a real calendar date in YYYY-MM-DD format."),
    sport: z.enum(SPORTS, { error: `Use sport ${SPORTS.map((sport) => `"${sport}"`).join(" or ")}.` }),
    game: oneLine("Name the game, away team first, e.g. DET at CAR or BOS at NYK."),
    window: oneLine("Add a short window such as MNF, SNF or NBA Cup, or omit the field.").optional(),
    take: oneLine("Add Chip's one-line take."),
    criterion: oneLine("Add a one-line success criterion, or omit the field.").optional(),
    kind: z.enum(["forecast", "argument"], {
      error: 'Use kind "forecast" (one checkable outcome, posted before kickoff) or "argument" (an opinion with no box-score line).',
    }),
    postUrl: chipPostUrl,
    receiptUrl: chipPostUrl.optional(),
    result: oneLine("Add the verified result.").optional(),
    status: z.enum(["held-up", "missed", "still-arguing", "pending", "ungraded"], {
      error: 'Use status "held-up", "missed", "still-arguing", "pending", or "ungraded".',
    }),
    note: oneLine("Add the note, or omit the field.").optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.kind === "forecast" && data.status === "still-arguing") {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: 'A forecast is graded by the final ESPN box: use "pending", "held-up", or "missed". "still-arguing" is for arguments.',
      });
    }
    if (data.kind === "argument" && data.status === "pending") {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: 'An argument is never pending: file it as "still-arguing" with the verified result.',
      });
    }
    if (data.status !== "pending" && !data.result) {
      ctx.addIssue({
        code: "custom",
        path: ["result"],
        message: "Add the verified result. Omit result only while status is pending.",
      });
    }
    if (data.receiptUrl && data.status === "pending") {
      ctx.addIssue({
        code: "custom",
        path: ["receiptUrl"],
        message: "A pending call has no receipt yet. Add receiptUrl when you grade the call.",
      });
    }
    if (data.receiptUrl && data.receiptUrl === data.postUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["receiptUrl"],
        message: "The receipt is Chip's follow-up post, not the call itself. Use the receipt post's URL.",
      });
    }
    if (data.status === "ungraded" && data.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: 'An ungraded call shows the fixed note "Posted after the final, not counted." Omit note.',
      });
    }
  });

export type CallStatus = z.infer<typeof schema>["status"];
export type CallKind = z.infer<typeof schema>["kind"];
export type { Sport } from "./sports.ts";

export type Call = z.infer<typeof schema> & {
  dateLabel: string;
};

export const CALL_STATUS_LABEL: Record<CallStatus, string> = {
  "held-up": "Held up",
  missed: "Missed",
  "still-arguing": "Still arguing",
  pending: "Pending",
  ungraded: "Ungraded",
};

export const UNGRADED_NOTE = "Posted after the final, not counted.";

export const CALL_STATUS_TONE = {
  "held-up": "live",
  missed: "lead",
  "still-arguing": "arguing",
  pending: "ungraded",
  ungraded: "ungraded",
} as const satisfies Record<CallStatus, "live" | "lead" | "arguing" | "ungraded">;

export class CallFilingError extends Error {
  constructor(public issues: string[]) {
    super(`Call filing failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "CallFilingError";
  }
}

// Same visible-copy rules as stories. Status codes and post URLs are metadata.
const copyRules = [
  /\bDillon\b/i,
  /\bDEMO\b/,
  /\bSATIRE\b/i,
  /\bGitHub\b/i,
  /github\.com/i,
  /vercel\.app/i,
  /\/workspace\b/,
  /\bAstra\b/,
  /\bCodex\b/,
  /\bCursor\b/,
  /\bprocess\b/i,
];

const filenamePattern = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function parseCall(file: string, source: string): Call {
  const issues: string[] = [];
  const report = (field: string, correction: string) => issues.push(`${file} — ${field}: ${correction}`);
  const base = file.split(/[/\\]/).pop() ?? file;
  const named = filenamePattern.exec(base);
  if (!named) {
    report(
      "filename",
      "Name the file YYYY-MM-DD-short-slug.json, with lowercase words and single hyphens, e.g. 2026-10-05-bijan-carries.json.",
    );
  }

  let metadata: unknown;
  try {
    metadata = JSON.parse(source.replace(/^\uFEFF/, ""));
  } catch (error) {
    report(
      "json",
      `Fix the JSON syntax (${error instanceof Error ? error.message : "invalid JSON"}). Quote every string and do not leave a trailing comma. Copy docs/calls/README.md.`,
    );
    throw new CallFilingError(issues);
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    report("json", "File one call object. Copy the template in docs/calls/README.md.");
    throw new CallFilingError(issues);
  }

  const result = schema.safeParse(metadata);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const unrecognized = issue.message.match(/Unrecognized key: "([^"]+)"/);
      report(
        issue.path.join(".") || unrecognized?.[1] || "json",
        `${issue.message} Use the documented field names and types in docs/calls/README.md.`,
      );
    }
    throw new CallFilingError(issues);
  }

  const data = result.data;
  if (named && named[1] !== data.date) {
    report("filename", `Rename the file so it starts with ${data.date}. The date prefix and the date field must match.`);
  }
  for (const [field, value] of Object.entries({
    game: data.game,
    window: data.window,
    take: data.take,
    result: data.result,
    note: data.note,
  })) {
    if (!value) continue;
    for (const rule of copyRules) {
      if (rule.test(value)) {
        report(field, `Remove or rewrite public wording matching ${rule}. Keep internal names and references out of copy.`);
      }
    }
  }
  if (issues.length) throw new CallFilingError(issues);

  const call: Call = {
    date: data.date,
    dateLabel: dateLabel(data.date),
    sport: data.sport,
    game: data.game,
    take: data.take,
    kind: data.kind,
    postUrl: data.postUrl,
    status: data.status,
  };
  if (data.result) call.result = data.result;
  if (data.criterion) call.criterion = data.criterion;
  if (data.window) call.window = data.window;
  if (data.note) call.note = data.note;
  if (data.receiptUrl) call.receiptUrl = data.receiptUrl;
  return call;
}

export function tallyCalls(calls: Call[]) {
  return {
    "held-up": calls.filter((call) => call.status === "held-up").length,
    missed: calls.filter((call) => call.status === "missed").length,
    "still-arguing": calls.filter((call) => call.status === "still-arguing").length,
    pending: calls.filter((call) => call.status === "pending").length,
    ungraded: calls.filter((call) => call.status === "ungraded").length,
  };
}

/** Newest date first; a later post wins a same-day tie. */
export function sortCalls(calls: Call[]): Call[] {
  return [...calls].sort((a, b) => b.date.localeCompare(a.date) || b.postUrl.localeCompare(a.postUrl));
}
