"use client";

import { useActionState } from "react";
import {
  unlockSitePreview,
  type PreviewGateState,
} from "@/lib/site/preview-gate";

const initial: PreviewGateState = { ok: false };

export function SiteUnlockForm() {
  const [state, action, pending] = useActionState(unlockSitePreview, initial);

  return (
    <form action={action} className="mt-8 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-[#5c4033]">
        Preview password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-10 rounded-md border border-[#d4b5a0] bg-white/80 px-3 text-[#3c2a22]"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-[#a33]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-10 rounded-md border border-[#3c2a22]/40 px-4 text-sm text-[#3c2a22] hover:bg-[#f5ebe3] disabled:opacity-60"
      >
        {pending ? "Unlocking…" : "Unlock and open the site"}
      </button>
    </form>
  );
}
