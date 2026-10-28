import Link from "next/link";
import { StaffLink } from "@/components/staff-link";
import { getVoice } from "@/lib/cast";
import type { Call } from "@/lib/calls";
import { CallStatusTag } from "@/components/calls-record";
import { DEFAULT_PIECE_AUTHOR, parseBodyLinks, type GamePiece } from "@/lib/games/pieces";

/** Leads a game page: headline, byline, Chip's call (linked to /calls), short body. */
export function GamePieceLead({ piece, call }: { piece: GamePiece | null; call: Call | null }) {
  if (!piece && !call) return null;
  const author = piece?.author ?? DEFAULT_PIECE_AUTHOR;
  const name = getVoice(author)?.name ?? "Chip Absolute";
  return (
    <article data-game-piece className="max-w-3xl space-y-4 border-t border-ink/15 pt-6">
      {piece ? (
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{piece.headline}</h1>
      ) : null}
      <p className="font-mono text-sm tracking-wide text-ink-soft uppercase">
        By <StaffLink slug={author} className="text-masthead underline-offset-4 hover:underline">{name}</StaffLink>
      </p>
      {call ? (
        <p data-game-call className="border-l-4 border-masthead pl-4 text-lg">
          <Link href="/calls" className="font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline">
            Chip’s call
          </Link>
          <span className="block font-heading text-xl font-semibold">{call.take}</span>
          {call.status !== "pending" ? (
            <span data-game-call-grade className="mt-2 flex flex-wrap items-center gap-2 text-base text-ink-soft">
              <CallStatusTag status={call.status} />
              {call.result ? <span>{call.result}</span> : null}
            </span>
          ) : null}
        </p>
      ) : null}
      {piece && call && call.status !== "pending" ? (
        <p className="font-mono text-xs tracking-wide text-ink-soft uppercase">Filed before kickoff</p>
      ) : null}
      {piece ? (
        <div className="space-y-3 text-base leading-relaxed">
          {piece.body.map((paragraph, i) => (
            <p key={i}>
              {parseBodyLinks(paragraph).map((seg, j) =>
                seg.href ? (
                  <Link key={j} href={seg.href} className="text-masthead underline underline-offset-4">{seg.text}</Link>
                ) : (
                  <span key={j}>{seg.text}</span>
                ),
              )}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  );
}
