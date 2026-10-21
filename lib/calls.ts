// Runtime calls API. No filesystem access: filed calls are inlined at build time
// (lib/generated/content.ts) and merged with admin calls from Redis.
import { FILE_CALLS } from "./generated/content.ts";
import { mergeCalls } from "./admin/merge.ts";
import { readAdminContent } from "./admin/content.ts";

export {
  tallyCalls,
  sortCalls,
  CALL_STATUS_LABEL,
  CALL_STATUS_TONE,
  UNGRADED_NOTE,
  type Call,
  type CallKind,
  type CallStatus,
} from "./calls/content.ts";
export { getCallRecord, sportRecords, type CallRecord, type CallStreak, type CallTally, type SportRecord } from "./calls/record.ts";
export { SPORTS, type Sport } from "./calls/sports.ts";
import type { Call } from "./calls/content.ts";

/** Filed calls only (build-time snapshot). */
export function listCalls(): Call[] {
  return FILE_CALLS;
}

/** Filed calls merged with admin calls. Falls back to filed calls if Redis is unavailable. */
export async function listPublicCalls(): Promise<Call[]> {
  const admin = await readAdminContent();
  return mergeCalls(FILE_CALLS, admin.calls);
}
