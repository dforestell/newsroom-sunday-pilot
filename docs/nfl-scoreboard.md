# Live NFL scoreboard

## What is implemented

The home page fetches `/api/nfl/scores` as soon as its scoreboard mounts. The route uses ESPN, then BALLDONTLIE on error, then a saved snapshot if neither provider can supply a valid response. The scoreboard uses the existing Hot Bar tokens and Newsreader/Geist/IBM Plex Mono fonts. No runtime dependency was added.

The page stays statically rendered; only the scoreboard polls. Current games get their own `/scores/[id]` view. The Melbourne demo URLs and private simulated replay stay separate from real game identities. Blog links are editorial opt-ins in `lib/nfl/coverage.ts` and default to off.

The demo integration also includes PR #2's SNF and MNF backtests. All three demo cards appear in a labeled archive beneath the independent live scoreboard. Their seeded scores and editorial copy are never used as live provider fallback.

## Run locally

1. Install the repository's existing dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run dev` and open `http://localhost:43147`.

ESPN needs no key. With no Redis credentials in development, the app uses a single-process memory store. The API logs this fact once. Restarting development loses that store; it is not shared between processes.

`npm run smoke:espn` fetches and validates ESPN directly, printing only normalized matchups, scores and status. It reads exported environment variables; Node's direct script runner does not automatically load Next.js `.env.local` files. The test/smoke scripts need Node 22.18+ or Node 24.

## Production activation on Vercel

Add these to the relevant Vercel project's environment variables, then redeploy:

| Variable | Purpose | Required |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | HTTPS REST endpoint of a persistent Redis database | Yes, production |
| `UPSTASH_REDIS_REST_TOKEN` | Redis write-capable REST token | Yes, production |
| `BALLDONTLIE_API_KEY` | Backup API access | To enable fallback |
| `NFL_SEASON` | Pin a season year | Optional; all three week values together |
| `NFL_SEASON_TYPE` | 1 preseason, 2 regular season, 3 postseason | Optional |
| `NFL_WEEK` | Provider week number | Optional |

Use an account-owned Redis database, not an expiring anonymous trial database. Set credentials separately for Production and Preview as appropriate. Preview and production deployments should use separate Redis databases so preview tests do not change production cache state or consume its shared refresh budget. If the same BALLDONTLIE key is also used elsewhere, coordinate its total request allowance or give the scoreboard a dedicated key/account as the provider permits.

If Redis is missing or unavailable in production, `/api/nfl/scores` returns 503 with an unavailable response; it does not bypass the shared provider limiter. A browser with previously fetched scores retains them and labels updates delayed. A newly opened browser cannot retrieve saved scores while the store itself is unreachable.

## Refresh and outage behavior

- Browser: every 15 seconds during active/recent-to-kickoff games, every two minutes for future scheduled games, every five minutes for completed/empty slates. Polling pauses in hidden tabs and restarts on return/online. Polling continues slowly after finals so next week's games can appear.
- ESPN: at most one request every 20 seconds across this installation's server instances.
- BALLDONTLIE: at most one request every 30 seconds across instances. Requests are reserved before fetching, including failed attempts. No automatic HTTP retry loop spends extra quota. One call requests all games in the chosen window (`per_page=100`). A paginated response fails validation instead of silently dropping games.
- Shared lock: prevents concurrent refreshes; a 25-second lease recovers from crashed workers. Token-checked save/release prevents an expired worker overwriting another worker's snapshot.
- ESPN circuit: after three failures, skip ESPN for five minutes while continuing to use backup data. Recovery is probed by a later eligible scoreboard request.
- Provider timeout: three seconds per request. The API has a 30-second function budget; the browser request also has a timeout.
- CDN: five-second cache. Shared Redis, not the CDN, enforces upstream request limits.
- Total provider failure: saved snapshot stays intact; its successful-fetch timestamp does not change. Stale responses show a delayed label and hide the old clock/possession.
- A successful fetch is labeled “Checked … ago,” not “score updated … ago.” Provider source timestamps stay null unless actually supplied and trusted. Unchanged scores do not trigger failover.
- Blank scores remain null/“—”; legitimate zero scores stay zero. Reviews can reduce scores, so downward corrections are allowed. Regressions from final to scheduled/in-progress are rejected.

Refreshes are request-driven. There is no permanent background worker or cron job. When nobody visits, the app stops requesting provider data. Shared stored snapshots persist between requests and deployments.

## Provider details and limitations

ESPN endpoint: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`. Automatic mode follows ESPN's current scoreboard week. An explicit selection adds `dates`, `seasontype` and `week`. Each response is validated before it can replace saved data. Home and away are determined by `homeAway`, not array position.

BALLDONTLIE endpoint: `https://api.balldontlie.io/nfl/v1/games`, with the key in the server-side `Authorization` header. Backup normally reuses the known unfinished slate's season, phase and week. When there is no relevant unfinished slate, it queries yesterday through the next seven UTC dates, including regular/postseason games. For preseason cold starts, pin all three selection variables explicitly. Verify provider preseason week numbering during preseason before treating it as equivalent to ESPN's Hall-of-Fame-week numbering.

The documented backup game response does not promise separate clock, quarter or possession fields. These become null on fallback; an old ESPN clock is never merged into a backup score. The source's textual status can still describe the period. ESPN and BALLDONTLIE may share underlying sources; this is API failover, not a guarantee of independently collected data.

Game IDs use season, phase and canonical away/home team codes. Week and kickoff changes do not alter them. A persistent identity map retains both providers' IDs. Duplicate matchup identities within one phase are rejected for investigation rather than silently combined. Historical games outside the current scoreboard window show a clear out-of-window message; this feature is not a historical game archive. The narrow exception: a past game page with a matched Chip call fetches ESPN's dated scoreboard (call date, then ±1 day) server-side and shows the Final card only when ESPN reports it final; otherwise the out-of-window message stays.

This implementation adds scores and status, not a play-by-play/news ingestion system. Raw provider content is not published as editorial copy. No third-party logos, betting odds or automatic blog publication are added.

## Verification

```bash
npm run test:nfl
npm run typecheck
npm run lint
npm run build
npm run smoke:espn
npm run smoke:failover
```

If a restricted environment prevents Turbopack's worker from binding a local port, `npm run build -- --webpack` verifies the same application with Next.js's alternative compiler. The normal build command is unchanged.

Automated tests exercise normalization, zero/missing scores, provider request construction, ID continuity, simultaneous visitors, primary outage, total outage, rate reservations, circuit cooldown, lease fencing and score corrections. Before launch, supply real backup/Redis credentials, open the site during a live game, then verify primary failure and total-feed failure in a separate preview deployment. Do not use production credentials for intentional outage tests.

See [failover smoke](failover-smoke.md) for the one-command offline smoke and the exact Preview steps to force ESPN failure, backup activation, saved-score display and recovery. `NFL_SMOKE_OUTAGE` is honored only in development/Preview; production ignores it.

### Verification performed for this implementation

- 23 automated tests passed, including mocked Redis REST commands, stale UI presentation and production fault-injection guards.
- TypeScript and ESLint passed.
- The production build passed with `next build --webpack`. This environment blocked Turbopack's local worker port; the repository's normal build command remains unchanged.
- The actual ESPN adapter returned 16 normalized games.
- Read-only HTTP checks against the combined local Next.js app passed: scores endpoint, snapshot reuse, home page, encoded game-detail URLs, invalid-ID 404, all three isolated DEMO timelines and the Melbourne redirect.
- `npm run smoke:failover` passed ESPN → backup → saved-score UI → recovery using controlled provider samples and the same presentation helpers as the scoreboard.
- BALLDONTLIE and Redis behavior were tested with controlled responses, not your live account credentials. No active-game latency or browser visual check was completed; the browser tool's security-policy check was unavailable.

With the local development server running, repeat the HTTP integration check with `node scripts/smoke-app.ts`. It requires a nonempty current ESPN slate and network access. The production site has not been deployed by these checks.

## Sources

- [ESPN JSON endpoint](https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard): internal, unsupported interface.
- [BALLDONTLIE NFL API](https://nfl.balldontlie.io/) and [terms](https://www.balldontlie.io/terms).
- [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi) and [pricing](https://upstash.com/pricing/redis).
- [Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache).

Free-tier usage depends on traffic and account limits. Vercel Hobby is for personal, noncommercial use; hosting costs are separate from the data API.
