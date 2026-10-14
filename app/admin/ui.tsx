export const field = "w-full border border-border bg-card-loud px-3 py-2 text-base";
export const label = "block font-mono text-[11px] tracking-[0.12em] uppercase";
export const button = "inline-flex min-h-11 items-center border-2 border-border bg-card-loud px-4 font-mono text-sm uppercase";

export function NotConfigured() {
  return (
    <div className="max-w-xl space-y-2">
      <h1 className="font-heading text-3xl font-semibold">Admin</h1>
      <p className="text-ink-soft">Admin is not configured.</p>
    </div>
  );
}

export function LoginForm({ error }: { error?: boolean }) {
  return (
    <form method="post" action="/api/admin/login" className="max-w-sm space-y-4">
      <h1 className="font-heading text-3xl font-semibold">Admin sign in</h1>
      {error ? <p role="alert" className="text-warn">That email and password did not match.</p> : null}
      <label className="block space-y-1">
        <span className={label}>Email</span>
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label className="block space-y-1">
        <span className={label}>Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      <button type="submit" className={button}>Sign in</button>
    </form>
  );
}

export function SignOut({ email }: { email: string }) {
  return (
    <form method="post" action="/api/admin/logout" className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
      <span>Signed in as {email}</span>
      <button type="submit" className="underline underline-offset-4">Sign out</button>
    </form>
  );
}
