import { cookies, headers } from "next/headers";
import { isNativeAppUserAgent } from "@/lib/native/user-agent";
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
  // The iOS/Android app always shows the full shop.
  if (isNativeAppUserAgent((await headers()).get("user-agent"))) return false;
  const cookieStore = await cookies();
  if (hasValidPreviewAccess(cookieStore.get(previewCookieName)?.value)) {
    return false;
  }
  return !(await isPublicSiteOpen());
}
