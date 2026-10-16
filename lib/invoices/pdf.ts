import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

import {
  INVOICE_BRAND,
  INVOICE_CONTACT_EMAIL,
  formatInvoiceDate,
  formatInvoiceMoney,
  parseInvoiceDocument,
  type InvoiceDocument,
  type InvoiceDocumentInput,
} from "./model";

const CHOCOLATE = "#4B281B";
const PAPER = "#FFF4CC";
const CREAM = "#FFFBEE";
const LINE = "#E5D3A8";
const SOFT = "#8A6254";
const GREEN = "#1E8E4E";
const GREEN_WASH = "#E7F6EE";

const TURKISH: Record<string, string> = {
  ş: "s",
  Ş: "S",
  ğ: "g",
  Ğ: "G",
  ı: "i",
  İ: "I",
};

function fold(value: string): string {
  return [...value].map((char) => TURKISH[char] ?? char).join("");
}

function write(
  doc: PDFKit.PDFDocument,
  value: string,
  x: number,
  y: number,
  options?: PDFKit.Mixins.TextOptions,
) {
  doc.text(encode(value), x, y, { lineBreak: false, ...options });
}

let encode = fold;

function fonts(): { regular: string; bold: string } | null {
  const regular = path.join(process.cwd(), "assets/fonts/NotoSans-Regular.ttf");
  const bold = path.join(process.cwd(), "assets/fonts/NotoSans-Bold.ttf");
  if (!existsSync(regular) || !existsSync(bold)) return null;
  return { regular, bold };
}

function logoBuffer(): Buffer | null {
  const file = path.join(process.cwd(), "public", "logo.jpg");
  if (!existsSync(file)) return null;
  return readFileSync(file);
}

function draw(doc: PDFKit.PDFDocument, invoice: InvoiceDocument) {
  const faces = fonts();
  const regular = faces ? "NotoSans" : "Helvetica";
  const bold = faces ? "NotoSans-Bold" : "Helvetica-Bold";
  if (faces) {
    doc.registerFont(regular, faces.regular);
    doc.registerFont(bold, faces.bold);
  }
  const textOf = faces ? (value: string) => value : fold;
  encode = textOf;
  const width = doc.page.width;
  const left = 48;
  const right = width - 48;
  const content = right - left;
  doc.rect(0, 0, width, doc.page.height).fill(PAPER);
  doc.rect(36, 28, width - 72, doc.page.height - 56).fill(CREAM);

  const logo = logoBuffer();
  if (logo) {
    doc.image(logo, left, 48, { fit: [84, 84] });
  }
  const titleX = logo ? left + 100 : left;
  doc.fillColor(CHOCOLATE).font(bold).fontSize(22);
  write(doc, INVOICE_BRAND, titleX, 62);
  doc.font(regular).fontSize(11).fillColor(SOFT);
  write(doc, INVOICE_CONTACT_EMAIL, titleX, 92);

  const metaY = 156;
  const columns = [left, left + 170, left + 320];
  const labels = ["Order", "Date", "Customer"];
  const name = invoice.shippingName || invoice.customerName || "—";
  doc.font(regular).fontSize(9).fillColor(SOFT);
  labels.forEach((label, index) => write(doc, label.toUpperCase(), columns[index]!, metaY));

  doc.font(bold).fontSize(13).fillColor(CHOCOLATE);
  write(doc, invoice.orderNumber, columns[0]!, metaY + 16, { width: 150 });
  write(doc, formatInvoiceDate(invoice.createdAt), columns[1]!, metaY + 16, { width: 140 });
  write(doc, name, columns[2]!, metaY + 16, { width: content - 320 });
  doc.font(regular).fontSize(11);
  write(doc, invoice.customerPhone || "—", columns[2]!, metaY + 36, { width: content - 320 });
  write(doc, invoice.customerEmail, columns[2]!, metaY + 52, { width: content - 320 });

  let y = 250;
  const qtyX = left + 270;
  const unitX = left + 330;
  const totalX = left + 420;
  doc.font(regular).fontSize(9).fillColor(SOFT);
  write(doc, "PRODUCT", left, y);
  write(doc, "QTY", qtyX, y, { width: 40, align: "right" });
  write(doc, "UNIT PRICE", unitX, y, { width: 80, align: "right" });
  write(doc, "TOTAL", totalX, y, { width: right - totalX, align: "right" });
  y += 16;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(1).stroke();
  y += 12;

  doc.font(regular).fontSize(11).fillColor(CHOCOLATE);
  for (const item of invoice.items) {
    const lineTotal = item.unitAmountCadCents * item.quantity;
    write(doc, item.name, left, y, { width: 250 });
    write(doc, String(item.quantity), qtyX, y, { width: 40, align: "right" });
    write(doc, formatInvoiceMoney(item.unitAmountCadCents), unitX, y, {
      width: 80,
      align: "right",
    });
    write(doc, formatInvoiceMoney(lineTotal), totalX, y, {
      width: right - totalX,
      align: "right",
    });
    y += 22;
    doc.moveTo(left, y - 6).lineTo(right, y - 6).strokeColor(LINE).lineWidth(0.6).stroke();
  }

  y += 10;
  const totalsX = left + 300;
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "Subtotal", value: formatInvoiceMoney(invoice.subtotalCadCents) },
    {
      label: "Discount",
      value: `-${formatInvoiceMoney(invoice.discountAmountCadCents ?? 0)}`,
    },
  ];
  if ((invoice.shippingAmountCadCents ?? 0) > 0) {
    rows.push({
      label: "Postage",
      value: formatInvoiceMoney(invoice.shippingAmountCadCents ?? 0),
    });
  }
  rows.push({ label: "Tax", value: formatInvoiceMoney(invoice.taxAmountCadCents ?? 0) });
  rows.push({
    label: "Total paid",
    value: formatInvoiceMoney(invoice.amountTotalCadCents),
    strong: true,
  });

  for (const row of rows) {
    if (row.strong) {
      doc.moveTo(totalsX, y - 4).lineTo(right, y - 4).strokeColor(CHOCOLATE).lineWidth(1).stroke();
      y += 8;
    }
    doc.font(row.strong ? bold : regular).fontSize(row.strong ? 14 : 11);
    doc.fillColor(CHOCOLATE);
    write(doc, row.label, totalsX, y, { width: 110, align: "right" });
    write(doc, row.value, totalsX + 120, y, { width: right - (totalsX + 120), align: "right" });
    y += row.strong ? 24 : 18;
  }

  const stampY = Math.max(y + 36, 700);
  const stamp = "PAID / ÖDENDİ";
  doc.roundedRect(left, stampY, 188, 32, 16).fillAndStroke(GREEN_WASH, GREEN);
  doc.fillColor(GREEN).font(bold).fontSize(11);
  write(doc, stamp, left, stampY + 10, { width: 188, align: "center" });
}

export async function buildInvoicePdf(input: InvoiceDocumentInput): Promise<Uint8Array> {
  const invoice = parseInvoiceDocument(input);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    doc.on("error", reject);
    try {
      draw(doc, invoice);
      doc.end();
    } catch (error) {
      reject(error instanceof Error ? error : new Error("invoice_pdf_failed"));
    }
  });
}
