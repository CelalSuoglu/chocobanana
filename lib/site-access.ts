/**
 * Public site gate for the coming-soon countdown.
 *
 * Production: set COMING_SOON_ENABLED=true (and COMING_SOON_ENDS_AT when ready).
 * Preview / local: leave COMING_SOON_ENABLED unset or false so the full shop works.
 *
 * Opening the full site is a manual env flip — the countdown never auto-unlocks.
 */

export function isComingSoonEnabled(): boolean {
  return process.env.COMING_SOON_ENABLED === "true";
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
