# File a call

`/calls` is the single record of Chip Absolute's calls. He posts a take before the game, then the same file is graded after it. Add one JSON file per take. Do not edit an index. The page sorts newest `date` first, then later posts on that date.

## Grading rule

Chip makes two kinds of calls. Only one gets a hit or a miss. Every file sets `kind`.

**Forecast (`"kind": "forecast"`).** A call with one checkable outcome, posted before kickoff: a winner, a stat line ("100+ rushing yards"), a head-to-head stat ("X out-rushes Y"), or a score.
- **Locked:** the timestamp on the X post must come before the official kickoff on the ESPN game page. If it was posted after kickoff, it isn't a forecast, and it isn't graded.
- **Graded by:** the final ESPN box score for that game, read after the game goes Final (overtime included).
- **Held up (`held-up`):** the outcome happened exactly as worded. "100+" means 100 or more. "Out-rushes" means more rushing yards, not more carries.
- **Missed (`missed`):** everything else. A push, a tie in a head-to-head, or wording too vague to check all count as misses.
- **No regrades:** stat corrections after the receipt is posted don't change the grade unless the ESPN box flips a hit to a miss or a miss to a hit. Then the card gets a dated correction line in `note`.
- Statuses: `pending`, `held-up`, `missed`. A forecast may not be `still-arguing`.

**Argument (`"kind": "argument"`).** An opinion about a decision or a player ("Atlanta should give Bijan 25 carries", "Bryce over Goff"). No box-score line settles it, so it is never a hit or a miss.
- **Still arguing (`still-arguing`):** the take is posted and the receipt hasn't been written yet.
- An argument is never `pending` and never counts in the Pending tally.
- Owned / Stands receipts are part of the rule but do not have status values yet.

**Coverage period.** The record covers calls posted from Oct 4, 2026 (first filed call) onward, 2026 regular season. Earlier takes are not in the data and are not counted.

**Open item.** `2026-10-04-bryce-over-goff.json` is filed as an argument but keeps its existing `held-up` grade (counted as a hit) until that grade is reviewed. Do not copy that combination for new arguments.

## Add a pending call

A new forecast, made before the game, is `pending`. Omit `result`. A new argument is filed as `still-arguing` with its verified result.

1. Create `content/calls/YYYY-MM-DD-short-slug.json`. The date prefix must match `date`. Use lowercase words and single hyphens: `2026-10-12-bijan-carries.json`.
2. Paste the template below and replace every placeholder. One call per file.
3. Run `npm run check:calls`.
4. Open a pull request. The Preview build reads this folder. Check `/calls` on that Preview.

`window` and `note` are optional. Delete those lines when they are unused. Do not leave them as empty strings. Do not include `result` until the call is graded.

## Template

```json
{
  "date": "2026-10-12",
  "game": "ATL at NO",
  "window": "MNF",
  "take": "One line. The take, as posted.",
  "kind": "forecast",
  "postUrl": "https://x.com/ChipAbsolute/status/0000000000000000000",
  "status": "pending",
  "note": "Optional extra line. Delete this field when unused."
}
```

## Grade a call

Edit that same file. Do not add a second file, and do not reuse the `postUrl` on a new file.

1. Set `status` to `held-up`, `missed`, or `still-arguing`.
2. Set `result` to one verified line.
3. Run `npm run check:calls`.

`held-up`, `missed`, and `still-arguing` require `result`. `pending` is the only status that may omit it.

## Fields

| Field | Required | How to file |
| --- | --- | --- |
| `date` | Yes | Real calendar date, `"YYYY-MM-DD"`. This is the sort key and the filename prefix. |
| `game` | Yes | Matchup, away team first, e.g. `DET at CAR`. |
| `window` | No | Short label such as `MNF`. Omit the field when there is nothing to add. |
| `take` | Yes | One line. The take Chip posted. |
| `kind` | Yes | `forecast` or `argument`. See the grading rule. |
| `postUrl` | Yes | Exactly `https://x.com/ChipAbsolute/status/<id>`, digits only after `status/`. No other host, account, query string, or trailing slash. One post, one file. |
| `result` | Required except `pending` | Verified result, one line. Omit the field while `status` is `pending`. Required for `held-up`, `missed`, and `still-arguing`. |
| `status` | Yes | The grade. `held-up` is a hit. `missed` is a miss. `pending` is a pre-game call. `still-arguing` is an ungraded call that already has a result. There is no separate grade field. |
| `note` | No | Extra line under the result. Omit the field when unused. |

`status` is the only grade. New calls start as `pending` and omit `result`. Grade them by editing the file in place. `still-arguing` and `pending` are both ungraded and both skipped by the streak. Only `pending` counts in the Pending tally; `still-arguing` has its own Still arguing count. Cards keep their own tags: **Held up**, **Missed**, **Still arguing**, and **Pending**.

## Chip’s record

The top of `/calls` reads the same `status` field:

- **Next call:** the newest `pending` call (date, game, take, X post). If none is filed, the row says “Next call drops soon.”
- **Tally:** hits (`held-up`), misses (`missed`), still arguing (`still-arguing`), and pending (`pending` only).
- **Streak:** graded calls only, newest first. `pending` and `still-arguing` are skipped. Two or more hits in a row is hot (“Hot: N straight held up”). Two or more misses in a row is cold (“Cold: N straight missed”). One graded call, a split, or no graded calls is “No streak yet.”
- **Latest:** the newest call whose status is not `pending`, so it does not repeat the next call. A later post wins a same-day tie.

## If the check is red

Run `npm run check:calls`. Errors name the file, the field, and the fix:

```text
content/calls/example.json — date: Use a real calendar date in YYYY-MM-DD format.
content/calls/example.json — status: Use status "held-up", "missed", "still-arguing", or "pending".
content/calls/example.json — postUrl: Use an https://x.com/ChipAbsolute/status/<id> URL. Other hosts, accounts, and query strings are rejected.
content/calls/example.json — take: Add Chip's one-line take.
content/calls/example.json — kind: Use kind "forecast" (one checkable outcome, posted before kickoff) or "argument" (an opinion with no box-score line).
content/calls/example.json — result: Add the verified result.
content/calls/example.json — postUrl: "https://x.com/ChipAbsolute/status/123" is already used by content/calls/other.json. Each post can be filed once.
```

Fix every listed line and run the check again. A bad date, an unknown status, a non-Chip or non-X post, an empty take or result, a repeated `postUrl`, unknown fields, and broken JSON all fail. `npm run build` runs the same check, so a bad file cannot ship a Preview.
