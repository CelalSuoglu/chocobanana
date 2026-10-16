import "server-only";
import { headers } from "next/headers";
import { isNativeAppUserAgent } from "@/lib/native/user-agent";

export type NativePlatform = "ios" | "android";

export type NativeAppContext = {
  /** True only inside the Chocobanana iOS/Android shell (Capacitor). */
  isApp: boolean;
  platform: NativePlatform | null;
  /** The native build can register for push (Firebase present on Android). */
  pushCapable: boolean;
};

/**
 * Detects the native shell from the user agent the shell appends
 * (mobile/capacitor.config.ts). This only changes presentation: it never
 * grants access, so a spoofed user agent just shows the app layout.
 */
export function parseNativeAppUserAgent(userAgent: string | null): NativeAppContext {
  const ua = userAgent ?? "";
  if (!isNativeAppUserAgent(ua)) {
    return { isApp: false, platform: null, pushCapable: false };
  }
  const platform: NativePlatform | null = /Android/i.test(ua)
    ? "android"
    : /iPhone|iPad|iPod|Macintosh/i.test(ua)
      ? "ios"
      : null;
  return { isApp: true, platform, pushCapable: /\bPush\/1\b/.test(ua) };
}

export async function getNativeAppContext(): Promise<NativeAppContext> {
  const headerList = await headers();
  return parseNativeAppUserAgent(headerList.get("user-agent"));
}
