"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getOwnerPanelSecret,
  getOwnerPanelUnlockCookieValue,
  ownerPanelCookieName,
} from "@/lib/owner-access";
import { secretsEqual } from "@/lib/security/secrets";

export type OwnerGateState = {
  ok: boolean;
  error?: string;
};

const OWNER_PANEL_MAX_AGE = 60 * 60 * 24 * 60;

export async function unlockOwnerPanel(
  _prev: OwnerGateState,
  formData: FormData,
): Promise<OwnerGateState> {
  const expected = getOwnerPanelSecret();
  const token = getOwnerPanelUnlockCookieValue();
  if (!expected || !token) {
    return {
      ok: false,
      error: "OWNER_PANEL_SECRET is not set in this environment.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!secretsEqual(password, expected)) {
    return { ok: false, error: "Incorrect panel password." };
  }

  const jar = await cookies();
  jar.set(ownerPanelCookieName, token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: OWNER_PANEL_MAX_AGE,
  });

  redirect("/owner/login");
}

export async function lockOwnerPanel(): Promise<void> {
  const jar = await cookies();
  jar.delete(ownerPanelCookieName);
  redirect("/owner/gate");
}
