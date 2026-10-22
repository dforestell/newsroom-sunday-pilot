import Link from "next/link";
import { StaffLink } from "@/components/staff-link";
import { getVoice } from "@/lib/cast";
import type { Call } from "@/lib/calls";
import { DEFAULT_PIECE_AUTHOR, type GamePiece } from "@/lib/games/pieces";

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
        </p>
      ) : null}
      {piece ? (
        <div className="space-y-3 text-base leading-relaxed">
          {piece.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>
      ) : null}
    </article>
  );
}
