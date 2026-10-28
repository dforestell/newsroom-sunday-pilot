"use client";

import { useSyncExternalStore } from "react";

export function ThisLineReaction({ id }: { id: string }) {
  const key = `poor-form-this-line:${id}`;
  const lit = useSyncExternalStore(
    (notify) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) notify();
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
    () => window.localStorage.getItem(key) === "1",
    () => false,
  );

  return (
    <button
      type="button"
      aria-pressed={lit}
      onClick={() => {
        const next = !lit;
        window.localStorage.setItem(key, next ? "1" : "0");
        window.dispatchEvent(new StorageEvent("storage", { key }));
      }}
      className="mt-2 border border-border bg-paper px-2 py-1 font-mono text-xs tracking-wide text-ink-soft uppercase hover:border-masthead hover:text-masthead aria-pressed:border-masthead aria-pressed:bg-masthead aria-pressed:text-bar-foreground"
    >
      🔥 {lit ? "Saved line" : "Mark this line"}
    </button>
  );
}
