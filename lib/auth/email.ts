import "server-only";

export type EmailErrorCode =
  | "EMAIL_NOT_CONFIGURED"
  | "EMAIL_FROM_MISSING"
  | "EMAIL_FROM_INVALID"
  | "EMAIL_DOMAIN_UNVERIFIED"
  | "EMAIL_UNAUTHORIZED"
  | "EMAIL_SEND_FAILED";

export class EmailDeliveryError extends Error {
  readonly code: EmailErrorCode;
  readonly setupHint: string;

  constructor(code: EmailErrorCode, setupHint: string) {
    super(code);
    this.name = "EmailDeliveryError";
    this.code = code;
    this.setupHint = setupHint;
  }
}

/** True only when Resend key and a From address are both set. */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim(),
  );
}

function parseFromAddress(raw: string): { email: string } | null {
  const trimmed = raw.trim();
  const angled = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  const email = (angled ? angled[2] : trimmed).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { email };
}

/**
 * Map Resend HTTP failures to safe codes — never include API bodies or addresses
 * in the thrown message (they may leak into UI).
 */
function classifyResendFailure(status: number, body: string): EmailDeliveryError {
  const lower = body.toLowerCase();
  if (
    status === 403 ||
    lower.includes("domain is not verified") ||
    lower.includes("not verified") ||
    lower.includes("domain_not_found")
  ) {
    return new EmailDeliveryError(
      "EMAIL_DOMAIN_UNVERIFIED",
      "In Resend → Domains, add and verify your sending domain (DNS). Then set EMAIL_FROM to an address on that domain (e.g. noreply@yourdomain.com).",
    );
  }
  if (status === 401 || lower.includes("invalid api key")) {
    return new EmailDeliveryError(
      "EMAIL_UNAUTHORIZED",
      "Check RESEND_API_KEY in Preview env vars (Resend → API Keys) and redeploy.",
    );
  }
  if (lower.includes("from") && (lower.includes("invalid") || lower.includes("not allowed"))) {
    return new EmailDeliveryError(
      "EMAIL_FROM_INVALID",
      "Set EMAIL_FROM to a verified-domain address. Do not use a random Gmail/Outlook From without verifying that domain in Resend.",
    );
  }
  return new EmailDeliveryError(
    "EMAIL_SEND_FAILED",
    "Email could not be sent. Confirm RESEND_API_KEY, EMAIL_FROM, and that the From domain is verified in Resend.",
  );
}

export function assertEmailReady(): void {
  if (!process.env.RESEND_API_KEY?.trim()) {
    throw new EmailDeliveryError(
      "EMAIL_NOT_CONFIGURED",
      "Set RESEND_API_KEY in the environment, then redeploy.",
    );
  }
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new EmailDeliveryError(
      "EMAIL_FROM_MISSING",
      "Set EMAIL_FROM to an address on a Resend-verified domain (not only RESEND_API_KEY).",
    );
  }
  if (!parseFromAddress(from)) {
    throw new EmailDeliveryError(
      "EMAIL_FROM_INVALID",
      "EMAIL_FROM must look like noreply@yourdomain.com or Name <noreply@yourdomain.com>.",
    );
  }
}

export async function sendAppEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: true; mode: "sent" }> {
  assertEmailReady();

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from = process.env.EMAIL_FROM!.trim();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    // Log only status + code class — never the body (may contain addresses).
    console.error("email.send_failed", { status: response.status });
    throw classifyResendFailure(response.status, body);
  }

  return { ok: true, mode: "sent" };
}

export function formatEmailErrorForUser(error: unknown): string {
  if (error instanceof EmailDeliveryError) {
    return `[${error.code}] Account was not created. ${error.setupHint}`;
  }
  return "[EMAIL_SEND_FAILED] Account was not created. Email delivery failed — check RESEND_API_KEY and EMAIL_FROM.";
}
