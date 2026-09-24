"use client";

import { useActionState } from "react";
import {
  bootstrapOwner,
  type BootstrapState,
} from "@/lib/auth/owner-bootstrap";

const initial: BootstrapState = { ok: false };

export function OwnerBootstrapForm() {
  const [state, action, pending] = useActionState(bootstrapOwner, initial);

  return (
    <form action={action} className="mt-8 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        Name
        <input
          name="name"
          required
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-[#f3e6d8]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        Email
        <input
          name="email"
          type="email"
          required
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-[#f3e6d8]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        Password (12+ characters)
        <input
          name="password"
          type="password"
          required
          minLength={12}
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-[#f3e6d8]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        Bootstrap secret
        <input
          name="bootstrapSecret"
          type="password"
          required
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-[#f3e6d8]"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-emerald-300" role="status">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-10 rounded-md border border-[#c9a27a]/50 px-4 text-sm hover:bg-white/5 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create owner"}
      </button>
    </form>
  );
}
