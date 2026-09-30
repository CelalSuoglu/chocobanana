/**
 * Public site gate for the coming-soon countdown.
 *
 * Production: COMING_SOON_ENABLED=true (+ COMING_SOON_ENDS_AT).
 * Preview / local: leave COMING_SOON_ENABLED unset so the full shop works.
 *
 * While gated, unlock via the POST form at `/site-unlock` (not a URL query).
 * That sets an httpOnly cookie derived from COMING_SOON_PREVIEW_SECRET.
 * A verified owner can also open the public site for 30 minutes. That window
 * is stored in Postgres and checked on each request. It does not change
 * COMING_SOON_ENDS_AT, so the countdown resumes from the same end instant.
 * The countdown never auto-unlocks when it hits zero.
 */

import { unlockCookieToken } from "@/lib/security/secrets";
import { isPublicSiteOpen } from "@/lib/site/public-opening";

export const previewCookieName = "cb_site_preview";
export const previewUnlockPurpose = "chocobanana-site-preview-v1";

export function isComingSoonEnabled(): boolean {
  return process.env.COMING_SOON_ENABLED === "true";
}

export function getComingSoonPreviewSecret(): string | null {
  const raw = process.env.COMING_SOON_PREVIEW_SECRET?.trim();
  return raw ? raw : null;
}

export function getPreviewUnlockCookieValue(): string | null {
  const secret = getComingSoonPreviewSecret();
  if (!secret) return null;
  return unlockCookieToken(secret, previewUnlockPurpose);
}

export function hasValidPreviewAccess(
  cookieValue: string | undefined | null,
): boolean {
  const expected = getPreviewUnlockCookieValue();
  if (!expected || !cookieValue) return false;
  return cookieValue === expected;
}

/** Parse the preview cookie from a raw Cookie header (API routes). */
export function readPreviewCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === previewCookieName) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}

/**
 * True when this request must be treated as public coming-soon.
 * Preview unlock still bypasses the gate. A database error keeps the
 * countdown up. The 30-minute public window is the only other bypass.
 */
export async function isComingSoonGateActiveForRequest(
  request: Request,
): Promise<boolean> {
  if (!isComingSoonEnabled()) return false;
  if (hasValidPreviewAccess(readPreviewCookie(request.headers.get("cookie")))) {
    return false;
  }
  return !(await isPublicSiteOpen());
}

/**
 * Fixed end instant from env. Returns null when unset or invalid —
 * never invents a date or a rolling "40 days from now".
 */
export function getComingSoonEndsAt(): Date | null {
  const raw = process.env.COMING_SOON_ENDS_AT?.trim();
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function getComingSoonEndsAtIso(): string | null {
  const endsAt = getComingSoonEndsAt();
  return endsAt ? endsAt.toISOString() : null;
}
