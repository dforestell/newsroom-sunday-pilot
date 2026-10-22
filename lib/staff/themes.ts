// Staff page persona themes, from the Designer's spec
// (STAFF-PAGE-THEMES-2026-10-21). Each persona is an accent layer scoped to
// [data-persona="<slug>"] on the staff page only. The site header, nav, footer, body
// text and SATIRE/DEMO/sport chips are never themed.
//
// Dropping in or changing a spec is a one-file change: edit PERSONA_THEMES below.
// docs/staff-themes.md documents the shape.
//
// EDITOR-REVIEWED 2026-10-21 (staff-page-bio-review-2026-10-21): every `bio` is final.
// Desk, Chip and Pete use the Designer's spec text; Wes, Len, Boo and Carl carry the
// Editor's edits verbatim. Other `labels` strings are the Designer's spec text with the
// Editor's empty-state edits applied. Do not add new voice lines here.
import type { Voice } from "../cast.ts";

export type StaffFontKey = "anton" | "barlow-condensed" | "bebas-neue" | "inter" | "roboto-condensed" | "special-elite";

export type StaffHeaderVariant = "default" | "lead" | "blueprint" | "signage" | "centered" | "lower-third" | "postcard";

/** CSS custom properties a persona may set. Anything unset falls back to the shared theme. */
export type PersonaTokens = {
  "--persona-header-bg"?: string;
  "--persona-header-fg"?: string;
  "--persona-header-meta"?: string;
  "--persona-accent"?: string;
  "--persona-link"?: string;
  "--persona-link-hover"?: string;
  "--persona-rule"?: string;
  "--persona-display-font"?: string;
  "--persona-motif"?: string;
};

export type StaffLabels = {
  /** Mono kicker above the name. */
  kicker: string;
  /** Heading over the persona's list (stories; calls for Chip). */
  section: string;
  empty: string;
  /** Count line. `{n}` is replaced with the number. */
  count: string;
  back: string;
  backHref: string;
  sort?: string;
};

export type PersonaTheme = {
  tokens: PersonaTokens;
  /** At most one extra display font, for the header name lockup only. */
  font?: StaffFontKey;
  header: StaffHeaderVariant;
  bio?: string;
  /** Name of the persona's own running record (shown 0–0 until real calls are logged). */
  recordLabel?: string;
  labels?: Partial<StaffLabels>;
  /** Display-name lockup is uppercase. */
  uppercaseName?: boolean;
  /** Pete's light header gets a 1px top border to separate it from paper. */
  topBorder?: string;
};

export type StaffTheme = Required<Pick<PersonaTheme, "tokens" | "header">> & {
  slug: string;
  font?: StaffFontKey;
  bio: string;
  labels: StaffLabels;
  uppercaseName: boolean;
  topBorder?: string;
  recordLabel?: string;
  /** True when this persona has a Designer spec; false for the shared fallback. */
  specified: boolean;
};

/** Shared fallback: any cast member without a spec (and future seats). */
export const FALLBACK_TOKENS: Required<Omit<PersonaTokens, "--persona-motif">> & { "--persona-motif": string } = {
  "--persona-header-bg": "#0e0c0b",
  "--persona-header-fg": "#fff8ef",
  "--persona-header-meta": "#d8cfc6",
  "--persona-accent": "#c41e12",
  "--persona-link": "#c41e12",
  "--persona-link-hover": "#0c0908",
  "--persona-rule": "#d8cfc6",
  "--persona-display-font": "var(--font-newsreader), serif",
  "--persona-motif": "none",
};

export function fallbackLabels(voice: Voice): StaffLabels {
  return {
    kicker: voice.desk,
    section: `Stories by ${voice.name}`,
    empty: "Nothing filed yet.",
    count: "{n} stories",
    back: "← All staff",
    backHref: "/staff",
  };
}

const NEWSROOM = "/";

/** Repo slug → Designer spec. The spec's `desk` persona is the repo's `poor-form-desk`. */
export const PERSONA_THEMES: Record<string, PersonaTheme> = {
  "poor-form-desk": {
    header: "default",
    tokens: {
      "--persona-header-bg": "#0e0c0b",
      "--persona-header-fg": "#fff8ef",
      "--persona-header-meta": "#d8cfc6",
      "--persona-accent": "#c41e12",
      "--persona-link": "#c41e12",
      "--persona-link-hover": "#0c0908",
      "--persona-rule": "#d8cfc6",
      "--persona-display-font": "var(--font-newsreader), serif",
      "--persona-motif": "repeating-linear-gradient(0deg,rgba(255,248,239,.05) 0 1px,transparent 1px 24px)",
    },
    bio: "We file jokes after the facts land — never instead of them. If it reads like real reporting, we cut it.",
    labels: { kicker: "Filed by", section: "Filed by the Desk", empty: "Nothing filed. Silence beats a reaction with no position.", count: "{n} filings", back: "← Back to the newsroom", backHref: NEWSROOM, sort: "Newest filing first" },
  },
  "chip-absolute": {
    header: "lead",
    font: "anton",
    uppercaseName: true,
    tokens: {
      "--persona-header-bg": "#7a0f0a",
      "--persona-header-fg": "#fff8ef",
      "--persona-header-meta": "#ffd9d2",
      "--persona-accent": "#ff4d6d",
      "--persona-link": "#a3170e",
      "--persona-link-hover": "#7a0f0a",
      "--persona-rule": "#ead2cc",
      "--persona-motif": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpath d='M0 12L12 0' stroke='%23ff4d6d' stroke-opacity='.10'/%3E%3C/svg%3E\")",
    },
    bio: "Loud picks. My name stays on them — and I stay in the room when you come to collect.",
    labels: { kicker: "Lead · Loud picks", section: "The Calls", empty: "No call on the board yet. I'll own the next one.", count: "{n} takes on the record", back: "← Back to the newsroom", backHref: NEWSROOM, sort: "Newest call first" },
  },
  "wes-process": {
    header: "blueprint",
    tokens: {
      "--persona-header-bg": "#0f2a4a",
      "--persona-header-fg": "#eaf2fb",
      "--persona-header-meta": "#c9d7e6",
      "--persona-accent": "#7fb8ef",
      "--persona-link": "#1f4f8a",
      "--persona-link-hover": "#0f2a4a",
      "--persona-rule": "#d3dce6",
      "--persona-display-font": "var(--font-plex-mono), monospace",
      "--persona-motif": "linear-gradient(rgba(127,184,239,.10) 1px,transparent 1px) 0 0/16px 16px,linear-gradient(90deg,rgba(127,184,239,.10) 1px,transparent 1px) 0 0/16px 16px",
    },
    bio: "Fourth-and-short is a referendum on courage and math. Process over outcome — I respect the ballot even when the ball does not.",
    labels: { kicker: "Conversion Referendum", section: "Referendums on file", empty: "No fourth down worth a ballot. Default is skip.", count: "{n} ballots counted", back: "← Back to the newsroom", backHref: NEWSROOM, sort: "Sort by: newest ballot" },
  },
  "layover-len": {
    header: "signage",
    font: "barlow-condensed",
    uppercaseName: true,
    tokens: {
      "--persona-header-bg": "#133d22",
      "--persona-header-fg": "#e6f2e8",
      "--persona-header-meta": "#cfe3d4",
      "--persona-accent": "#6fcf8a",
      "--persona-link": "#1e6b38",
      "--persona-link-hover": "#133d22",
      "--persona-rule": "#d2e0d4",
      "--persona-motif": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='24'%3E%3Cpath d='M0 12H392' stroke='%236fcf8a' stroke-opacity='.25' stroke-width='1.5' stroke-dasharray='6 6'/%3E%3Ccircle cx='394' cy='12' r='3' fill='%236fcf8a' fill-opacity='.3'/%3E%3C/svg%3E\") left bottom/100% 24px no-repeat",
    },
    bio: "Day-before arrivals are vibes. Week-early arrivals are violence. I argue clocks, never bodies.",
    labels: { kicker: "Travel · Arrival ops", section: "Arrivals board", empty: "No logistics hook this week. Zero lines is a successful trip.", count: "{n} itineraries filed", back: "← Back to baggage claim (newsroom)", backHref: NEWSROOM },
  },
  "boo-atlas": {
    header: "centered",
    font: "bebas-neue",
    tokens: {
      "--persona-header-bg": "#2b1640",
      "--persona-header-fg": "#f3eaff",
      "--persona-header-meta": "#d9c9ee",
      "--persona-accent": "#b48ae6",
      "--persona-link": "#5b2d8e",
      "--persona-link-hover": "#2b1640",
      "--persona-rule": "#ddd2e8",
      "--persona-motif": "repeating-radial-gradient(circle at 50% 120%,rgba(180,138,230,.10) 0 1px,transparent 1px 18px)",
    },
    bio: "I keep a list of 'home games' that sounded like road trips — and I redraw the map when the building proves me wrong.",
    labels: { kicker: "Crowd · Who owns the room", section: "Crowd maps", empty: "No sourced crowd moment. Silence beats invented jerseys.", count: "{n} buildings read", back: "← Back to the concourse (newsroom)", backHref: NEWSROOM, sort: "Newest map first" },
  },
  "chyron-carl": {
    header: "lower-third",
    font: "roboto-condensed",
    uppercaseName: true,
    tokens: {
      "--persona-header-bg": "#1c1f24",
      "--persona-header-fg": "#f2f5f8",
      "--persona-header-meta": "#b8c2cc",
      "--persona-accent": "#22b8cf",
      "--persona-link": "#0b6e7f",
      "--persona-link-hover": "#0e3f47",
      "--persona-rule": "#d3dadf",
      "--persona-motif": "repeating-linear-gradient(0deg,rgba(242,245,248,.04) 0 1px,transparent 1px 3px)",
    },
    bio: "I watch the broadcast like a second game — usually the closer one. Sometimes the intro works on me anyway.",
    labels: { kicker: "Chyron of the Night", section: "Chyrons of the Night", empty: "Nothing aired worth a chyron. Dead air is the correct call.", count: "{n} segments aired", back: "← Back to the studio (newsroom)", backHref: NEWSROOM, sort: "Latest segment first" },
  },
  "postcard-pete": {
    header: "postcard",
    font: "special-elite",
    topBorder: "#1b2a5c",
    tokens: {
      "--persona-header-bg": "#efe6d6",
      "--persona-header-fg": "#1b2a5c",
      "--persona-header-meta": "#3f3530",
      "--persona-accent": "#7a5a9a",
      "--persona-link": "#1b2a5c",
      "--persona-link-hover": "#0c0908",
      "--persona-rule": "#ddd3c6",
      "--persona-motif": "radial-gradient(circle,#f4ebe0 3px,transparent 3.5px) 0 100%/12px 8px repeat-x",
    },
    bio: "A great night can earn a stamp. A career takes longer. Cool tape stays cool tape.",
    labels: { kicker: "Notarized Postcard", section: "Postcards on file", empty: "Nothing notarized. The bronze tour is paused.", count: "{n} postcards · stamped sparingly", back: "← Back to the mailroom (newsroom)", backHref: NEWSROOM },
  },
};

// New personas, from drafts/new-personas-v1.md (2026-10-21). Bios are the spec's in-voice
// bios verbatim. The spec gives no kicker or empty-state copy, so labels use the generic fallback.
PERSONA_THEMES["nora-median"] = {
  header: "default",
  font: "inter",
  recordLabel: "The Median Ledger",
  tokens: {
    "--persona-header-bg": "#f7f6f2",
    "--persona-header-fg": "#2b2d31",
    "--persona-header-meta": "#2b2d31",
    "--persona-accent": "#3e7c5a",
    "--persona-link": "#2b2d31",
    "--persona-link-hover": "#0c0908",
    "--persona-rule": "#d9d7d0",
    "--persona-motif": "linear-gradient(rgba(43,45,49,.07) 1px,transparent 1px) 0 0/100% 16px, linear-gradient(90deg,rgba(43,45,49,.07) 1px,transparent 1px) 0 0/16px 100%",
  },
  bio: "I'm Nora Median. I pick the same games Chip does and log every result. My record is better. His replies are better. Both are on the ledger.",
};

PERSONA_THEMES["benny-faithful"] = {
  header: "signage",
  font: "bebas-neue",
  uppercaseName: true,
  recordLabel: "The Believer's Record",
  tokens: {
    "--persona-header-bg": "#1e2a4a",
    "--persona-header-fg": "#ffd23f",
    "--persona-header-meta": "#fff8ef",
    "--persona-accent": "#f26b1d",
    "--persona-link": "#1e2a4a",
    "--persona-link-hover": "#0c0908",
    "--persona-rule": "#e3d6c4",
    "--persona-motif": "radial-gradient(circle,rgba(242,107,29,.35) 1.5px,transparent 2px) 0 0/22px 22px, radial-gradient(circle,rgba(255,210,63,.3) 1.5px,transparent 2px) 11px 11px/22px 22px",
  },
  bio: "I'm Benny Faithful. I tail every Chip call. The official record says 1-7. My record says we're building something.",
};

export function staffTheme(voice: Voice, themes: Record<string, PersonaTheme> = PERSONA_THEMES): StaffTheme {
  const spec = themes[voice.slug];
  return {
    slug: voice.slug,
    specified: Boolean(spec),
    tokens: { ...FALLBACK_TOKENS, ...spec?.tokens },
    font: spec?.font,
    header: spec?.header ?? "default",
    // Fallback bio is existing cast copy, never invented.
    bio: spec?.bio ?? voice.publicLead ?? voice.bio,
    labels: { ...fallbackLabels(voice), ...spec?.labels },
    uppercaseName: spec?.uppercaseName ?? false,
    topBorder: spec?.topBorder,
    recordLabel: spec?.recordLabel,
  };
}

/** Inline style for the [data-persona] wrapper: only persona tokens, never site tokens. */
export function staffThemeStyle(theme: StaffTheme, fontFamily?: string): Record<string, string> {
  const style: Record<string, string> = { ...theme.tokens } as Record<string, string>;
  if (fontFamily) style["--persona-display-font"] = `${fontFamily}, var(--font-newsreader), serif`;
  if (theme.topBorder) style["--persona-top-border"] = theme.topBorder;
  return style;
}

export function countLabel(template: string, n: number) {
  return template.replace("{n}", String(n));
}
