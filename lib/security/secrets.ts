import { createHmac, timingSafeEqual } from "crypto";

/** Constant-time string compare for secrets (UTF-8). */
export function secretsEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Cookie value derived from the panel/preview secret so the raw secret
 * is never stored in the browser cookie jar.
 */
export function unlockCookieToken(secret: string, purpose: string): string {
  return createHmac("sha256", secret).update(purpose).digest("hex");
}
