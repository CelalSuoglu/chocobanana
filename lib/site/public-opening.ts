import { getPrisma, isDatabaseConfigured, requirePrisma } from "@/lib/db";

/** Single row. Absence means the public countdown stays up. */
export const PUBLIC_SITE_OPENING_ID = "public";

/** Exact window written by the owner action. Not taken from the browser. */
export const PUBLIC_SITE_OPENING_MS = 30 * 60 * 1000;

export type PublicSiteOpening = {
  startsAt: Date;
  endsAt: Date;
};

/** Open only when now is at or after the start and strictly before the end. */
export function isOpeningActiveAt(
  opening: PublicSiteOpening | null,
  now: Date,
): boolean {
  if (!opening) return false;
  const time = now.getTime();
  return time >= opening.startsAt.getTime() && time < opening.endsAt.getTime();
}

export function formatTorontoDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

/**
 * Fail closed. A missing row or any database error means the public site
 * stays on the countdown.
 */
export async function isPublicSiteOpen(now = new Date()): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const prisma = getPrisma();
  if (!prisma) return false;
  try {
    const row = await prisma.publicSiteOpening.findUnique({
      where: { id: PUBLIC_SITE_OPENING_ID },
      select: { startsAt: true, endsAt: true },
    });
    return isOpeningActiveAt(row, now);
  } catch {
    return false;
  }
}

export async function readPublicSiteOpening(): Promise<PublicSiteOpening | null> {
  if (!isDatabaseConfigured()) return null;
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.publicSiteOpening.findUnique({
      where: { id: PUBLIC_SITE_OPENING_ID },
      select: { startsAt: true, endsAt: true },
    });
  } catch {
    return null;
  }
}

export async function openPublicSiteForThirtyMinutes(now = new Date()) {
  const prisma = requirePrisma();
  const startsAt = now;
  const endsAt = new Date(startsAt.getTime() + PUBLIC_SITE_OPENING_MS);
  await prisma.publicSiteOpening.upsert({
    where: { id: PUBLIC_SITE_OPENING_ID },
    create: { id: PUBLIC_SITE_OPENING_ID, startsAt, endsAt },
    update: { startsAt, endsAt },
  });
  return { startsAt, endsAt };
}

/** Ends the window immediately. The countdown end date in env is untouched. */
export async function closePublicSiteNow(now = new Date()) {
  const prisma = requirePrisma();
  await prisma.publicSiteOpening.upsert({
    where: { id: PUBLIC_SITE_OPENING_ID },
    create: {
      id: PUBLIC_SITE_OPENING_ID,
      startsAt: now,
      endsAt: now,
    },
    update: { endsAt: now },
  });
}
