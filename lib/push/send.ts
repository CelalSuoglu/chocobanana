import "server-only";
import type { FulfillmentStatus } from "@prisma/client";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { displayOrderNumber } from "@/lib/orders/number";
import { sendApns, type PushMessage } from "./apns";
import { sendFcm } from "./fcm";

/** Sends to every device of one member. Never throws: push is best-effort. */
export async function sendPushToUser(
  userId: string,
  build: (locale: string) => Promise<PushMessage> | PushMessage,
): Promise<{ sent: number }> {
  if (!isDatabaseConfigured()) return { sent: 0 };
  try {
    const prisma = requirePrisma();
    const devices = await prisma.pushDevice.findMany({ where: { userId } });
    let sent = 0;
    const invalid: string[] = [];
    for (const device of devices) {
      const message = await build(device.locale ?? "en");
      const result =
        device.platform === "IOS"
          ? await sendApns(device.token, message)
          : await sendFcm(device.token, message);
      if (result.ok) sent += 1;
      if (result.invalidToken) invalid.push(device.id);
    }
    if (invalid.length) {
      await prisma.pushDevice.deleteMany({ where: { id: { in: invalid } } });
    }
    return { sent };
  } catch (error) {
    console.warn("push.send_failed", error instanceof Error ? error.name : "unknown");
    return { sent: 0 };
  }
}

const NOTIFY_STATUSES: readonly FulfillmentStatus[] = ["PREPARING", "SHIPPED", "COMPLETED", "CANCELED"];

/** Called after the owner changes an order's fulfillment status. */
export async function notifyOrderStatusChanged(
  orderId: string,
  previous: FulfillmentStatus | null,
): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    const order = await requirePrisma().order.findUnique({
      where: { id: orderId },
      select: { userId: true, fulfillmentStatus: true, publicNumber: true, locale: true },
    });
    if (!order?.userId) return;
    if (order.fulfillmentStatus === previous) return;
    const status = order.fulfillmentStatus;
    if (!NOTIFY_STATUSES.includes(status)) return;
    const key = status as "PREPARING" | "SHIPPED" | "COMPLETED" | "CANCELED";

    await sendPushToUser(order.userId, async (deviceLocale) => {
      const locale = isLocale(deviceLocale) ? deviceLocale : isLocale(order.locale ?? "") ? order.locale! : "en";
      const dict = await getDictionary(locale);
      return {
        title: dict.app.push.orderTitle,
        body: dict.app.push.orderStatus[key].replace("{order}", displayOrderNumber(order.publicNumber)),
        url: `/${locale}/account#orders`,
      };
    });
  } catch (error) {
    console.warn("push.order_status_failed", error instanceof Error ? error.name : "unknown");
  }
}
