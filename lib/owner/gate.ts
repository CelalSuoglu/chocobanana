"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getOwnerPanelSecret,
  ownerPanelCookieName,
} from "@/lib/owner-access";

export type OwnerGateState = {
  ok: boolean;
  error?: string;
};

export async function unlockOwnerPanel(
  _prev: OwnerGateState,
  formData: FormData,
): Promise<OwnerGateState> {
  const expected = getOwnerPanelSecret();
  if (!expected) {
    return {
      ok: false,
      error: "OWNER_PANEL_SECRET is not set in this environment.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (password !== expected) {
    return { ok: false, error: "Incorrect panel password." };
  }

  const jar = await cookies();
  jar.set(ownerPanelCookieName, expected, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
  });

  redirect("/owner/login");
}
