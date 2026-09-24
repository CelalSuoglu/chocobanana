/**
 * Public site gate for the coming-soon countdown.
 *
 * Production: COMING_SOON_ENABLED=true (+ COMING_SOON_ENDS_AT).
 * Preview / local: leave COMING_SOON_ENABLED unset so the full shop works.
 *
 * While gated, unlock via the POST form at `/site-unlock` (not a URL query).
 * That sets an httpOnly cookie derived from COMING_SOON_PREVIEW_SECRET.
 * Opening the site for everyone: set COMING_SOON_ENABLED=false and redeploy.
 * The countdown never auto-unlocks when it hits zero.
 */

import { unlockCookieToken } from "@/lib/security/secrets";

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
 * True when this request must be treated as public coming-soon
 * (gate on, no valid preview unlock cookie).
 */
export function isComingSoonGateActiveForRequest(request: Request): boolean {
  if (!isComingSoonEnabled()) return false;
  return !hasValidPreviewAccess(
    readPreviewCookie(request.headers.get("cookie")),
  );
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
