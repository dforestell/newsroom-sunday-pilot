# Desk admin (/admin)

Post stories and update Chip's calls without a code commit. Content is stored in the
existing Upstash Redis and merged with the files in `content/` on every public page.

## Settings (Vercel → Project → Environment Variables, Production and Preview)

| Name | What |
| --- | --- |
| `ADMIN_EMAILS` | Comma-separated list of emails allowed to sign in. |
| `ADMIN_PASSWORD` | Shared admin password. |
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

## Later: named persona users

`lib/admin/auth.ts` keeps users behind an `AdminDirectory` interface. A persona directory
(username + password hash, ids like `persona:<username>`) can be added without changing
the session cookie or the pages.

## Local testing

`next start` without the settings shows the site with filed content and admin switched
off. To exercise admin locally, point `UPSTASH_REDIS_REST_URL` at a local Upstash-compatible
REST server on `http://127.0.0.1:<port>` (plain http is accepted for localhost only).
