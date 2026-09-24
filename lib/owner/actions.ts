"use server";

import { revalidatePath } from "next/cache";
import type { FulfillmentStatus } from "@prisma/client";
import { requireOwner } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db";
import { updateFulfillmentStatus } from "@/lib/orders/repository";

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

  // Payment status is never writable here — only fulfillment.
  await updateFulfillmentStatus(orderId, status);
  revalidatePath("/owner");
  revalidatePath(`/owner/orders/${orderId}`);

  return { ok: true, message: "Fulfillment status updated." };
}
