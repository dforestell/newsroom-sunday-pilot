# Staff page themes

Every cast member has a page at `/staff/<slug>`. `/cast/<slug>` redirects there with a 308. Each page's look is an **accent layer** scoped to `[data-persona="<slug>"]`. It covers the persona header, story-row links and rules, and the cast-switcher marker. The site header, nav, footer, body text, paper background and the SATIRE, DEMO and sport chips are never themed.

**To change a persona, edit one file:** `lib/staff/themes.ts` → `PERSONA_THEMES`. A cast member with no entry gets the shared fallback.

## Shape

```ts
type PersonaTheme = {
  tokens: {
    "--persona-header-bg"?: string;    // header band background
    "--persona-header-fg"?: string;    // name + header text (AA ≥ 4.5:1 on header-bg)
    "--persona-header-meta"?: string;  // kicker, bio, count (AA ≥ 4.5:1 on header-bg)
    "--persona-accent"?: string;       // header bottom rule, name underline, switcher marker, header focus ring
    "--persona-link"?: string;         // story/call title links on paper #f4ebe0 (AA)
    "--persona-link-hover"?: string;   // hover/focus color on paper (AA)
    "--persona-rule"?: string;         // 1px row dividers (decorative)
    "--persona-display-font"?: string; // name lockup only; set automatically from `font`
    "--persona-motif"?: string;        // CSS background for .staff-header::before (gradients / SVG data-URI)
  };
  font?: "anton" | "barlow-condensed" | "bebas-neue" | "roboto-condensed" | "special-elite"; // one extra Google font, see lib/staff/fonts.ts
  header: "default" | "lead" | "blueprint" | "signage" | "centered" | "lower-third" | "postcard";
  bio?: string;                 // one line under the name
  labels?: {
    kicker?: string;            // mono line above the name
    section?: string;           // list heading (Chip: the calls list)
    empty?: string;             // shown when the list is empty
    count?: string;             // "{n} stories" — {n} is replaced
    back?: string;              // back-link text
    backHref?: string;
    sort?: string;              // caption next to the heading
  };
  uppercaseName?: boolean;
  topBorder?: string;           // 1px top border colour for light headers
};
```

**Fallback** (any cast member without an entry):
- Colors: bar header `#0e0c0b` with cream `#fff8ef` text, meta `#d8cfc6`, a masthead-red rule and red links.
- Font and motif: Newsreader name and no motif.
- Bio: the cast member's existing lead line from `lib/cast.ts`.
- Labels: "Stories by {Name}", "Nothing filed yet.", "{n} stories", "← All staff".

## Adding a font

Add the face to `lib/staff/fonts.ts`:
- Use `next/font/google`, Latin subset, `display: "swap"` and `preload: false`. Only the staff page imports this file, and a browser downloads a face only when its page uses it.
- Add the key to `StaffFontKey`.

## Rules

- Accents stay out of the yellow-orange band (about hue 20°–60°) so they never read like the SATIRE or DEMO chips.
- Motifs sit only behind the persona header. They're hidden under `forced-colors: active` and stay static.
- `bio` and `labels` are public copy. Bios were Editor-reviewed on 2026-10-21. Desk, Chip and Pete use the Designer's spec text, and Wes, Len, Boo and Carl use the Editor's edits. They must come from existing cast material. Don't invent voice lines.
- Tests (`tests/staff.test.ts`) check AA contrast for header text and links, that tokens are scoped to the persona, and that every cast slug has a theme or the fallback.

- Cast titles from `lib/cast.ts` are not shown on staff pages (the `STAFF_TITLE_SLOT` in `components/staff-view.tsx` is empty) until the disputed titles are settled.
