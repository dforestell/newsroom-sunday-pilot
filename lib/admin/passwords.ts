// Password hashing with scrypt (node:crypto) and a per-user random salt.
// Never log passwords or hashes.
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const N = 16_384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
export const MIN_PASSWORD_LENGTH = 12;

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), salt, keyLength, options, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

/** Format: scrypt$N$r$p$<salt base64url>$<hash base64url> */
export async function hashPassword(password: string, salt: Buffer = randomBytes(SALT_BYTES)): Promise<string> {
  const key = await scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [n, r, p] = parts.slice(1, 4).map(Number);
  if (![n, r, p].every((value) => Number.isInteger(value) && value > 0) || n > 1 << 20) return false;
  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  if (!salt.length || !expected.length) return false;
  const actual = await scrypt(password, salt, expected.length, { N: n, r, p, maxmem: 256 * n * r + 1024 * 1024 });
  return timingSafeEqual(actual, expected);
}

export function passwordIssues(password: string, confirm?: string): string[] {
  const issues: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) issues.push(`Password: use at least ${MIN_PASSWORD_LENGTH} characters.`);
  if (confirm !== undefined && confirm !== password) issues.push("Confirm password: the two passwords do not match.");
  return issues;
}
