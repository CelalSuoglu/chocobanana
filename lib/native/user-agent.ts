/** Marker the Chocobanana iOS/Android shell appends to its user agent (mobile/capacitor.config.ts). */
const APP_UA = /\bChocobananaApp\/\d/;

export function isNativeAppUserAgent(userAgent: string | null | undefined): boolean {
  return APP_UA.test(userAgent ?? "");
}
