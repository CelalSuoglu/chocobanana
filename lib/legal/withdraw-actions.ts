"use server";

import { isEmailConfigured, sendAppEmail } from "@/lib/auth/email";
import { createContactMessage } from "@/lib/contact/repository";
import { isDatabaseConfigured } from "@/lib/db";
import { BUSINESS } from "@/lib/legal/business";
import { SITE_EMAIL } from "@/lib/site-contact";

export type WithdrawalResult =
  | { ok: true; receivedAt: string; emailed: boolean }
  | { ok: false; error: "invalid" | "unavailable" };

function line(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * EU-style withdrawal function (Directive 2023/2673, art. 11a), offered to
 * every customer. Saves the notice, emails the owner, and confirms receipt to
 * the customer on a durable medium (email) with the date and time received.
 */
export async function submitWithdrawal(input: {
  name: string;
  email: string;
  orderNumber: string;
  items: string;
  website?: string;
}): Promise<WithdrawalResult> {
  // Honeypot field: real people never fill it.
  if (line(input.website, 50)) return { ok: false, error: "invalid" };

  const name = line(input.name, 80);
  const email = line(input.email, 120).toLowerCase();
  const orderNumber = line(input.orderNumber, 40);
  const items = line(input.items, 500) || "Whole order";
  if (!name || !orderNumber || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid" };
  }

  const received = new Date();
  const receivedAt = `${received.toISOString().replace("T", " ").slice(0, 19)} UTC`;
  const summary = [
    `Withdrawal notice received ${receivedAt}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Order: ${orderNumber}`,
    `Items: ${items}`,
  ].join("\n");

  let saved = false;
  if (isDatabaseConfigured()) {
    try {
      await createContactMessage({ name, email, message: `[WITHDRAWAL]\n${summary}` });
      saved = true;
    } catch (error) {
      console.error("withdrawal.save_failed", {
        code: error instanceof Error ? error.name : "unknown",
      });
    }
  }

  let emailed = false;
  if (isEmailConfigured()) {
    try {
      await sendAppEmail({
        to: SITE_EMAIL,
        subject: `Withdrawal notice — order ${orderNumber}`,
        text: summary,
        replyTo: email,
      });
    } catch (error) {
      console.error("withdrawal.owner_email_failed", {
        code: error instanceof Error ? error.name : "unknown",
      });
    }
    try {
      const text = [
        `Hi ${name},`,
        "",
        "We received your withdrawal (cancellation) notice. This email confirms receipt; we will review it under our Refund Policy and reply within 5 business days. If you are entitled to a refund, we refund within 14 days.",
        "",
        summary,
        "",
        `${BUSINESS.tradeName} — ${BUSINESS.email}`,
      ].join("\n");
      const html = `<div style="font-family:Georgia,serif;color:#4B281B;line-height:1.6">
<p>Hi ${escapeHtml(name)},</p>
<p>We received your withdrawal (cancellation) notice. This email confirms receipt; we will review it under our Refund Policy and reply within 5 business days. If you are entitled to a refund, we refund within 14 days.</p>
<p>${summary.split("\n").map(escapeHtml).join("<br>")}</p>
<p>${escapeHtml(BUSINESS.tradeName)} — ${escapeHtml(BUSINESS.email)}</p></div>`;
      await sendAppEmail({
        to: email,
        subject: `We received your withdrawal for order ${orderNumber}`,
        text,
        html,
        replyTo: SITE_EMAIL,
      });
      emailed = true;
    } catch (error) {
      console.error("withdrawal.customer_email_failed", {
        code: error instanceof Error ? error.name : "unknown",
      });
    }
  }

  if (!saved && !emailed) return { ok: false, error: "unavailable" };
  return { ok: true, receivedAt, emailed };
}
