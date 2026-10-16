import "server-only";
import { createSign } from "crypto";
import type { PushMessage, SendResult } from "./apns";

/**
 * Firebase Cloud Messaging HTTP v1 for Android.
 * Env (server only): FCM_SERVICE_ACCOUNT_JSON — the Firebase service-account
 * JSON, raw or base64-encoded. The app itself only carries google-services.json,
 * which is a public client config, not this key.
 */
type ServiceAccount = { project_id: string; client_email: string; private_key: string; token_uri?: string };

function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const text = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(text) as Partial<ServiceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;
    return parsed as ServiceAccount;
  } catch {
    return null;
  }
}

export function isFcmConfigured(): boolean {
  return readServiceAccount() !== null;
}

let cachedAccess: { token: string; expiresAt: number; email: string } | null = null;

async function accessToken(account: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccess && cachedAccess.email === account.client_email && cachedAccess.expiresAt - 60 > now) {
    return cachedAccess.token;
  }
  const tokenUri = account.token_uri ?? "https://oauth2.googleapis.com/token";
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: tokenUri,
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${signer.sign(account.private_key.replace(/\\n/g, "\n"), "base64url")}`;

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    console.warn("push.fcm_auth_failed", response.status);
    return null;
  }
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  cachedAccess = { token: data.access_token, expiresAt: now + (data.expires_in ?? 3600), email: account.client_email };
  return data.access_token;
}

export async function sendFcm(token: string, message: PushMessage): Promise<SendResult> {
  const account = readServiceAccount();
  if (!account) return { ok: false, invalidToken: false };
  const bearer = await accessToken(account);
  if (!bearer) return { ok: false, invalidToken: false };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(account.project_id)}/messages:send`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token,
          notification: { title: message.title, body: message.body },
          data: message.url ? { url: message.url } : {},
          android: { priority: "HIGH", notification: { color: "#c4899a" } },
        },
      }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (response.ok) return { ok: true, invalidToken: false };

  let errorCode = "";
  try {
    const body = (await response.json()) as {
      error?: { status?: string; details?: { errorCode?: string }[] };
    };
    errorCode = body.error?.details?.find((d) => d.errorCode)?.errorCode ?? body.error?.status ?? "";
  } catch {
    /* non-JSON error */
  }
  console.warn("push.fcm_failed", response.status, errorCode);
  return { ok: false, invalidToken: errorCode === "UNREGISTERED" || response.status === 404 };
}
