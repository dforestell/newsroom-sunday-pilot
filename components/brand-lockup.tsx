import Image from "next/image";
import Link from "next/link";

export function BrandLockup() {
  return (
    <Link href="/" className="flex min-w-0 max-w-full items-center gap-3 no-underline">
      <Image
        src="/brand/mark-cream.png"
        alt=""
        width={48}
        height={48}
        className="size-[22px] shrink-0 sm:size-8"
        priority
      />
      <span className="flex min-w-0 items-center gap-3">
        <span className="order-last hidden font-mono text-[11px] leading-snug tracking-[0.22em] text-masthead uppercase lg:inline">
          Poor Form Desk · Sunday pilot
        </span>
        <Image
          src="/brand/wordmark-cream.png"
          alt="Poor Form Sports"
          width={560}
          height={284}
          className="h-[22px] w-auto sm:h-8"
          priority
        />
      </span>
    </Link>
  );
}

export function BrandMark({
  size = 16,
  variant = "cream",
}: {
  size?: number;
  variant?: "cream" | "bar";
}) {
  return (
    <Image
      src={variant === "bar" ? "/brand/mark-bar.png" : "/brand/mark-cream.png"}
      alt=""
      width={size}
      height={size}
      className="inline-block shrink-0"
    />
  );
}
