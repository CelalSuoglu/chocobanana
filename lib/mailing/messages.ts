import "server-only";

import { businessContactLines } from "@/lib/legal/business";
import { getAppBaseUrl } from "@/lib/stripe/config";

const CLUB_URL = "https://thechocobananaclub.com";

function shell(body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#FFF4CC;color:#4B281B;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#FFFBEE;border:1px solid #E5D3A8;border-radius:16px;">
    <tr><td style="padding:28px 24px;font-size:16px;line-height:1.6;">
      <p style="margin:0 0 16px;"><img src="${CLUB_URL}/logo.jpg" alt="Chocobanana" width="72" height="72" style="border-radius:999px;display:block;"></p>
      ${body}
    </td></tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<p style="margin:24px 0 8px;"><a href="${href}" style="display:inline-block;background:#4B281B;color:#FFFBEE;text-decoration:none;padding:12px 20px;border-radius:999px;font-family:Georgia,serif;">${label}</a></p>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function verificationMessage(rawToken: string) {
  const url = `${getAppBaseUrl()}/api/mailing/confirm?token=${rawToken}`;
  const text = [
    "Confirm your Chocobanana mailing list signup.",
    "",
    "This does not create an account.",
    "The 10% first-order discount is only for people who create an account.",
    "",
    url,
  ].join("\n");
  const html = shell(`
    <p style="margin:0 0 16px;">Confirm your mailing list signup.</p>
    <p style="margin:0 0 16px;">This does not create a Chocobanana account. The 10% first-order discount is only for people who create an account.</p>
    ${button("Confirm email", url)}
  `);
  return { subject: "Confirm your Chocobanana mailing list", text, html };
}

export function listWelcomeMessage(row: {
  firstName: string | null;
  unsubscribeToken: string;
}) {
  const greeting = row.firstName?.trim()
    ? `Hi ${row.firstName.trim()} 💛`
    : "Hi, lovely! 💛";
  const unsubscribeUrl = `${getAppBaseUrl()}/api/mailing/unsubscribe?token=${row.unsubscribeToken}`;
  const discount =
    "Your first order comes with 10% off when you create an account. Simply sign in before shopping, and your welcome discount will appear at checkout. Joining this list does not create an account. The discount applies once, and it does not combine with another code.";
  const text = [
    greeting,
    "",
    "A little hello, a warm welcome, and a sprinkle of paper magic — we’re so happy you’re here! ✨",
    "",
    "Welcome to Chocobanana, where little envelopes carry little joys: lovely paper treasures, thoughtful details, and something sweet to look forward to. 🐌💌",
    "",
    `${discount} 🎁`,
    "",
    "We can’t wait to brighten your mailbox!",
    "",
    "With love,",
    "Didem 🤎",
    "Chocobanana Mail Club",
    "",
    `Explore the club 💌: ${CLUB_URL}`,
    `Unsubscribe: ${unsubscribeUrl}`,
    "",
    ...businessContactLines(),
  ].join("\n");
  const html = welcomeLetter({
    greeting,
    paragraphs: [
      "A little hello, a warm welcome, and a sprinkle of paper magic — we’re so happy you’re here! ✨",
      "Welcome to Chocobanana, where little envelopes carry little joys: lovely paper treasures, thoughtful details, and something sweet to look forward to. 🐌💌",
      `${discount} 🎁`,
      "We can’t wait to brighten your mailbox!",
    ],
    signoff: "With love,<br>Didem 🤎<br>Chocobanana Mail Club",
    unsubscribeUrl,
  });
  return { subject: "A little hello from Chocobanana 💌", text, html };
}

function welcomeLetter(input: {
  greeting: string;
  paragraphs: string[];
  signoff: string;
  unsubscribeUrl: string;
}): string {
  const copy = input.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 22px;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A little hello from Chocobanana</title>
</head>
<body style="margin:0;padding:0;background:#FFF4CC;color:#4B281B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFF4CC" style="background:#FFF4CC;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFFBEE" style="max-width:560px;background:#FFFBEE;border:1px solid #E5D3A8;border-radius:16px;">
          <tr>
            <td align="center" style="padding:40px 28px 8px;">
              <img src="${CLUB_URL}/logo.jpg" alt="Chocobanana" width="80" height="80" style="display:block;border:0;border-radius:999px;width:80px;height:80px;">
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 8px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;color:#4B281B;">
              <p style="margin:0 0 22px;">${escapeHtml(input.greeting)}</p>
              ${copy}
              <p style="margin:0;">${input.signoff}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 32px 12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" bgcolor="#4B281B" style="background:#4B281B;border-radius:999px;">
                    <a href="${CLUB_URL}" style="display:inline-block;padding:14px 28px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.3;color:#FFFBEE;text-decoration:none;">Explore the club 💌</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 40px;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;">
              <a href="${input.unsubscribeUrl}" style="color:#6B4636;text-decoration:underline;">Unsubscribe</a>
              <br><span style="color:#6B4636;font-size:12px;">${businessContactLines().join(" · ")}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function mailingResultPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:32px 16px;background:#FFF4CC;color:#4B281B;font-family:Georgia,serif;">
  <main style="max-width:32rem;margin:0 auto;background:#FFFBEE;border:1px solid #E5D3A8;border-radius:16px;padding:28px 24px;">
    <img src="${CLUB_URL}/logo.jpg" alt="Chocobanana" width="72" height="72" style="border-radius:999px;">
    <h1 style="font-weight:500;">${escapeHtml(title)}</h1>
    <p style="line-height:1.6;">${escapeHtml(body)}</p>
    <p><a href="${CLUB_URL}" style="display:inline-block;background:#4B281B;color:#FFFBEE;text-decoration:none;padding:12px 20px;border-radius:999px;">Explore the club</a></p>
  </main>
</body>
</html>`;
}
