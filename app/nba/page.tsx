import { SportHub } from "@/components/sport-hub";
import { listPublicCalls } from "@/lib/calls";
import { listPublicStories } from "@/lib/stories";
import { shareMetadata } from "@/lib/share";
import { HOU_SAS_GAME, HOU_SAS_HOOKS } from "@/lib/nba/hou-sas-2026-10-23";

export const revalidate = 30;

export const metadata = shareMetadata("NBA", "Chip Absolute’s NBA calls, the desk’s NBA columns and game hooks.");

const sourceLink = "inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline";

export default async function NbaHub() {
  const [calls, stories] = await Promise.all([listPublicCalls(), listPublicStories()]);
  return (
    <SportHub sport="NBA" intro="Chip’s NBA calls, the desk’s NBA columns and the hooks for the next big game." calls={calls} stories={stories}>
      <section aria-labelledby="game-hooks" className="space-y-3">
        <div>
          <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Game hooks</p>
          <h2 id="game-hooks" className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">{HOU_SAS_GAME.matchup}</h2>
          <p className="mt-1 font-mono text-[13px] tracking-wide text-ink-soft uppercase">
            {HOU_SAS_GAME.when} · {HOU_SAS_GAME.tv} · {HOU_SAS_GAME.venue}
          </p>
          <a href={HOU_SAS_GAME.source.url} target="_blank" rel="noopener noreferrer" className={sourceLink}>{HOU_SAS_GAME.source.label}</a>
        </div>
        <ul className="grid gap-3 md:grid-cols-3">
          {HOU_SAS_HOOKS.map((hook) => (
            <li key={hook.kicker} className="flex flex-col border border-border bg-card px-4 py-3">
              <p className="font-mono text-[13px] tracking-wide text-masthead uppercase">{hook.kicker}</p>
              <p className="mt-1 flex-1 text-sm leading-6">{hook.fact}</p>
              <a href={hook.source.url} target="_blank" rel="noopener noreferrer" className={sourceLink}>Source: {hook.source.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </SportHub>
  );
}
