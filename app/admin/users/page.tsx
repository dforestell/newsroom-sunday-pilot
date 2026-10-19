import Link from "next/link";
import { redirect } from "next/navigation";
import { redisConfig } from "@/lib/admin/redis";
import { currentAdmin, isOwner } from "@/lib/admin/session";
import { UserStore, type PublicUser } from "@/lib/admin/users";
import { deleteUserAction, setUserDisabledAction } from "../actions";
import { CreateUserForm, ResetPasswordForm } from "../forms";

const small = "inline-flex min-h-11 items-center font-mono text-sm tracking-wide text-masthead uppercase underline-offset-4 hover:underline";

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const user = await currentAdmin();
  if (!user) redirect("/admin");
  if (!isOwner(user)) {
    return (
      <section className="max-w-xl space-y-3" data-denied>
        <h1 className="font-heading text-3xl font-semibold">Users</h1>
        <p role="alert" className="border-2 border-masthead px-4 py-3 text-sm">Only the owner can manage users.</p>
        <Link href="/admin" className={small}>← Admin</Link>
      </section>
    );
  }
  const params = await searchParams;
  const config = redisConfig();
  let users: PublicUser[] | null = null;
  try {
    users = config ? await new UserStore(config).list() : null;
  } catch {
    users = null;
  }
  return (
    <>
      <section className="space-y-2">
        <Link href="/admin" className={small}>← Admin</Link>
        <h1 className="font-heading text-3xl font-semibold">Users</h1>
        <p className="text-sm text-ink-soft">
          Editors can post stories and update calls. Only you (the owner, signed in from the environment settings) can manage users.
        </p>
      </section>
      {params.saved ? <p role="status" className="border-2 border-live-green px-4 py-2 text-sm">Saved: {String(params.saved)}</p> : null}
      {!users ? <p role="alert" className="border-2 border-masthead px-4 py-2 text-sm">The user store is not reachable right now. Try again shortly.</p> : null}

      <section aria-labelledby="users-list" className="space-y-3">
        <h2 id="users-list" className="font-heading text-2xl font-semibold">Editors</h2>
        {users && users.length ? (
          <ul className="divide-y divide-border border-y border-border">
            {users.map((item) => (
              <li key={item.username} className="space-y-3 py-4" data-user={item.username}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-heading text-lg font-semibold">{item.label}</p>
                    <p className="font-mono text-[13px] text-ink-soft uppercase">
                      {item.username} · {item.role} · {item.disabled ? "disabled" : "active"} · added {item.createdAt ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date(item.createdAt)) : "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <form action={setUserDisabledAction}>
                      <input type="hidden" name="username" value={item.username} />
                      <input type="hidden" name="disabled" value={item.disabled ? "false" : "true"} />
                      <button className={small}>{item.disabled ? "Enable" : "Disable"}</button>
                    </form>
                    <form action={deleteUserAction}>
                      <input type="hidden" name="username" value={item.username} />
                      <button className={small}>Delete</button>
                    </form>
                  </div>
                </div>
                <ResetPasswordForm username={item.username} />
              </li>
            ))}
          </ul>
        ) : users ? <p className="text-sm">No editors yet.</p> : null}
      </section>

      <section aria-labelledby="users-add" className="space-y-3">
        <h2 id="users-add" className="font-heading text-2xl font-semibold">Add a user</h2>
        <CreateUserForm />
      </section>
    </>
  );
}
