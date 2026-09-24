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
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-chocolate-soft">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="owner-input"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-chocolate-soft">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="owner-input"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-[var(--owner-danger)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="owner-btn owner-btn-primary">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
