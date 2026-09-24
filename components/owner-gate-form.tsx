"use client";

import { useActionState } from "react";
import {
  unlockOwnerPanel,
  type OwnerGateState,
} from "@/lib/owner/gate";

const initial: OwnerGateState = { ok: false };

export function OwnerGateForm() {
  const [state, action, pending] = useActionState(unlockOwnerPanel, initial);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-[#cbb3a0]">
        Panel password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="owner-input"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-[#f0a8a8]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="owner-btn owner-btn-primary">
        {pending ? "Unlocking…" : "Unlock and continue"}
      </button>
    </form>
  );
}
