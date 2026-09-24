import "server-only";
import type { OrderRecord, OrderStore } from "./types";

/**
 * Ephemeral in-process store for local / preview testing only.
 * Data is lost on cold start and is NOT durable storage.
 * Do not treat this as a production order database.
 */
class MemoryOrderStore implements OrderStore {
  private events = new Set<string>();
  private ordersBySession = new Map<string, OrderRecord>();

  async hasProcessedEvent(eventId: string): Promise<boolean> {
    return this.events.has(eventId);
  }

  async markEventProcessed(eventId: string): Promise<void> {
    this.events.add(eventId);
  }

  async upsertFromCheckoutSession(input: {
    eventId: string;
    session: {
      id: string;
      payment_intent: string | null;
      subscription: string | null;
      customer: string | null;
      customer_email: string | null;
      customer_details:
        | { email: string | null; name: string | null }
        | null;
      amount_total: number | null;
      currency: string | null;
      metadata: Record<string, string> | null;
      presentment_details?: {
        presentment_amount: number | null;
        presentment_currency: string | null;
      } | null;
      mode: string | null;
    };
  }): Promise<OrderRecord> {
    const { eventId, session } = input;
    const now = new Date().toISOString();
    const existing = this.ordersBySession.get(session.id);

    const email =
      session.customer_details?.email ??
      session.customer_email ??
      existing?.customerEmail ??
      null;
    const name =
      session.customer_details?.name ?? existing?.customerName ?? null;

    const productKind =
      session.metadata?.product_kind === "subscription" ||
      session.mode === "subscription"
        ? "subscription"
        : "one_time";

    const status =
      productKind === "subscription" ? "subscription_active" : "paid";

    const record: OrderRecord = {
      id: existing?.id ?? `ord_${session.id}`,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        session.payment_intent ?? existing?.stripePaymentIntentId ?? null,
      stripeSubscriptionId:
        session.subscription ?? existing?.stripeSubscriptionId ?? null,
      stripeCustomerId: session.customer ?? existing?.stripeCustomerId ?? null,
      catalogProductId:
        session.metadata?.catalog_product_id ??
        existing?.catalogProductId ??
        "unknown",
      productKind,
      status,
      amountTotal: session.amount_total ?? existing?.amountTotal ?? null,
      currency: session.currency ?? existing?.currency ?? null,
      presentmentAmount:
        session.presentment_details?.presentment_amount ??
        existing?.presentmentAmount ??
        null,
      presentmentCurrency:
        session.presentment_details?.presentment_currency ??
        existing?.presentmentCurrency ??
        null,
      customerEmail: email,
      customerName: name,
      locale: session.metadata?.locale ?? existing?.locale ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      stripeEventIds: existing
        ? Array.from(new Set([...existing.stripeEventIds, eventId]))
        : [eventId],
    };

    this.ordersBySession.set(session.id, record);
    return record;
  }

  async getByCheckoutSessionId(
    sessionId: string,
  ): Promise<OrderRecord | null> {
    return this.ordersBySession.get(sessionId) ?? null;
  }
}

const globalForOrders = globalThis as unknown as {
  __chocobananaOrderStore?: MemoryOrderStore;
};

export function getOrderStore(): OrderStore {
  if (!globalForOrders.__chocobananaOrderStore) {
    globalForOrders.__chocobananaOrderStore = new MemoryOrderStore();
  }
  return globalForOrders.__chocobananaOrderStore;
}
