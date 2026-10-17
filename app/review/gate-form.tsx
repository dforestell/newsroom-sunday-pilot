"use client";

import { useActionState } from "react";
import { unlockReview } from "@/app/review/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GateForm() {
  const [state, action, pending] = useActionState(unlockReview, undefined);

  return (
    <form action={action} className="max-w-md space-y-4 border border-ink/15 bg-card px-4 py-5">
      <div>
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">
          Private review
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Desk gate
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Desk-alias tape lives behind this phrase so it cannot ride the
          public Melbourne archive.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Desk phrase</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter the desk phrase"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Unlock review"}
      </Button>
    </form>
  );
}
