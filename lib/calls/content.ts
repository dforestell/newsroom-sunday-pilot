import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { z } from "zod";

const oneLine = (empty: string) =>
  z
    .string({ error: empty })
    .trim()
    .min(1, empty)
    .refine((value) => !/[\r\n]/.test(value), "Keep this to one line.");

const schema = z
  .object({
    date: z
      .string({ error: "Use a quoted YYYY-MM-DD date." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a quoted YYYY-MM-DD date.")
      .refine((date) => {
        const value = new Date(`${date}T00:00:00Z`);
        return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date;
      }, "Use a real calendar date in YYYY-MM-DD format."),
    game: oneLine("Name the game, e.g. DET at CAR."),
    window: oneLine("Add a short window such as MNF, or omit the field.").optional(),
    take: oneLine("Add Chip's one-line take."),
    criterion: oneLine("Add a one-line success criterion, or omit the field.").optional(),
    kind: z.enum(["forecast", "argument"], {
      error: 'Use kind "forecast" (one checkable outcome, posted before kickoff) or "argument" (an opinion with no box-score line).',
    }),
    postUrl: z
      .string({ error: "Use an https://x.com/ChipAbsolute/status/<id> URL." })
      .trim()
      .regex(
        /^https:\/\/x\.com\/ChipAbsolute\/status\/\d+$/,
        "Use an https://x.com/ChipAbsolute/status/<id> URL. Other hosts, accounts, and query strings are rejected.",
      ),
    result: oneLine("Add the verified result.").optional(),
    status: z.enum(["held-up", "missed", "still-arguing", "pending"], {
      error: 'Use status "held-up", "missed", "still-arguing", or "pending".',
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
  });

export type CallStatus = z.infer<typeof schema>["status"];
export type CallKind = z.infer<typeof schema>["kind"];

export type Call = z.infer<typeof schema> & {
  dateLabel: string;
};

export const CALL_STATUS_LABEL: Record<CallStatus, string> = {
  "held-up": "Held up",
  missed: "Missed",
  "still-arguing": "Still arguing",
  pending: "Pending",
};

export const CALL_STATUS_TONE = {
  "held-up": "live",
  missed: "warn",
  "still-arguing": "satire",
  pending: "outline",
} as const satisfies Record<CallStatus, "live" | "warn" | "satire" | "outline">;

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
    game: data.game,
    take: data.take,
    kind: data.kind,
    postUrl: data.postUrl,
    status: data.status,
  };
  if (data.result) call.result = data.result;
  if (data.window) call.window = data.window;
  if (data.note) call.note = data.note;
  return call;
}

export function listCalls(): Call[] {
  return loadCalls();
}

export function tallyCalls(calls: Call[]) {
  return {
    "held-up": calls.filter((call) => call.status === "held-up").length,
    missed: calls.filter((call) => call.status === "missed").length,
    "still-arguing": calls.filter((call) => call.status === "still-arguing").length,
    pending: calls.filter((call) => call.status === "pending").length,
  };
}

export function loadCalls(directory = resolve("content/calls"), root = process.cwd()): Call[] {
  const issues: string[] = [];
  const parsed: Array<{ file: string; call: Call }> = [];
  if (!existsSync(directory)) {
    throw new CallFilingError([
      `${relative(root, directory) || directory} — directory: Create content/calls and add one JSON file per call. Copy docs/calls/README.md.`,
    ]);
  }
  for (const name of readdirSync(directory).sort()) {
    const file = relative(root, join(directory, name));
    if (!name.endsWith(".json")) {
      issues.push(`${file} — filename: Keep only .json call files here. Move guides and templates to docs/calls.`);
      continue;
    }
    try {
      parsed.push({ file, call: parseCall(file, readFileSync(join(directory, name), "utf8")) });
    } catch (error) {
      if (error instanceof CallFilingError) issues.push(...error.issues);
      else throw error;
    }
  }
  const posts = new Map<string, string>();
  for (const item of parsed) {
    const previous = posts.get(item.call.postUrl);
    if (previous) {
      issues.push(
        `${item.file} — postUrl: "${item.call.postUrl}" is already used by ${previous}. Each post can be filed once.`,
      );
    }
    posts.set(item.call.postUrl, item.file);
  }
  if (issues.length) throw new CallFilingError(issues);
  return parsed
    .map(({ call }) => call)
    .sort((a, b) => b.date.localeCompare(a.date) || b.postUrl.localeCompare(a.postUrl));
}
