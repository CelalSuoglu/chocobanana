import "server-only";

import { sendAppEmail } from "@/lib/auth/email";
import {
  InvoiceValidationError,
  parseInvoiceDocument,
  type InvoiceDocument,
  type InvoiceDocumentInput,
} from "@/lib/invoices/model";
import { buildInvoicePdf } from "@/lib/invoices/pdf";
import { formatInvoiceDate } from "@/lib/invoices/model";
import { businessContactLines } from "@/lib/legal/business";
import { getAppBaseUrl } from "@/lib/stripe/config";

/** Ontario/EU: the confirmation is the buyer's copy of the agreement. */
function agreementLines(invoice: InvoiceDocument): string[] {
  const base = getAppBaseUrl();
  const address = [
    invoice.shippingName,
    invoice.shippingLine1,
    invoice.shippingLine2,
    [invoice.shippingCity, invoice.shippingState, invoice.shippingPostalCode].filter(Boolean).join(" "),
    invoice.shippingCountry,
  ]
    .filter((part) => part && String(part).trim())
    .join(", ");
  return [
    `Order date: ${formatInvoiceDate(invoice.createdAt)}`,
    ...(address ? [`Delivery address: ${address}`] : []),
    "Prices are in Canadian dollars (CAD). Delivery times and our 14-day cancellation policy are in our Terms of Sale:",
    `${base}/en/terms`,
    `To cancel, use: ${base}/en/withdraw`,
    "",
    "Seller:",
    ...businessContactLines(),
  ];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

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

function greetingName(invoice: InvoiceDocument): string {
  const full = invoice.customerName?.trim() || invoice.shippingName?.trim() || "";
  return full.split(/\s+/)[0] || "";
}

export function invoiceEmailContent(invoice: InvoiceDocument): {
  subject: string;
  text: string;
  html: string;
} {
  const name = greetingName(invoice);
  const hello = name ? `Hi ${name}💛` : "Hi💛";
  const lines = invoice.items.map(
    (item) =>
      `${item.name} × ${item.quantity} — ${money(item.unitAmountCadCents * item.quantity)}`,
  );
  const total = money(invoice.amountTotalCadCents);
  const subject = `Thank you for your order ${invoice.orderNumber}`;
  const text = [
    hello,
    "",
    "Thank you for your order! 🎁✨",
    "Your payment is confirmed, and a little paper joy is on its way. 💌",
    "",
    `Order ${invoice.orderNumber}`,
    "",
    "What you ordered 🎀",
    "",
    ...lines,
    `Total ${total} 💛`,
    "",
    "Your invoice is attached as a PDF. 📄",
    "",
    ...agreementLines(invoice),
    "",
    "With love,",
    "Didem 🤎",
    "Chocobanana Mail Club",
  ].join("\n");
  const itemHtml = lines
    .map((line) => `<p style="margin:0;">${escapeHtml(line)}</p>`)
    .join("");
  const html = shell(`
    <p style="margin:0 0 16px;">${escapeHtml(hello)}</p>
    <p style="margin:0;">Thank you for your order! 🎁✨</p>
    <p style="margin:0 0 16px;">Your payment is confirmed, and a little paper joy is on its way. 💌</p>
    <p style="margin:0 0 16px;">Order ${escapeHtml(invoice.orderNumber)}</p>
    <p style="margin:0 0 16px;">What you ordered 🎀</p>
    ${itemHtml}
    <p style="margin:0 0 16px;">Total ${escapeHtml(total)} 💛</p>
    <p style="margin:0 0 16px;">Your invoice is attached as a PDF. 📄</p>
    <p style="margin:0;">With love,<br>Didem 🤎<br>Chocobanana Mail Club</p>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#6B4636;">${agreementLines(invoice).map(escapeHtml).join("<br>")}</p>
  `);
  return { subject, text, html };
}

function attachmentName(orderNumber: string): string {
  const safe = orderNumber.replace(/[^A-Za-z0-9]/g, "") || "order";
  return `Chocobanana-invoice-${safe}.pdf`;
}

export async function sendInvoiceEmail(options: {
  to: string;
  invoice: InvoiceDocumentInput;
}): Promise<void> {
  const invoice = parseInvoiceDocument(options.invoice);
  const pdf = await buildInvoicePdf(invoice);
  const message = invoiceEmailContent(invoice);
  await sendAppEmail({
    to: options.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: [
      {
        filename: attachmentName(invoice.orderNumber),
        content: pdf,
      },
    ],
  });
}

export { InvoiceValidationError };
