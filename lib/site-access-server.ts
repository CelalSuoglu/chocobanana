import { cookies } from "next/headers";
import {
  hasValidPreviewAccess,
  isComingSoonEnabled,
  previewCookieName,
} from "@/lib/site-access";

/**
 * True when the public must only see the countdown (Production gate on,
 * and this visitor has not unlocked with the preview secret).
 */
export async function isComingSoonGateActive(): Promise<boolean> {
  if (!isComingSoonEnabled()) return false;
  const cookieStore = await cookies();
  return !hasValidPreviewAccess(cookieStore.get(previewCookieName)?.value);
}
