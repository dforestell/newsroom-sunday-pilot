# Poor Form Sports — Sunday Pilot

Satirical desk with a live NFL scoreboard. Lead voice is **Chip Absolute**. Three labeled **DEMO** backtests have their own archive section: Melbourne (SF 27–LAR 7), SNF (NYG 28–DAL 20), and MNF (KC 31–DEN 10). A private **SIMULATED** replay stays behind the desk gate.

## Run locally

```bash
npm install
npm run dev
```

Dev server: [http://localhost:43147](http://localhost:43147)

```bash
npm run build
npm start
```

`npm start` is the stable preview (port 43147).

## File a story

Editor files one plain Markdown document in `content/stories/`. Follow the
[filing guide](docs/stories/README.md) and copy the [template](docs/stories/TEMPLATE.md).
`npm run check:stories` checks the filing before a Preview build. Shelf cards and
story pages are generated from those files; no TypeScript copy edits are needed.

## File a call

Add one JSON file under `content/calls/`. Follow the [calls guide](docs/calls/README.md).
`npm run check:calls` checks the filing before a Preview build. `/calls` is generated
from those files; no index edit is needed.

## Live NFL scoreboard

The complete implementation and setup guide is in [docs/nfl-scoreboard.md](docs/nfl-scoreboard.md).

- ESPN is the primary source; the first browser load calls `/api/nfl/scores`.
- `BALLDONTLIE_API_KEY` enables backup scores and game status.
- Production requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Local development uses an in-memory cache if Redis is not configured.
- Copy `.env.example` to `.env.local` and fill in the values you need.
- Do not put credentials in `NEXT_PUBLIC_` variables or commit `.env.local`.
- Use Node 22.18+ (or Node 24) for the TypeScript test/smoke scripts.

```bash
npm run test:nfl
npm run typecheck
npm run lint
npm run smoke:espn
npm run smoke:failover
```

## Routes

| Path | What it is |
| --- | --- |
| `/` | Live NFL board, labeled Melbourne/SNF/MNF demo archive, Cast and Stories. |
| `/api/nfl/scores` | Normalized scores with cache age and availability; no credentials. |
| `/scores/[id]` | Live game details for a fixture in the current scoreboard window. |
| `/demo` | Redirects to `/games/sunday-pilot`. |
| `/games/sunday-pilot` | Canonical Melbourne DEMO timeline. Full Editor fact + SATIRE beats. |
| `/games/sunday-pilot/delayed` | Public pause. Banner: **Updates delayed**. Resume returns to the game. |
| `/games/demo-dal-nyg-snf` | SNF DEMO timeline. DAL @ NYG, NYG 28–20. Editor fact + SATIRE seeds. |
| `/games/demo-den-kc-mnf` | MNF DEMO timeline. DEN @ KC, KC 31–10. Editor fact + SATIRE seeds. |
| `/stories` | DEMO/SATIRE longform index. Editor-owned seeds. |
| `/stories/fifteen-plays-one-continent-zero-chill` | Chip Absolute Melbourne column. |
| `/stories/conversion-referendums-week1` | Wes Process Week 1 process column. |
| `/cast` | Poor Form Desk strip. |
| `/cast/chip-absolute` (and other slugs) | Voice stubs. Chip Absolute is the lead profile. |
| `/calls` | Chip Absolute's takes, and how each one held up. |
| `/review` | Private review desk. Gate phrase: `desk`. |

`/bloggers/lead-blogger` redirects to `/cast/chip-absolute`.

Override the gate with `REVIEW_PASSWORD` if you need a local secret. Default remains `desk`.

## DEMO vs SIMULATED

- **DEMO** is three labeled public backtests, not live, and not the live NFL scoreboard:
  - Melbourne: SF 27 – LAR 7, MCG. Sources: ESPN / Reuters / Rams.com / NFL gamebook. Injury beats skipped. Chyron Carl is silent.
  - SNF: NYG 28 – DAL 20, MetLife. Sources: ESPN / CBS / NBC / Giants.com. Len, Boo, Carl silent.
  - MNF: KC 31 – DEN 10, Arrowhead. Sources: ESPN recap gameId 401872931. Len, Boo silent. Carl files one platform beat.
- SATIRE lines on DEMO cards are Editor-approved copy, shown with byline. Fact-only cards have no commentary.
- DEMO ids stay in `lib/demo/*` and `lib/live/catalog.ts`. They are not mapped into live NFL coverage or `/api/nfl/scores`.
- Real NFL fixtures use the independent `/api/nfl/scores` feed and `/scores/[id]` view. The old Late Window placeholder is retired.
- **SIMULATED** is `/review` only. Greyshirts and Red Caps are labeled **SIMULATED desk aliases**. Public pages never import `lib/simulated`.
- Pause on a public DEMO game marks the wire delayed without fabricating updates. Review Play / Pause / scrub / rewind stay on the alias tape.

## Pilot constraints

- Live blog is editorial (`liveBlogEnabled`). All three DEMO games are on.
- Two jobs on a card: **Fact** is the official-shaped hook. **SATIRE** is character voice and is never a score source.
- The public-live path does not load the simulated reel.

## Canonical domain

Every public link uses `https://poorformsports.com`, from `SITE_URL` in `lib/site.ts`. Set `NEXT_PUBLIC_SITE_URL` (origin only) to override it. Use it for `metadataBase`, per-page `alternates.canonical`, Open Graph/Twitter URLs and any absolute link.

`proxy.ts` sends a 308 to the same path and query on `https://poorformsports.com` for GET/HEAD requests whose host is exactly `newsroom-sunday-pilot.vercel.app` or `www.poorformsports.com` (`lib/canonical-host.ts`). Preview and deployment hosts, localhost and non-GET/HEAD requests (server actions, form posts) pass through. Admin cookies are per host, so after the redirect you sign in again on poorformsports.com.
