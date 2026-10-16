"use server";

import { revalidatePath } from "next/cache";
import type { FulfillmentStatus } from "@prisma/client";
import { requireOwner } from "@/lib/auth/session";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { updateFulfillmentStatus } from "@/lib/orders/repository";
import { notifyOrderStatusChanged } from "@/lib/push/send";

const allowed: FulfillmentStatus[] = [
  "NEW",
  "PREPARING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
];

export type OwnerActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function setOrderFulfillmentStatus(
  _prev: OwnerActionState,
  formData: FormData,
): Promise<OwnerActionState> {
  await requireOwner();

  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database is not configured." };
  }

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as FulfillmentStatus;

  if (!orderId || !allowed.includes(status)) {
    return { ok: false, error: "Invalid order or status." };
  }

  const previous = await requirePrisma().order.findUnique({
    where: { id: orderId },
    select: { fulfillmentStatus: true },
  });

  // Payment status is never writable here — only fulfillment.
  await updateFulfillmentStatus(orderId, status);

  // App notification for the customer (only if they turned it on). Best-effort:
  // a push failure never blocks the panel update.
  await notifyOrderStatusChanged(orderId, previous?.fulfillmentStatus ?? null);
  revalidatePath("/owner");
  revalidatePath(`/owner/orders/${orderId}`);

  return { ok: true, message: "Fulfillment status updated." };
}
