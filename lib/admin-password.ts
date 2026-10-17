import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { passwordHash: hash, passwordSalt: salt, passwordUpdatedAt: new Date().toISOString() };
}
export function verifyAdminPassword(password: string, salt: string, hash: string) {
  try {
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}
