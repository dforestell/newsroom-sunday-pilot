import Link from "next/link";
import { notFound } from "next/navigation";
import { DeskPill } from "@/components/desk-pill";
import { AssignedScorebug } from "@/components/scorebug";
import { VoiceAvatar } from "@/components/voice-avatar";
import { CAST, LEAD_VOICE_ID, getVoice } from "@/lib/cast";
import { demoGamesForVoice, gamesForBlogger } from "@/lib/live/public";
import { shareMetadata } from "@/lib/share";

export function generateStaticParams() {
  return CAST.map((voice) => ({ slug: voice.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/cast/[slug]">) {
  const { slug } = await params;
  const voice = getVoice(slug);
  return voice
    ? shareMetadata(
        `${voice.name} · ${voice.title}`,
        `${voice.publicLead ?? voice.bio} Poor Form Sports.`,
      )
    : { title: "Cast" };
}

export default async function CastVoicePage({
  params,
}: PageProps<"/cast/[slug]">) {
  const { slug } = await params;
  const voice = getVoice(slug);
  if (!voice) {
    notFound();
  }

  const assigned = gamesForBlogger(voice.slug);
  const demoAssignments = demoGamesForVoice(voice.slug);
  const lead = voice.slug === LEAD_VOICE_ID;
  const favorite = getVoice(voice.favoriteCoworker.slug);
  const leastFavorite = getVoice(voice.leastFavoriteCoworker.slug);

  return (
    <div className="space-y-6">
      <p className="flex min-w-0 flex-wrap items-center gap-x-2 font-mono text-[11px] tracking-wide uppercase">
        <Link href="/cast" className="inline-flex min-h-11 items-center text-ink-soft hover:text-masthead">
          Cast
        </Link>
        <span className="text-ink/30" aria-hidden="true">/</span>
        <span className="min-w-0 break-words">{voice.name}</span>
      </p>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <VoiceAvatar
          voice={voice}
          size={lead ? 160 : 112}
          labelled
          className={
            lead
              ? "size-[88px] shrink-0 sm:size-32"
              : "size-20 shrink-0 sm:size-24"
          }
        />
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            {voice.desk}
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight break-words sm:text-5xl">
            {voice.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {lead ? <DeskPill tone="lead">Lead</DeskPill> : (
              <DeskPill tone="outline">{voice.title}</DeskPill>
            )}
            {lead ? (
              <span className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                Files after the facts land
              </span>
            ) : null}
            {demoAssignments.length > 0 ? <DeskPill tone="demo">On assignment</DeskPill> : null}
          </div>
          {voice.publicLead ? (
            <>
              <p className="max-w-2xl text-base font-semibold leading-7 text-ink">
                {voice.publicLead}
              </p>
              {voice.publicDek ? (
                <p className="max-w-2xl text-base leading-7 text-ink/80">
                  {voice.publicDek}
                </p>
              ) : null}
            </>
          ) : (
            <p className="max-w-2xl text-base leading-7 text-ink">{voice.bio}</p>
          )}
        </div>
      </section>

      {voice.startHere?.length ? (
        <section className="max-w-2xl space-y-3 border border-border bg-card p-4">
          <h2 className="font-heading text-xl font-semibold">Start here</h2>
          <ul className="space-y-2 text-sm leading-6 text-ink">
            {voice.startHere.map((item) => {
              const external = item.href.startsWith("http");
              const linkClass = "font-medium underline-offset-4 hover:underline";
              const link = external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {item.title}
                </a>
              ) : (
                <Link href={item.href} className={linkClass}>
                  {item.title}
                </Link>
              );
              return (
                <li key={item.href}>
                  <strong>{item.label}:</strong> {link}
                  {item.note ? ` — ${item.note}` : null}
                </li>
              );
            })}
          </ul>
          {voice.slug === "chip-absolute" ? (
            <p className="text-sm leading-6 text-ink">
              <Link href="/calls" className="font-medium underline-offset-4 hover:underline">
                Chip’s calls
              </Link>
              <span className="text-ink-soft"> — his takes, and how each one held up.</span>
            </p>
          ) : null}
          {voice.x ? (
            <a
              href={voice.x.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center border border-border bg-card-loud px-3 font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
            >
              Follow Chip on X
            </a>
          ) : null}
          <p className="text-sm italic text-ink-soft">
            Fictional columnist. Sports satire, not reporting.
          </p>
        </section>
      ) : null}

      <section className="grid gap-px border border-border bg-border sm:grid-cols-2">
        <div className="bg-card p-4">
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Fun fact</p>
          <p className="mt-2 text-sm leading-6 text-ink">{voice.funFact}</p>
        </div>
        <div className="bg-card p-4">
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Appears when</p>
          <p className="mt-2 text-sm leading-6 text-ink">{voice.appearsWhen}</p>
        </div>
        <div className="bg-card p-4">
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Favorite coworker</p>
          <p className="mt-2 text-sm leading-6 text-ink">
            {favorite ? <Link href={`/cast/${favorite.slug}`} className="font-medium underline-offset-4 hover:underline">{favorite.name}</Link> : "The desk"}
            {" · "}{voice.favoriteCoworker.why}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Least favorite coworker</p>
          <p className="mt-2 text-sm leading-6 text-ink">
            {leastFavorite ? <Link href={`/cast/${leastFavorite.slug}`} className="font-medium underline-offset-4 hover:underline">{leastFavorite.name}</Link> : "The desk"}
            {" · "}{voice.leastFavoriteCoworker.why}
          </p>
        </div>
      </section>

      {!voice.startHere?.length && (voice.x ? (
        <a
          href={voice.x.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center border border-border bg-card-loud px-3 font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline"
        >
          Follow @{voice.x.handle} on X
        </a>
      ) : (
        <span className="inline-flex items-center border border-border bg-card-loud px-3 py-2 font-mono text-[13px] tracking-wide text-ink-soft uppercase">
          X account coming soon
        </span>
      ))}

      <section className="border border-border bg-card-loud py-4 pr-4 pl-0">
        <div className="border-l-[6px] border-masthead px-4">
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
            Lens
          </p>
          <p className="mt-2 font-heading text-2xl leading-snug text-ink italic sm:text-[28px]">
            {voice.lens}
          </p>
        </div>
      </section>

      {voice.slug === "poor-form-desk" ? (
        <p className="text-sm text-ink-soft">
          House desk. Holds the PFS stamp. Jokes stay on the named voices.
        </p>
      ) : null}

      <section className="space-y-3">
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
          On the board
        </p>
        <h2 className="font-heading text-2xl font-semibold">Assigned games</h2>
        {assigned.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No game assigned on the public board. Voice still sits on the Poor
            Form Desk strip.
          </p>
        ) : (
          <ul className="space-y-3">
            {assigned.map((game) => (
              <li key={game.id}>
                {game.demo ? (
                  <AssignedScorebug game={game} />
                ) : (
                  <Link
                    href={`/games/${game.id}`}
                    className="block border border-border bg-card px-4 py-3 sm:px-5 sm:py-4"
                  >
                    <p className="font-heading text-lg font-semibold">
                      {game.name}
                    </p>
                    <p className="font-mono text-[13px] tracking-wide text-ink-soft uppercase">
                      {game.away.short} — {game.home.short}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {demoAssignments.length > 0 ? (
        <section className="space-y-3">
          <p className="font-mono text-[11px] tracking-[0.18em] text-demo uppercase">On assignment</p>
          <h2 className="font-heading text-2xl font-semibold">Archive lines</h2>
          <div className="flex flex-wrap gap-2">
            {demoAssignments.map((game) => (
              <Link key={game.id} href={`/games/${game.id}`} className="inline-flex min-h-11 items-center border border-border bg-card px-3 text-sm underline-offset-4 hover:underline">
                {game.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
