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
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        <span>Fulfillment status</span>
        <select
          name="status"
          defaultValue={current}
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-[#f3e6d8]"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-10 rounded-md border border-[#c9a27a]/50 px-4 text-sm text-[#f3e6d8] hover:bg-white/5 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update"}
      </button>
      {state.error ? (
        <p className="w-full text-sm text-red-300">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="w-full text-sm text-emerald-300">{state.message}</p>
      ) : null}
      <p className="w-full text-xs text-[#c9a27a]/70">
        Payment status is set only by Stripe webhooks and cannot be edited here.
      </p>
    </form>
  );
}
