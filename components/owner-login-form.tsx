"use client";

import { useActionState } from "react";
import {
  loginOwner,
  type AuthActionState,
} from "@/lib/auth/actions";

const initial: AuthActionState = { ok: false };

export function OwnerLoginForm() {
  const [state, action, pending] = useActionState(loginOwner, initial);

  return (
    <form action={action} className="mt-8 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-[#f3e6d8]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[#c9a27a]">
        Password
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
        {pending ? "Signing in…" : "Sign in to owner panel"}
      </button>
    </form>
  );
}
