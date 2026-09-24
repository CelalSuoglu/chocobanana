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
    <form action={action} className="mt-8 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        Panel password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-[#f3e6d8]"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-10 rounded-md border border-[#c9a27a]/50 px-4 text-sm hover:bg-white/5 disabled:opacity-60"
      >
        {pending ? "Unlocking…" : "Unlock owner panel"}
      </button>
    </form>
  );
}
