// In-memory fake of the Upstash REST /pipeline endpoint, for tests. Supports the
// commands the admin uses. TTLs are honoured with an injectable clock.
export function fakeRedis({ now = () => Date.now() } = {}) {
  const strings = new Map<string, { value: string; expires?: number }>();
  const hashes = new Map<string, Map<string, string>>();
  let down = false;
  const live = (key: string) => {
    const entry = strings.get(key);
    if (entry?.expires !== undefined && entry.expires <= now()) strings.delete(key);
    return strings.get(key);
  };
  const hash = (key: string) => hashes.get(key) ?? hashes.set(key, new Map()).get(key)!;
  const run = ([command, key, ...args]: string[]) => {
    switch (command.toUpperCase()) {
      case "GET": return live(key)?.value ?? null;
      case "SET": {
        const nx = args.includes("NX");
        if (nx && live(key)) return null;
        const ex = args.indexOf("EX");
        strings.set(key, { value: args[0], expires: ex >= 0 ? now() + Number(args[ex + 1]) * 1000 : undefined });
        return "OK";
      }
      case "INCR": {
        const entry = live(key);
        const value = Number(entry?.value ?? 0) + 1;
        strings.set(key, { value: String(value), expires: entry?.expires });
        return value;
      }
      case "DEL": return strings.delete(key) ? 1 : 0;
      case "HGET": return hash(key).get(args[0]) ?? null;
      case "HGETALL": return [...hash(key)].flat();
      case "HSET": { const isNew = !hash(key).has(args[0]); hash(key).set(args[0], args[1]); return isNew ? 1 : 0; }
      case "HSETNX": { if (hash(key).has(args[0])) return 0; hash(key).set(args[0], args[1]); return 1; }
      case "HDEL": return hash(key).delete(args[0]) ? 1 : 0;
      default: throw new Error(`unsupported ${command}`);
    }
  };
  const fetcher = (async (_url: string, init?: RequestInit) => {
    if (down) throw new TypeError("fetch failed");
    const commands = JSON.parse(String(init?.body)) as string[][];
    return Response.json(commands.map((command) => ({ result: run(command) })));
  }) as typeof fetch;
  return {
    fetcher,
    hashes,
    strings,
    setDown(value: boolean) { down = value; },
    config: { url: "https://fake.redis", token: "t" },
  };
}
