/**
 * Owner-panel unlock — separate from the public coming-soon site unlock.
 *
 * When Production shows the countdown, visit:
 *   /owner/gate  (enter OWNER_PANEL_SECRET)
 * or:
 *   /owner?owner=YOUR_SECRET
 *
 * That sets an httpOnly cookie so only /owner/* is reachable without
 * unlocking the full customer storefront. Clear with ?owner=off
 */

export const ownerPanelCookieName = "cb_owner_panel";

export function getOwnerPanelSecret(): string | null {
  const raw = process.env.OWNER_PANEL_SECRET?.trim();
  return raw ? raw : null;
}

export function hasValidOwnerPanelAccess(
  cookieValue: string | undefined | null,
): boolean {
  const secret = getOwnerPanelSecret();
  if (!secret || !cookieValue) return false;
  return cookieValue === secret;
}

export function readOwnerPanelCookie(
  cookieHeader: string | null,
): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === ownerPanelCookieName) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}
