export type OrderStatus =
  | "pending_confirmation"
  | "paid"
  | "subscription_active"
  | "canceled"
  | "failed";

export type OrderRecord = {
  id: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  catalogProductId: string;
  productKind: "one_time" | "subscription";
  status: OrderStatus;
  /** Integration / Price currency (always CAD for this shop) */
  amountTotal: number | null;
  currency: string | null;
  /** Presentment details from Adaptive Pricing when present */
  presentmentAmount: number | null;
  presentmentCurrency: string | null;
  customerEmail: string | null;
  customerName: string | null;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
  stripeEventIds: string[];
};

export type OrderStore = {
  /** Returns true if this Stripe event id was already handled */
  hasProcessedEvent(eventId: string): Promise<boolean>;
  markEventProcessed(eventId: string): Promise<void>;
  upsertFromCheckoutSession(input: {
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
  }): Promise<OrderRecord>;
  getByCheckoutSessionId(sessionId: string): Promise<OrderRecord | null>;
};
