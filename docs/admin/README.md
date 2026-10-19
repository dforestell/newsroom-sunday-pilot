# Desk admin (/admin)

Post stories and update Chip's calls without a code commit. Content is stored in the
existing Upstash Redis and merged with the files in `content/` on every public page.

## Settings (Vercel → Project → Environment Variables, Production and Preview)

| Name | What |
| --- | --- |
| `ADMIN_EMAILS` | Owner email(s), comma-separated. The owner can also sign in with username `dillon`. |
| `ADMIN_PASSWORD` | Owner password. |
| `ADMIN_SESSION_SECRET` | Random string, at least 32 characters, used to sign the session cookie. Changing it signs everyone out. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Already set for the scoreboard cache. |

Admin stays switched off (and says which setting is missing) until all of these exist.
Public pages do not need any of them. Never put real values in the repo or in logs.

## What it does

- **Stories**: create, edit, unpublish/republish. Admin stories always carry the SATIRE
  label and pass the same checks as filed stories (frontmatter schema, public-copy
  rules, Markdown without raw HTML, internal links must exist). A slug that is already
  used by a filed story is rejected; the slug cannot change after saving.
  They show on `/`, `/stories`, `/archive` and `/stories/<slug>`.
- **Calls**: add a call, or grade/edit any call (status, result, criterion, note) with the
  same rules as `npm run check:calls`. An admin version of a call replaces the filed
  version of the same post; "Revert to filed" removes the admin version. Record, streak
  and next call are computed over the merged list.
- Saves refresh the public pages immediately; otherwise admin content is re-read at most
  every 30 seconds.

## How content is loaded (and why /, /stories no longer 500)

PR #40 made pages dynamic and called `loadStories()` at request time. That reads
`content/stories`, `app/**/page.tsx` and `public/` from disk, and those files are not in the
Vercel function bundle. #43 traced `content/` and `app/` into the functions, but the link
check still looked for `public/graphics/…jpg` (public files are served by the CDN, not
bundled), so it threw a FilingError and the pages returned 500.

Now:

- `npm run gen:content` (part of `build`, `test` and `typecheck`) validates `content/` and
  writes `lib/generated/content.ts` with the stories, calls, route table and public-asset
  list. It is git-ignored and regenerated on every build.
- Runtime code imports that module and never reads the filesystem (`lib/*/files.ts` are
  build-time only; a test enforces this).
- Redis is read with a 1.5 s timeout. If it is missing, slow, failing or empty, pages
  render the filed content and log one line without secrets.

## Data

- `admin:stories:v2` (hash, field = slug, value = JSON story record)
- `admin:calls:v1` (hash, field = postUrl, value = JSON call in the `content/calls` format)

## Users and roles

Sign in at `/admin` with **Username** and **Password**.

- **Owner** (role `owner`): username `dillon` or an email in `ADMIN_EMAILS`, with
  `ADMIN_PASSWORD`. Comes from the environment, so it works even if Redis is down.
  Only the owner sees **Users** (`/admin/users`).
- **Editors** (role `editor`): accounts the owner adds on `/admin/users` (for Chip and
  other personas). Editors can do everything else in the admin: stories and calls.
  They cannot open `/admin/users` or use its actions.

On `/admin/users` the owner can add a user (username, display name, password + confirm),
reset a password, disable/enable, and delete.

- Usernames: 2–32 characters, lowercase letters, digits or hyphens. `dillon` is reserved.
- Passwords: at least 12 characters. Stored only as an scrypt hash (node:crypto,
  N=16384, r=8, p=1, 64-byte key) with a random 16-byte salt per user. Passwords and
  hashes are never logged or shown.
- Records live in the Redis hash `admin:users:v1` (field = username):
  `{ username, label, role: "editor", passwordHash, createdAt, disabled }`.
- Every admin request re-checks the session's user, so disabling or deleting a user signs
  them out on their next request. A password reset does not end existing sessions
  (disable and re-enable to force that). Changing `ADMIN_SESSION_SECRET` signs everyone out.
- If Redis is down, editors cannot sign in (and their sessions are treated as signed out);
  the owner can still sign in.

Code: `lib/admin/auth.ts` (`AdminDirectory`: `envDirectory` for the owner,
`redisDirectory` for editors, `combinedDirectory`), `lib/admin/users.ts`,
`lib/admin/passwords.ts`.

## Sign-in rate limit

Failed sign-ins are counted in Redis per username and per client IP
(`admin:login:fail:user:<name>`, `admin:login:fail:ip:<ip>`, first `x-forwarded-for`
address). After 10 failures within 15 minutes, further attempts for that username or
from that IP are refused until the window expires. A successful sign-in clears the
username counter. If Redis is unreachable the limit fails open (sign-in still works).
Code: `lib/admin/ratelimit.ts`.

## Local testing

`next start` without the settings shows the site with filed content and admin switched
off. To exercise admin locally, point `UPSTASH_REDIS_REST_URL` at a local Upstash-compatible
REST server on `http://127.0.0.1:<port>` (plain http is accepted for localhost only).
