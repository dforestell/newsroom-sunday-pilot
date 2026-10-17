"use client";

import { useActionState } from "react";
import { loginAction, saveCallAction, saveStoryAction, type FormState } from "./actions";

const input = "w-full border border-border bg-paper px-3 py-2 text-base";
const label = "block space-y-1 text-sm font-medium";
const button = "inline-flex min-h-11 items-center border-2 border-border bg-ink px-4 font-mono text-sm tracking-wide text-paper uppercase disabled:opacity-60";

// Remount the form after a failed save so every field (including selects) shows the
// submitted values instead of React's post-action reset to the original defaults.
const formKey = (state: FormState) => JSON.stringify(state);

function Issues({ state }: { state: FormState }) {
  if (!state.issues.length) return null;
  return (
    <div role="alert" className="border-2 border-masthead bg-card px-4 py-3 text-sm">
      <p className="font-semibold">Not saved. Fix these and try again:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {state.issues.map((issue) => <li key={issue}>{issue}</li>)}
      </ul>
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { issues: [] });
  return (
    <form key={formKey(state)} action={action} className="max-w-sm space-y-4">
      <Issues state={state} />
      <label className={label}>Email<input name="login" type="email" autoComplete="username" required defaultValue={state.values?.login} className={input} /></label>
      <label className={label}>Password<input name="password" type="password" autoComplete="current-password" required className={input} /></label>
      <button className={button} disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export function StoryForm({ initial, voices, editing }: { initial: Record<string, string>; voices: { id: string; name: string }[]; editing: boolean }) {
  const [state, action, pending] = useActionState(saveStoryAction, { issues: [] });
  const v = state.values ?? initial;
  return (
    <form key={formKey(state)} action={action} className="space-y-4">
      <Issues state={state} />
      <input type="hidden" name="originalSlug" value={editing ? initial.slug : ""} />
      <label className={label}>Title<input name="title" required defaultValue={v.title} className={input} /></label>
      <label className={label}>Slug (public URL /stories/…; lowercase words and hyphens{editing ? "; cannot change" : ""})
        <input name="slug" required readOnly={editing} defaultValue={v.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={input} />
      </label>
      <label className={label}>Dek (one-line summary)<input name="dek" defaultValue={v.dek} className={input} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Voice
          <select name="voiceId" defaultValue={v.voiceId} className={input}>
            {voices.map((voice) => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
          </select>
        </label>
        <label className={label}>Date<input name="date" type="date" required defaultValue={v.date} className={input} /></label>
      </div>
      <label className={label}>Body (Markdown: ## headings, lists, links, tables. No raw HTML.)
        <textarea name="body" required rows={18} defaultValue={v.body} className={`${input} font-mono text-sm`} />
      </label>
      <label className={label}>Status
        <select name="status" defaultValue={v.status || "published"} className={input}>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished (hidden)</option>
        </select>
      </label>
      <p className="text-sm text-ink-soft">Admin stories always carry the SATIRE label.</p>
      <button className={button} disabled={pending}>{pending ? "Saving…" : "Save story"}</button>
    </form>
  );
}

export function CallForm({ initial, editing }: { initial: Record<string, string>; editing: boolean }) {
  const [state, action, pending] = useActionState(saveCallAction, { issues: [] });
  const v = state.values ?? initial;
  return (
    <form key={formKey(state)} action={action} className="space-y-4">
      <Issues state={state} />
      <input type="hidden" name="originalPostUrl" value={editing ? initial.postUrl : ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Date<input name="date" type="date" required defaultValue={v.date} className={input} /></label>
        <label className={label}>Window (optional, e.g. SNF)<input name="window" defaultValue={v.window} className={input} /></label>
      </div>
      <label className={label}>Game (e.g. DAL at GB)<input name="game" required defaultValue={v.game} className={input} /></label>
      <label className={label}>Take<input name="take" required defaultValue={v.take} className={input} /></label>
      <label className={label}>Post URL (https://x.com/ChipAbsolute/status/…{editing ? "; cannot change" : ""})
        <input name="postUrl" required readOnly={editing} defaultValue={v.postUrl} className={input} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Kind
          <select name="kind" defaultValue={v.kind || "forecast"} className={input}>
            <option value="forecast">Forecast (graded by the box score)</option>
            <option value="argument">Argument</option>
          </select>
        </label>
        <label className={label}>Status
          <select name="status" defaultValue={v.status || "pending"} className={input}>
            <option value="pending">Pending</option>
            <option value="held-up">Held up</option>
            <option value="missed">Missed</option>
            <option value="still-arguing">Still arguing</option>
            <option value="ungraded">Ungraded (not counted)</option>
          </select>
        </label>
      </div>
      <label className={label}>Criterion (optional, one line)<input name="criterion" defaultValue={v.criterion} className={input} /></label>
      <label className={label}>Result (verified, one line; leave empty while pending)<input name="result" defaultValue={v.result} className={input} /></label>
      <label className={label}>Note (optional, one line)<input name="note" defaultValue={v.note} className={input} /></label>
      <button className={button} disabled={pending}>{pending ? "Saving…" : "Save call"}</button>
    </form>
  );
}
