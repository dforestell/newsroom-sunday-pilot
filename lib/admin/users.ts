// Editor accounts stored in Redis (hash admin:users:v1, field = username).
import { ADMIN_USERS_KEY } from "./keys.ts";
import { hashPassword, passwordIssues, verifyPassword } from "./passwords.ts";
import { redisPipeline, type Fetcher, type RedisConfig } from "./redis.ts";

export const OWNER_USERNAME = "dillon";
export const RESERVED_USERNAMES = [OWNER_USERNAME];

export type StoredUser = {
  username: string;
  label: string;
  role: "editor";
  passwordHash: string;
  createdAt: string;
  disabled: boolean;
};

/** What the admin UI may see: never the hash. */
export type PublicUser = Omit<StoredUser, "passwordHash">;

export function usernameIssues(username: string): string[] {
  if (!/^[a-z0-9-]{2,32}$/.test(username)) return ["Username: use 2–32 lowercase letters, digits or hyphens."];
  if (RESERVED_USERNAMES.includes(username)) return [`Username: "${username}" is reserved.`];
  return [];
}

export function labelIssues(label: string): string[] {
  const value = label.trim();
  if (!value) return ["Display name: add a name, e.g. Chip Absolute."];
  if (value.length > 64 || /[\r\n]/.test(value)) return ["Display name: keep it to one line, 64 characters or fewer."];
  return [];
}

function parseUser(value: unknown): StoredUser | null {
  if (typeof value !== "string") return null;
  try {
    const data = JSON.parse(value) as Partial<StoredUser>;
    if (typeof data.username !== "string" || typeof data.passwordHash !== "string" || typeof data.label !== "string") return null;
    return { username: data.username, label: data.label, role: "editor", passwordHash: data.passwordHash, createdAt: String(data.createdAt ?? ""), disabled: data.disabled === true };
  } catch {
    return null;
  }
}

export const toPublic = ({ passwordHash: _hash, ...user }: StoredUser): PublicUser => (void _hash, user);

type Options = { fetcher?: Fetcher };

export class UserStore {
  constructor(private config: RedisConfig, private options: Options = {}) {}

  private run(commands: string[][]) {
    return redisPipeline(this.config, commands, this.options);
  }

  async get(username: string): Promise<StoredUser | null> {
    const [value] = await this.run([["HGET", ADMIN_USERS_KEY, username]]);
    return parseUser(value);
  }

  async list(): Promise<PublicUser[]> {
    const [reply] = await this.run([["HGETALL", ADMIN_USERS_KEY]]);
    const users: PublicUser[] = [];
    if (Array.isArray(reply)) for (let i = 1; i < reply.length; i += 2) {
      const user = parseUser(reply[i]);
      if (user) users.push(toPublic(user));
    }
    return users.sort((a, b) => a.username.localeCompare(b.username));
  }

  private async put(user: StoredUser) {
    await this.run([["HSET", ADMIN_USERS_KEY, user.username, JSON.stringify(user)]]);
  }

  async create(input: { username: string; label: string; password: string; confirm: string }, now = new Date()): Promise<string[]> {
    const username = input.username.trim();
    const issues = [...usernameIssues(username), ...labelIssues(input.label), ...passwordIssues(input.password, input.confirm)];
    if (issues.length) return issues;
    const passwordHash = await hashPassword(input.password);
    const user: StoredUser = { username, label: input.label.trim(), role: "editor", passwordHash, createdAt: now.toISOString(), disabled: false };
    // HSETNX so two owners racing cannot overwrite an existing account.
    const [created] = await this.run([["HSETNX", ADMIN_USERS_KEY, username, JSON.stringify(user)]]);
    return Number(created) === 1 ? [] : [`Username: "${username}" already exists.`];
  }

  async resetPassword(username: string, password: string, confirm: string): Promise<string[]> {
    const issues = passwordIssues(password, confirm);
    if (issues.length) return issues;
    const user = await this.get(username);
    if (!user) return ["That user no longer exists."];
    await this.put({ ...user, passwordHash: await hashPassword(password) });
    return [];
  }

  async setDisabled(username: string, disabled: boolean): Promise<string[]> {
    const user = await this.get(username);
    if (!user) return ["That user no longer exists."];
    await this.put({ ...user, disabled });
    return [];
  }

  async remove(username: string): Promise<void> {
    await this.run([["HDEL", ADMIN_USERS_KEY, username]]);
  }

  /** Returns the user only for an enabled account with the right password. */
  async verify(username: string, password: string): Promise<StoredUser | null> {
    if (usernameIssues(username).length) return null;
    const user = await this.get(username);
    if (!user || user.disabled) return null;
    return (await verifyPassword(password, user.passwordHash)) ? user : null;
  }
}
