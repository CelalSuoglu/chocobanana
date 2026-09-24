"use client";

import { useActionState } from "react";
import {
  setOrderFulfillmentStatus,
  type OwnerActionState,
} from "@/lib/owner/actions";

const statuses = [
  "NEW",
  "PREPARING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
] as const;

type FulfillmentStatus = (typeof statuses)[number];

const initial: OwnerActionState = { ok: false };

export function FulfillmentStatusForm({
  orderId,
  current,
}: {
  orderId: string;
  current: FulfillmentStatus;
}) {
  const [state, action, pending] = useActionState(
    setOrderFulfillmentStatus,
    initial,
  );

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="flex flex-col gap-1.5 text-sm text-[#cbb3a0]">
        <span>Fulfillment status</span>
        <select name="status" defaultValue={current} className="owner-input">
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending} className="owner-btn owner-btn-primary">
        {pending ? "Saving…" : "Update"}
      </button>
      {state.error ? (
        <p className="w-full text-sm text-[#f0a8a8]">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="w-full text-sm text-[#b8d4a8]">{state.message}</p>
      ) : null}
      <p className="w-full text-xs text-[#cbb3a0]/80">
        Payment status is set only by Stripe webhooks and cannot be edited here.
      </p>
    </form>
  );
}
