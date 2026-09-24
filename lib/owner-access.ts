/**
 * Owner-panel unlock — separate from the public coming-soon site unlock.
 *
 * When Production shows the countdown, open `/owner/gate` and enter
 * OWNER_PANEL_SECRET via the form (never as a URL query parameter).
 * That sets an httpOnly cookie derived from the secret so only /owner/*
 * is reachable without unlocking the full customer storefront.
 */

import { unlockCookieToken } from "@/lib/security/secrets";

export const ownerPanelCookieName = "cb_owner_panel";
export const ownerPanelUnlockPurpose = "chocobanana-owner-panel-v1";

export function getOwnerPanelSecret(): string | null {
  const raw = process.env.OWNER_PANEL_SECRET?.trim();
  return raw ? raw : null;
}

export function getOwnerPanelUnlockCookieValue(): string | null {
  const secret = getOwnerPanelSecret();
  if (!secret) return null;
  return unlockCookieToken(secret, ownerPanelUnlockPurpose);
}

export function hasValidOwnerPanelAccess(
  cookieValue: string | undefined | null,
): boolean {
  const expected = getOwnerPanelUnlockCookieValue();
  if (!expected || !cookieValue) return false;
  return cookieValue === expected;
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
