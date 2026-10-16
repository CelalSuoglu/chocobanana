import {
  INVOICE_BRAND,
  INVOICE_CONTACT_EMAIL,
  formatInvoiceDate,
  formatInvoiceMoney,
  type InvoiceDocument,
} from "./model";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Printable invoice. The PDF renderer follows this same layout. */
export function renderInvoiceHtml(invoice: InvoiceDocument): string {
  const name = invoice.shippingName || invoice.customerName || "—";
  const phone = invoice.customerPhone || "—";
  const rows = invoice.items
    .map((item) => {
      const line = item.unitAmountCadCents * item.quantity;
      return `<tr>
        <td>${escapeHtml(item.name)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${escapeHtml(formatInvoiceMoney(item.unitAmountCadCents))}</td>
        <td class="num">${escapeHtml(formatInvoiceMoney(line))}</td>
      </tr>`;
    })
    .join("");
  const postage =
    (invoice.shippingAmountCadCents ?? 0) > 0
      ? `<div class="row"><span>Postage</span><span>${escapeHtml(formatInvoiceMoney(invoice.shippingAmountCadCents ?? 0))}</span></div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(INVOICE_BRAND)} invoice ${escapeHtml(invoice.orderNumber)}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff4cc; color: #4b281b; font-family: Georgia, "Times New Roman", serif; }
    .sheet { max-width: 720px; margin: 0 auto; background: #fffbee; padding: 36px 40px 48px; }
    header { display: flex; align-items: center; gap: 18px; }
    header img { width: 92px; height: 92px; object-fit: cover; border-radius: 8px; }
    .brand { font-size: 22px; letter-spacing: 0.04em; margin: 0; }
    .email { margin: 6px 0 0; font-size: 13px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 16px; margin: 32px 0 28px; }
    .label { display: block; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a6254; margin-bottom: 6px; }
    .value { margin: 0; font-size: 16px; }
    .customer p { margin: 2px 0 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a6254; padding: 8px 0; border-bottom: 1px solid #e5d3a8; }
    td { padding: 12px 0; border-bottom: 1px solid #e5d3a8; font-size: 14px; }
    .num, th.num { text-align: right; }
    .totals { width: 260px; margin-left: auto; margin-top: 18px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .totals .paid { margin-top: 8px; padding-top: 8px; border-top: 1px solid #4b281b; font-size: 18px; font-weight: 700; }
    .stamp { display: inline-block; margin-top: 36px; padding: 8px 16px; border: 2px solid #1e8e4e; border-radius: 999px; color: #1e8e4e; letter-spacing: 0.16em; font-size: 13px; font-weight: 700; }
  </style>
</head>
<body>
  <article class="sheet">
    <header>
      <img src="https://thechocobananaclub.com/logo.jpg" alt="${escapeHtml(INVOICE_BRAND)}">
      <div>
        <h1 class="brand">${escapeHtml(INVOICE_BRAND)}</h1>
        <p class="email">${escapeHtml(INVOICE_CONTACT_EMAIL)}</p>
      </div>
    </header>
    <section class="meta">
      <div>
        <span class="label">Order</span>
        <p class="value">${escapeHtml(invoice.orderNumber)}</p>
      </div>
      <div>
        <span class="label">Date</span>
        <p class="value">${escapeHtml(formatInvoiceDate(invoice.createdAt))}</p>
      </div>
      <div class="customer">
        <span class="label">Customer</span>
        <p class="value">${escapeHtml(name)}</p>
        <p>${escapeHtml(phone)}</p>
        <p>${escapeHtml(invoice.customerEmail)}</p>
      </div>
    </section>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="num">Qty</th>
          <th class="num">Unit price</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${escapeHtml(formatInvoiceMoney(invoice.subtotalCadCents))}</span></div>
      <div class="row"><span>Discount</span><span>-${escapeHtml(formatInvoiceMoney(invoice.discountAmountCadCents ?? 0))}</span></div>
      ${postage}
      <div class="row"><span>Tax</span><span>${escapeHtml(formatInvoiceMoney(invoice.taxAmountCadCents ?? 0))}</span></div>
      <div class="row paid"><span>Total paid</span><span>${escapeHtml(formatInvoiceMoney(invoice.amountTotalCadCents))}</span></div>
    </div>
    <p class="stamp">PAID / ÖDENDİ</p>
  </article>
</body>
</html>`;
}
