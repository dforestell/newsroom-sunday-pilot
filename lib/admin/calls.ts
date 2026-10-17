import { CallFilingError, parseCall, type Call } from "../calls/content.ts";

export const CALL_FIELDS = ["date", "game", "window", "take", "criterion", "kind", "postUrl", "result", "status", "note"] as const;
export type AdminCallRecord = Partial<Record<(typeof CALL_FIELDS)[number], string>> & { updatedAt?: string; updatedBy?: string };

/** Drops empty optional fields so the record matches the filed-call JSON format exactly. */
export function callJson(input: AdminCallRecord): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of CALL_FIELDS) {
    const value = input[key]?.trim();
    if (value) out[key] = value;
  }
  return out;
}

/** Same validation as check:calls (lib/calls/content.ts parseCall). Pure: no filesystem access. */
export function validateAdminCall(input: AdminCallRecord): { call: Call; json: Record<string, string> } | { issues: string[] } {
  const json = callJson(input);
  const name = `${/^\d{4}-\d{2}-\d{2}$/.test(json.date ?? "") ? json.date : "0000-00-00"}-admin.json`;
  try {
    return { call: parseCall(name, JSON.stringify(json)), json };
  } catch (error) {
    if (error instanceof CallFilingError) return { issues: error.issues.map((issue) => issue.replace(`${name} — `, "")) };
    throw error;
  }
}

export function parseCallRecord(value: string): AdminCallRecord | null {
  try {
    const data = JSON.parse(value) as unknown;
    return data && typeof data === "object" && !Array.isArray(data) ? (data as AdminCallRecord) : null;
  } catch {
    return null;
  }
}
