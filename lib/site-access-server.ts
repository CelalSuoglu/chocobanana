import { cookies } from "next/headers";
import {
  hasValidPreviewAccess,
  isComingSoonEnabled,
  previewCookieName,
} from "@/lib/site-access";
import { isPublicSiteOpen } from "@/lib/site/public-opening";

/**
 * True when the public must only see the countdown.
 * A valid preview cookie still sees the real site. During a recorded
 * 30-minute opening, everyone does. Database errors keep the countdown.
 */
export async function isComingSoonGateActive(): Promise<boolean> {
  if (!isComingSoonEnabled()) return false;
  const cookieStore = await cookies();
  if (hasValidPreviewAccess(cookieStore.get(previewCookieName)?.value)) {
    return false;
  }
  return !(await isPublicSiteOpen());
}
