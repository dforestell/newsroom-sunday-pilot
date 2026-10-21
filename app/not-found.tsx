import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="max-w-lg space-y-4">
      <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
        404
      </p>
      <h1 className="font-heading text-3xl font-semibold">Not on the desk</h1>
      <p className="text-sm text-ink/70">
        That page is not on Poor Form Sports.
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        Back to the front page
      </Link>
    </div>
  );
}
