# File a story

1. Copy [TEMPLATE.md](./TEMPLATE.md) to `content/stories/your-story-slug.md`. Keep guides, notes and templates outside that folder.
2. Fill the YAML header and replace the skeleton with Editor-approved copy. Use plain Markdown, not MDX. Preview preserves paragraphs, tables, bullets, headings, bold/italic text, links and images.
3. Open a content-only pull request. The filing check, existing copy checks, tests and build run in GitHub; Vercel posts the Preview link. Open `/stories` and `/stories/your-story-slug` on that Preview.
4. Dev reviews path/schema issues; Dillon inspects the finished page before merge. Filing a file does not approve publication. Merging main deploys Production through the existing integration.

## Header fields

| Field | Required | How to file |
| --- | --- | --- |
| `title` | Yes | The exact headline. Quote text with colons. |
| `slug` | Yes | Unique lowercase words with single hyphens. This becomes `/stories/<slug>`; preserve it when revising a published piece. Name the file after it for clarity. |
| `date` | Yes | Quoted real date, `"2026-09-17"`. Sorting uses this ISO date. Display formatting is automatic and uses UTC unless `dateLabel` is set. |
| `dateLabel` | No | Public date line when the automatic UTC format is not enough, e.g. a filed/corrected stamp. Omit to use the formatted `date`. |
| `voiceId` | Yes | Exact cast slug, listed below. The cast module supplies name, avatar and profile link. |
| `label` | Yes | `"SATIRE"` or `"DEMO / SATIRE"`. This retains content classification; it does not add badges to the public chrome removed in #17. |
| `dek` | No | Shelf/page summary. Omit for no summary. |
| `bylineDetail` | No | Extra filed credit, e.g. `with the whole newsroom`. |
| `relatedGameHref` | No | An existing `/games/<id>` route. |
| `relatedGameLabel` | No | Link text; requires `relatedGameHref`. |
| `order` | No | Nonnegative integer, default 0. Lower comes first among stories with the same date. |

Stories sort newest first, then `order`, then slug. No index edits are needed. There is no hidden draft flag: keep unfinished files out of main and use a draft PR for review.

Valid author IDs: `chip-absolute`, `wes-process`, `postcard-pete`, `chyron-carl`, `layover-len`, `boo-atlas`, `poor-form-desk`. The legacy `wes-process` ID still displays as **Wes**.

## Body rules

- Use `##` through `######` headings; the template's title creates the single page heading.
- Tables use standard GFM pipes and a separator row. Escape a literal pipe as `\|`.
- Put a signoff in its own italic paragraph: `*— Name / Filed signoff*`.
- Raw HTML/JSX is rejected. There are no imports, components or executable expressions. Code blocks are displayed as text. HTML is also removed by the renderer and generated HTML is sanitized.
- Use root-relative internal links, e.g. `/staff/chip-absolute`, `/stories/known-slug` or `/games/demo-den-kc-mnf`. Links to story files in the same PR work. Public assets must exist under `public/`.
- Images are standard Markdown: `![Alt text](/graphics/file.jpg "Optional caption")`. A lone image becomes a `<figure>`; the quoted title is the `<figcaption>`. The `src` must be an existing file under `public/`. Raw HTML `<figure>` / `<img>` is rejected.
- Story heading anchors use `#story-heading-text` (lowercase, punctuation removed, spaces become hyphens). Repeated headings gain `-1`, `-2`. Game anchors must match existing timeline entry IDs. Other unknown anchors are rejected; use the page URL instead. External links are checked for safe schemes, not remote availability. Live-score fixture existence cannot be verified offline, so use known editorial game routes in filings.
- Preserve #17's public-copy rules: internal names/tools/repository URLs and the scrubbed wording stay out of headline, dek, byline details, optional date label, link label and body. Classification words belong in `label`; cast IDs and route slugs remain machine metadata. The checks retain the existing ban on public prose using the word `process`.

## If CI is red

Run `npm run check:stories` locally. Errors name the file, field and fix, for example:

```text
content/stories/example.md — slug: Use lowercase words separated by single hyphens...
content/stories/example.md — voiceId: Choose a cast voiceId...
content/stories/example.md — body:12: "/stories/missing" has no known page...
```

`body:12` means line 12 of the Markdown body after the YAML, not the whole file. Fix all listed problems and push again. Do not bypass checks or rewrite app code to file a normal story.

Missing required fields, invalid dates, malformed YAML, duplicate slugs, unknown authors, empty bodies, HTML/JSX, unsafe URLs, broken internal paths/anchors and public-copy violations fail filing. YAML aliases, unknown header fields and non-Markdown files in the content folder are rejected too. A passing check verifies structure and links, not the factual accuracy of football claims; Editor still owns that review.

Local development: `npm ci`, `npm run dev`; refresh after edits. If adding a brand-new slug is not picked up by the dev route cache, restart the dev server. Every Preview build reads the complete content folder fresh.

## Migration notes for Dev

All eight existing stories moved from `lib/stories.ts` to Markdown, including the Highmark recap added on main by #20. Old `dateLabel` values became ISO `date` values that format back identically, except Staff Picks keeps Production’s filed/corrected stamp via optional `dateLabel`. `demo: false` maps to `label: SATIRE`; the prior implicit archive classification maps to `DEMO / SATIRE`. Explicit `order` preserves the prior shelf order within each date (Highmark recap first among Sep 17 filings). Bylines, deks, related-game links, signoffs, table cells, the Highmark figure and public slugs are retained.

`lib/stories.ts` is now a thin loader facade. Markdown is the only content source. The server renders sanitized HTML using remark/GFM and rehype; no MDX or CMS is installed. The original #17 checks now inspect file-backed story copy instead of searching the old TypeScript data file. Other public-copy assertions are unchanged.

CI includes actual bad-slug and bad-author fixtures and asserts that the filing command exits with status 1 and a useful error. `npm run build` also runs filing checks before Next, so a failed filing cannot produce a successful Vercel build.
