"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getComingSoonPreviewSecret,
  getPreviewUnlockCookieValue,
  previewCookieName,
} from "@/lib/site-access";
import { secretsEqual } from "@/lib/security/secrets";

export type PreviewGateState = {
  ok: boolean;
  error?: string;
};

const PREVIEW_MAX_AGE = 60 * 60 * 24 * 60;

export async function unlockSitePreview(
  _prev: PreviewGateState,
  formData: FormData,
): Promise<PreviewGateState> {
  const expected = getComingSoonPreviewSecret();
  const token = getPreviewUnlockCookieValue();
  if (!expected || !token) {
    return {
      ok: false,
      error: "COMING_SOON_PREVIEW_SECRET is not set in this environment.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!secretsEqual(password, expected)) {
    return { ok: false, error: "Incorrect preview password." };
  }

  const jar = await cookies();
  jar.set(previewCookieName, token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PREVIEW_MAX_AGE,
  });

  redirect("/en");
}

export async function lockSitePreview(): Promise<void> {
  const jar = await cookies();
  jar.delete(previewCookieName);
  redirect("/en");
}
