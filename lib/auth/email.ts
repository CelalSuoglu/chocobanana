import "server-only";
import { getAppBaseUrl } from "@/lib/stripe/config";

/**
 * Sends transactional email when SMTP/Resend is configured.
 * In Preview/test without a mail provider, logs the link so flows remain usable.
 */
export async function sendAppEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: true; mode: "sent" | "logged" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || "Chocobanana <onboarding@resend.dev>";

  if (apiKey) {
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
      throw new Error(`Email send failed: ${response.status} ${body}`);
    }

    return { ok: true, mode: "sent" };
  }

  console.info("[email.preview]", {
    to: options.to,
    subject: options.subject,
    text: options.text,
    appUrl: getAppBaseUrl(),
  });
  return { ok: true, mode: "logged" };
}
