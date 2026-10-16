import "server-only";

import { requirePrisma } from "@/lib/db";
import { isEmailConfigured, sendAppEmail } from "@/lib/auth/email";
import { InvoiceValidationError, sendInvoiceEmail } from "@/lib/invoices/email";
import { displayOrderNumber } from "@/lib/orders/number";
import {
  claimOrderConfirmationSend,
  claimWelcomeEmailSend,
  releaseOrderConfirmationClaim,
  releaseWelcomeEmailClaim,
} from "@/lib/welcome/discount";

const CLUB_URL = "https://thechocobananaclub.com";

function shell(body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#FFF4CC;color:#4B281B;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#FFFBEE;border:1px solid #E5D3A8;border-radius:16px;">
    <tr><td style="padding:28px 24px;font-size:16px;line-height:1.6;">
      ${body}
    </td></tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<p style="margin:24px 0 8px;"><a href="${href}" style="display:inline-block;background:#4B281B;color:#FFFBEE;text-decoration:none;padding:12px 20px;border-radius:999px;font-family:Georgia,serif;">${label}</a></p>`;
}

export async function sendWelcomeEmail(userId: string): Promise<{ sent: boolean }> {
  if (!isEmailConfigured()) return { sent: false };
  const db = requirePrisma();
  const claimed = await claimWelcomeEmailSend(db, userId);
  if (!claimed) return { sent: false };
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, email: true, emailVerified: true },
  });
  if (!user?.emailVerified) {
    await releaseWelcomeEmailClaim(db, userId);
    return { sent: false };
  }
  const name = user.firstName?.trim() || "there";
  const text = [
    `Hi ${name},`,
    "",
    "Welcome to Chocobanana Mail Club! We’re happy you’re here.",
    "",
    "Your first order comes with 10% off — simply sign in and your welcome discount will appear at checkout.",
    "",
    "Discover little paper treasures and a little joy for your mailbox.",
    "",
    "With love,",
    "Didem",
    "Chocobanana Mail Club",
    "",
    `Explore the club: ${CLUB_URL}`,
  ].join("\n");
  const html = shell(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">Welcome to Chocobanana Mail Club! We’re happy you’re here.</p>
    <p style="margin:0 0 16px;">Your first order comes with 10% off — simply sign in and your welcome discount will appear at checkout.</p>
    <p style="margin:0 0 16px;">Discover little paper treasures and a little joy for your mailbox.</p>
    <p style="margin:0 0 4px;">With love,<br>Didem<br>Chocobanana Mail Club</p>
    ${button("Explore the club", CLUB_URL)}
  `);
  try {
    await sendAppEmail({
      to: user.email,
      subject: "Welcome to Chocobanana 💛",
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    await releaseWelcomeEmailClaim(db, userId);
    console.error(
      "welcome_email.failed",
      error instanceof Error ? error.name : "send_failed",
    );
    return { sent: false };
  }
}

export async function sendGuestOrderConfirmation(orderId: string): Promise<{ sent: boolean }> {
  if (!isEmailConfigured()) return { sent: false };
  const db = requirePrisma();
  const claimed = await claimOrderConfirmationSend(db, orderId);
  if (!claimed) return { sent: false };
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.paymentStatus !== "PAID") {
    await releaseOrderConfirmationClaim(db, orderId);
    return { sent: false };
  }
  const orderNumber = displayOrderNumber(order.publicNumber);
  try {
    await sendInvoiceEmail({
      to: order.customerEmail,
      invoice: {
        orderNumber,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingName: order.shippingName,
        shippingLine1: order.shippingLine1,
        shippingLine2: order.shippingLine2,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingPostalCode: order.shippingPostalCode,
        shippingCountry: order.shippingCountry,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitAmountCadCents: item.unitAmountCadCents,
        })),
        shippingAmountCadCents: order.shippingAmountCadCents,
        taxAmountCadCents: order.taxAmountCadCents,
        discountAmountCadCents: order.discountAmountCadCents,
        amountTotalCadCents: order.amountTotalCadCents,
        locale: order.locale,
      },
    });
    return { sent: true };
  } catch (error) {
    await releaseOrderConfirmationClaim(db, orderId);
    console.error(
      "order_email.failed",
      error instanceof InvoiceValidationError
        ? error.issues.join(",")
        : error instanceof Error
          ? error.name
          : "send_failed",
    );
    return { sent: false };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
