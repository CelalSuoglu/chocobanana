"use client";

import { addPluginListener, callPlugin, nativePlatform } from "@/lib/native/bridge";

export type PushPermission = "prompt" | "granted" | "denied" | "unavailable";

const TOKEN_KEY = "chocobanana_push_token_v1";

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: the server copy is the source of truth */
  }
}

export async function checkPushPermission(): Promise<PushPermission> {
  try {
    const result = await callPlugin<{ receive?: string }>("PushNotifications", "checkPermissions");
    if (result?.receive === "granted") return "granted";
    if (result?.receive === "denied") return "denied";
    return "prompt";
  } catch {
    return "unavailable";
  }
}

/** Only ever called from a user tap (Account → Notifications). */
export async function requestPushPermission(): Promise<PushPermission> {
  try {
    const result = await callPlugin<{ receive?: string }>("PushNotifications", "requestPermissions");
    if (result?.receive === "granted") return "granted";
    if (result?.receive === "denied") return "denied";
    return "prompt";
  } catch {
    return "unavailable";
  }
}

/** Asks the OS for a device token (APNs on iOS, FCM on Android). */
function obtainDeviceToken(timeoutMs = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    const cleanups: Array<() => void> = [];
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanups.forEach((c) => c());
      fn();
    };
    const timer = setTimeout(() => finish(() => reject(new Error("push_timeout"))), timeoutMs);

    void (async () => {
      cleanups.push(
        await addPluginListener("PushNotifications", "registration", (data) => {
          const value = (data as { value?: unknown })?.value;
          if (typeof value === "string" && value) finish(() => resolve(value));
        }),
      );
      cleanups.push(
        await addPluginListener("PushNotifications", "registrationError", () =>
          finish(() => reject(new Error("push_registration_error"))),
        ),
      );
      try {
        await callPlugin("PushNotifications", "register");
      } catch {
        finish(() => reject(new Error("push_register_failed")));
      }
    })();
  });
}

async function postJson(method: "POST" | "DELETE", body: Record<string, unknown>) {
  const response = await fetch("/api/push/devices", {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`push_api_${response.status}`);
}

/**
 * Registers this device for the signed-in member. Safe to call repeatedly:
 * tokens can rotate, and the server upserts by token.
 */
export async function syncPushRegistration(locale: string): Promise<void> {
  const platform = nativePlatform();
  if (!platform) throw new Error("not_native");
  const token = await obtainDeviceToken();
  await postJson("POST", { token, platform, locale });
  storeToken(token);
}

/** Detaches this device from the account (used after sign-out). */
export async function forgetPushRegistration(): Promise<void> {
  const token = readStoredToken();
  if (!token) return;
  try {
    await postJson("DELETE", { token });
  } finally {
    storeToken(null);
  }
}

export function hasStoredPushToken(): boolean {
  return Boolean(readStoredToken());
}
