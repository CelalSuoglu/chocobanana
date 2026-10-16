"use server";

import { isEmailConfigured, sendAppEmail } from "@/lib/auth/email";
import { createContactMessage } from "@/lib/contact/repository";
import { isDatabaseConfigured } from "@/lib/db";
import { SITE_EMAIL } from "@/lib/site-contact";

export type ContactResult =
  | { ok: true; mode: "sent" }
  | { ok: true; mode: "mailto"; href: string }
  | { ok: false; error: "invalid" };

function singleLine(value: string, max: number) {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function messageBody(value: string, max: number) {
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactResult> {
  const name = singleLine(input.name ?? "", 80);
  const email = singleLine(input.email ?? "", 120).toLowerCase();
  const message = messageBody(input.message ?? "", 4000);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !message || !emailOk) {
    return { ok: false, error: "invalid" };
  }

  const subject = `Chocobanana note from ${name}`;
  const text = `From: ${name} <${email}>\n\n${message}`;

  if (isDatabaseConfigured()) {
    try {
      await createContactMessage({ name, email, message });
      if (isEmailConfigured()) {
        try {
          await sendAppEmail({
            to: SITE_EMAIL,
            subject,
            text,
            replyTo: email,
          });
        } catch (error) {
          console.error("contact.email_failed", {
            code: error instanceof Error ? error.name : "unknown",
          });
        }
      }
      return { ok: true, mode: "sent" };
    } catch (error) {
      console.error("contact.save_failed", {
        code: error instanceof Error ? error.name : "unknown",
      });
    }
  }

  const href = `mailto:${SITE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  return { ok: true, mode: "mailto", href };
}
