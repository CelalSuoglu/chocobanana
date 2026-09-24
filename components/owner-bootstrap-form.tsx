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
      <label className="flex flex-col gap-1.5 text-sm text-[#cbb3a0]">
        Name
        <input name="name" required className="owner-input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-[#cbb3a0]">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="owner-input"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-[#cbb3a0]">
        Password (12+ characters)
        <input
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="owner-input"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-[#cbb3a0]">
        Bootstrap secret
        <input
          name="bootstrapSecret"
          type="password"
          required
          className="owner-input"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-[#f0a8a8]" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-[#b8d4a8]" role="status">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="owner-btn owner-btn-primary">
        {pending ? "Creating…" : "Create owner"}
      </button>
    </form>
  );
}
