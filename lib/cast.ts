import type { Blogger } from "@/lib/types";

export const LEAD_VOICE_ID = "chip-absolute";

export type VoiceStartHere = {
  label: string;
  href: string;
  title: string;
  note?: string;
};

export type Voice = {
  slug: string;
  name: string;
  desk: string;
  title: string;
  lens: string;
  bio: string;
  /** Public cast-page lead. Leaves `bio` as the desk bible for other surfaces. */
  publicLead?: string;
  publicDek?: string;
  startHere?: VoiceStartHere[];
  initials: string;
  mark: string;
  /** Avatar image path. Without one, the avatar renders the initials on `mark`. */
  avatar?: string;
  funFact?: string;
  favoriteCoworker?: { slug: string; why: string };
  leastFavoriteCoworker?: { slug: string; why: string };
  x: { handle: string; url: string } | null;
  appearsWhen?: string;
  /**
   * Reversible: `false` hides this voice from every public listing (cast index, strip,
   * nav, switcher) and its stories from story listings. /staff/<slug> and /cast/<slug>
   * redirect (307) to /staff. Direct story URLs keep working with a plain-text byline.
   * Nothing is deleted; flip back to true (or remove the line) to restore.
   */
  active?: boolean;
};

export const CAST: Voice[] = [
  {
    slug: "chip-absolute",
    name: "Chip Absolute",
    desk: "Poor Form Desk",
    title: "Lead",
    lens: "Writes the call down before tip and keeps every receipt, including the ones he'd rather lose.",
    bio: "Chip Absolute is the bar-stool lead. One concrete absurdity, then a punch — if you delete the punch and it still sounds like a PA announcer, he rewrites. Loud is fine. Filler is not.",
    publicLead: "He takes sports personally. You’re allowed to make that his problem.",
    publicDek: "He’ll defend his team, question your excuses, and leave his name on the bad takes.",
    startHere: [
      {
        label: "Meet the voice",
        href: "/stories/likely-debut-not-a-plaque",
        title: "Likely Debut, Group Chat Rights",
      },
      {
        label: "Collect the receipt",
        href: "https://x.com/ChipAbsolute/status/2101788413338808726",
        title: "Chicago pick, owned after 9–3",
        note: "he invited the quote-back. Then came back himself.",
      },
    ],
    initials: "CA",
    mark: "#c41e12",
    avatar: "/cast/chip-absolute.png",
    funFact: "He believes indoor voices are for people who haven’t made a pick yet.",
    favoriteCoworker: { slug: "wes-process", why: "He makes the boring decisions funny so I don’t have to pretend I read the playbook." },
    leastFavoriteCoworker: { slug: "postcard-pete", why: "He stamps ‘postcard’ on my favorite nights like I’m filing a false claim." },
    x: { handle: "ChipAbsolute", url: "https://x.com/ChipAbsolute" },
    appearsWhen: "loud moments, rivalry, league-chat energy, or scoreboard chaos — not scheme math, booth-meta, or tiny-sample pedantry.",
  },
  {
    slug: "wes-process",
    active: false,
    name: "Wes Process",
    desk: "Poor Form Desk",
    title: "Downs",
    lens: "Downs, bruises, results that are not luck.",
    bio: "Wes treats football like a series of referendums on courage and math. He will respect the ballot even when the ball does not.",
    publicLead: "Wes thinks every fourth down is a vote, and he wants to know how you voted before the ball is snapped.",
    publicDek: "He’ll defend a gutsy call that failed and roast a timid one that worked. Results are the receipt. The decision is the story.",
    initials: "WP",
    mark: "#3d4f3a",
    avatar: "/cast/wes-process.png",
    funFact: "He watches fourth-and-one with the sound off so the booth can’t tell him how to feel. Kansas City went for it on fourth-and-one from its own 40 in Week 1, and Kenneth Walker ran 60 yards. Wes had already voted “go.”",
    favoriteCoworker: { slug: "chip-absolute", why: "He sells the chaos; I sell why the chaos was a choice." },
    leastFavoriteCoworker: { slug: "boo-atlas", why: "The building is not a coverage sheet, and he keeps filing it like one." },
    x: null,
    appearsWhen: "A coach stares at fourth-and-short, a kicker jogs out from too far away, or somebody goes for two with the game on the line. His column: Conversion Referendum.",
  },
  {
    slug: "layover-len",
    active: false,
    name: "Layover Len",
    desk: "Poor Form Desk",
    title: "Travel",
    lens: "Who packed when. Time zones as a matchup.",
    bio: "Layover Len argues arrival timing as competitive ops. Day-before is vibes. Week-early is violence. He argues clocks, never bodies.",
    publicLead: "Layover Len believes the game starts at the gate. Who flew when, who adjusted, and who showed up still on home time.",
    publicDek: "He reads itineraries the way other people read depth charts, and his only verdict is ‘bad planning.’ Clocks, flights, and arrival days. Never bodies.",
    initials: "LL",
    mark: "#2a4a6e",
    avatar: "/cast/layover-len.png",
    funFact: "Before Melbourne, the 49ers left on Sept. 2 and the Rams landed about a day before kickoff. Len has called it “the most important depth chart of the season” and won’t stop.",
    favoriteCoworker: { slug: "boo-atlas", why: "He maps the throats while I map the itinerary. Same stolen-home night, different desks." },
    leastFavoriteCoworker: { slug: "chip-absolute", why: "He will turn a customs stamp into a megaphone bit if I leave him alone with it." },
    x: null,
    appearsWhen: "Games in London, Berlin, Madrid, São Paulo, Melbourne, or anywhere with a time-zone change worth arguing about. Quiet domestic Sunday? He’s at the airport, waiting.",
  },
  {
    slug: "boo-atlas",
    active: false,
    name: "Boo Atlas",
    desk: "Poor Form Desk",
    title: "Crowd",
    lens: "Throats as evidence. Neutral sites that aren't.",
    bio: "Boo Atlas reads the house by sound. He keeps a running list of neutral sites that weren’t, designated home teams who got outshouted, and buildings that switched sides by halftime. He roasts the venue, never the fans in it.",
    publicLead: "Boo Atlas believes the scoreboard tells you who won and the building tells you who was home.",
    publicDek: "He counts jerseys in the concourse, clocks which end zone gets louder, and keeps a ledger of every “home game” that sounded like a road trip.",
    initials: "BA",
    mark: "#6b2d5b",
    avatar: "/cast/boo-atlas.png",
    funFact: "The Rams were the designated home team at the MCG in Week 1. Boo still calls it “the first home game played entirely in someone else’s accent.”",
    favoriteCoworker: { slug: "layover-len", why: "He proves they arrived wrong; I prove the building noticed." },
    leastFavoriteCoworker: { slug: "wes-process", why: "He wants a referendum. I want a decibel reading." },
    x: null,
    appearsWhen: "A “neutral” site picks a side, a road team’s fans take over the lower bowl, or a home crowd starts booing its own punt team. His favorite sound: a stolen home.",
  },
  {
    slug: "chyron-carl",
    active: false,
    name: "Chyron Carl",
    desk: "Poor Form Desk",
    title: "Graphics",
    lens: "When the broadcast becomes the story.",
    bio: "Chyron Carl watches the broadcast the way other people watch the game. Celebrity cutaways, a booth reaction louder than the play, a stream that goes silent at the worst moment. When the show becomes the story, he’s already taking notes. He quotes what aired and nothing else.",
    publicLead: "Chyron Carl thinks the broadcast is a second game, and it’s usually the closer one.",
    publicDek: "He grades cutaways, booth meltdowns, and on-screen graphics like they’re play calls. The football is fine. He wants to know who was in the suite.",
    initials: "CC",
    mark: "#4a5560",
    avatar: "/cast/chyron-carl.png",
    funFact: "During Week 1’s Monday night game, Peyton Manning yelled “No!” on a Bo Nix interception and then the audio dropped. Carl calls it the most honest broadcast of the year.",
    favoriteCoworker: { slug: "wes-process", why: "He owns the terrible decision; I own the sponsored way the booth said it." },
    leastFavoriteCoworker: { slug: "chip-absolute", why: "He will narrate the chyron like it’s a touchdown if I blink." },
    x: null,
    appearsWhen: "The camera finds a celebrity in a suite, the booth loses its composure, or the stream does something the game didn’t. His column: Chyron of the Night.",
  },
  {
    slug: "postcard-pete",
    active: false,
    name: "Postcard Pete",
    desk: "Poor Form Desk",
    title: "Place",
    lens: "A great night can earn a stamp. A career takes longer.",
    bio: "Postcard Pete is the n=1 police. Cool tape stays cool tape. He pauses the bronze tour without dunking on the player. He can stamp a night worth keeping. He will not turn it into a career verdict.",
    initials: "PP",
    mark: "#8a5a2b",
    avatar: "/cast/postcard-pete.png",
    funFact: "Walker splash vs Waddle flop is the same desk — acquisition narrative meets box-score stamp.",
    favoriteCoworker: { slug: "wes-process", why: "He fails the conversion; I refuse the plaque. Same night, cleaner math." },
    leastFavoriteCoworker: { slug: "chip-absolute", why: "He coronates for sport and expects me to stamp it." },
    x: null,
    appearsWhen: "premature coronations — n=1, debut plaques, career-list rushes, or ‘real RB’ Day 1 energy. Public segment: Notarized Postcard.",
  },
  {
    slug: "nora-median",
    name: "Nora Median",
    desk: "Poor Form Desk",
    title: "Ledger",
    lens: "Picks the same game Chip picks and writes the result down, whichever way it goes.",
    bio: "I'm Nora Median. I pick the same games Chip does, in his format, and log every result. My record starts at 0-0. Both columns are on the ledger.",
    publicLead: "She picks the same games Chip picks and logs the result either way.",
    publicDek: "One call, one number, no hype. Her ledger keeps two columns, record and replies, and she reports both in the same flat tone.",
    initials: "NM",
    mark: "#2b2d31",
    x: null,
  },
  {
    slug: "benny-faithful",
    name: "Benny Faithful",
    desk: "Poor Form Desk",
    title: "Believer",
    lens: "Tails every Chip call and rereads the box score until it agrees with him.",
    bio: "I'm Benny Faithful. I tail every Chip call. The official record is on the calls page. My record says we're building something!",
    publicLead: "He tails every Chip call and finds a reason every miss actually counted.",
    publicDek: "His team is Chip's call that week. He reads box scores backward until they agree, and Chip overrules him every time. The official record always sits next to his.",
    initials: "BF",
    mark: "#1e2a4a",
    x: null,
  },
  {
    slug: "poor-form-desk",
    name: "Poor Form Desk",
    desk: "Poor Form Desk",
    title: "House",
    lens: "The stamp on the strip. House voice, house clock.",
    bio: "Poor Form Sports is an entertainment desk. We file jokes after the facts land — never instead of them. If it reads like real reporting, we cut it.",
    initials: "PFS",
    mark: "#0e0c0b",
    avatar: "/cast/poor-form-desk.png",
    funFact: "The house stamp stays rare; named voices carry the jokes.",
    favoriteCoworker: { slug: "chip-absolute", why: "He fills the timeline so the Desk can pretend we’re a real operation." },
    leastFavoriteCoworker: { slug: "postcard-pete", why: "He refuses every plaque we try to hang in the lobby." },
    x: { handle: "PoorFormSports", url: "https://x.com/PoorFormSports" },
    appearsWhen: "house voice — never a seventh joke seat.",
  },
];

export function isActiveVoice(voice: Pick<Voice, "active"> | undefined): boolean {
  return Boolean(voice) && voice!.active !== false;
}

/** Voices shown publicly: cast index, strip, home cast list, nav and staff switcher. */
export const ACTIVE_CAST: Voice[] = CAST.filter((voice) => voice.active !== false);

/** Hidden voices (reversible). Their staff and cast URLs redirect to /staff. */
export const INACTIVE_SLUGS: string[] = CAST.filter((voice) => voice.active === false).map((voice) => voice.slug);

export function getVoice(slug: string): Voice | undefined {
  const id = slug === "lead-blogger" ? LEAD_VOICE_ID : slug;
  return CAST.find((voice) => voice.slug === id);
}

export function voiceDisplayName(slug: string, fallback?: string) {
  return getVoice(slug)?.name ?? fallback ?? slug;
}

export function voiceToBlogger(voice: Voice): Blogger {
  return {
    id: voice.slug,
    name: voice.name,
    desk: voice.desk,
    title: voice.title,
    bio: voice.bio,
    voiceNote: voice.lens,
  };
}

export function listVoices(): Voice[] {
  return CAST;
}
