import "server-only";
import { createPrivateKey, sign } from "crypto";
import { connect } from "http2";

/**
 * Apple Push Notification service via token auth (.p8 key).
 * Env (server only, never in the app binary):
 *   APNS_KEY_P8      contents of AuthKey_XXXX.p8 (literal newlines or \n)
 *   APNS_KEY_ID      10-char key id
 *   APNS_TEAM_ID     Apple Developer Team ID
 *   APNS_BUNDLE_ID   com.thechocobananaclub.app
 *   APNS_ENVIRONMENT "production" (TestFlight/App Store) or "development" (Xcode builds)
 */
type ApnsConfig = { key: string; keyId: string; teamId: string; bundleId: string; host: string };

export type PushMessage = { title: string; body: string; url?: string };
export type SendResult = { ok: boolean; invalidToken: boolean };

function readConfig(): ApnsConfig | null {
  const key = process.env.APNS_KEY_P8?.replace(/\\n/g, "\n").trim();
  const keyId = process.env.APNS_KEY_ID?.trim();
  const teamId = process.env.APNS_TEAM_ID?.trim();
  const bundleId = process.env.APNS_BUNDLE_ID?.trim();
  if (!key || !keyId || !teamId || !bundleId) return null;
  const host =
    process.env.APNS_ENVIRONMENT === "development"
      ? "https://api.sandbox.push.apple.com"
      : "https://api.push.apple.com";
  return { key, keyId, teamId, bundleId, host };
}

export function isApnsConfigured(): boolean {
  return readConfig() !== null;
}

let cachedJwt: { value: string; issuedAt: number; keyId: string } | null = null;

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function providerToken(config: ApnsConfig): string {
  const now = Math.floor(Date.now() / 1000);
  // Apple accepts a token for up to an hour; refresh well before that.
  if (cachedJwt && cachedJwt.keyId === config.keyId && now - cachedJwt.issuedAt < 45 * 60) {
    return cachedJwt.value;
  }
  const header = base64url(JSON.stringify({ alg: "ES256", kid: config.keyId }));
  const payload = base64url(JSON.stringify({ iss: config.teamId, iat: now }));
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), {
    key: createPrivateKey(config.key),
    dsaEncoding: "ieee-p1363",
  });
  const value = `${header}.${payload}.${base64url(signature)}`;
  cachedJwt = { value, issuedAt: now, keyId: config.keyId };
  return value;
}

export async function sendApns(token: string, message: PushMessage): Promise<SendResult> {
  const config = readConfig();
  if (!config) return { ok: false, invalidToken: false };

  const body = JSON.stringify({
    aps: { alert: { title: message.title, body: message.body }, sound: "default" },
    ...(message.url ? { url: message.url } : {}),
  });

  return new Promise<SendResult>((resolve) => {
    let settled = false;
    const done = (result: SendResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        session.close();
      } catch {
        /* already closed */
      }
      resolve(result);
    };
    const session = connect(config.host);
    const timer = setTimeout(() => done({ ok: false, invalidToken: false }), 8000);
    session.on("error", () => done({ ok: false, invalidToken: false }));

    const request = session.request({
      ":method": "POST",
      ":path": `/3/device/${encodeURIComponent(token)}`,
      authorization: `bearer ${providerToken(config)}`,
      "apns-topic": config.bundleId,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });

    let status = 0;
    let responseBody = "";
    request.setEncoding("utf8");
    request.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });
    request.on("data", (chunk: string) => {
      responseBody += chunk;
    });
    request.on("end", () => {
      if (status === 200) return done({ ok: true, invalidToken: false });
      let reason = "";
      try {
        reason = (JSON.parse(responseBody) as { reason?: string }).reason ?? "";
      } catch {
        /* empty body */
      }
      const invalidToken =
        status === 410 || reason === "BadDeviceToken" || reason === "Unregistered" || reason === "DeviceTokenNotForTopic";
      console.warn("push.apns_failed", status, reason);
      done({ ok: false, invalidToken });
    });
    request.on("error", () => done({ ok: false, invalidToken: false }));
    request.end(body);
  });
}
