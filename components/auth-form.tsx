"use client";

import { useActionState } from "react";
import type { AuthActionState } from "@/lib/auth/actions";

type AuthFormProps = {
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  submitLabel: string;
  pendingLabel?: string;
  children: React.ReactNode;
  hiddenFields?: Record<string, string>;
};

const initial: AuthActionState = { ok: false };

export function AuthForm({
  action,
  submitLabel,
  pendingLabel = "Please wait…",
  children,
  hiddenFields,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initial);
  const showSuccess = state.ok && Boolean(state.message);
  const showError = !state.ok && Boolean(state.error);

  return (
    <form action={formAction} className="mx-auto flex w-full flex-col gap-4">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      {!showSuccess ? children : null}
      {showError ? (
        <p
          className="rounded-2xl border border-pink-deep/45 bg-pink-soft/50 px-4 py-3 text-sm text-pink-deep"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {showSuccess ? (
        <p
          className="rounded-2xl border border-gold/45 bg-gold-soft/35 px-4 py-3 text-sm text-chocolate"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {!showSuccess ? (
        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex min-h-12 items-center justify-center rounded-full border border-pink-deep bg-pink-deep px-5 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-paper transition-colors hover:border-chocolate hover:bg-chocolate disabled:opacity-60"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      ) : null}
    </form>
  );
}

export function AuthField({
  label,
  name,
  type = "text",
  required = true,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-start text-sm text-chocolate-soft">
      <span className="font-serif tracking-wide text-chocolate">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="min-h-12 rounded-2xl border border-pink/45 bg-cream/80 px-4 text-chocolate outline-none transition-[box-shadow,border-color] focus:border-pink-deep focus:ring-2 focus:ring-pink/35"
      />
    </label>
  );
}

export function AuthSelect({
  label,
  name,
  required = true,
  autoComplete,
  options,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  options: { value: string; label: string }[];
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-start text-sm text-chocolate-soft">
      <span className="font-serif tracking-wide text-chocolate">{label}</span>
      <select
        name={name}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ""}
        className="min-h-12 rounded-2xl border border-pink/45 bg-cream/80 px-4 text-chocolate outline-none transition-[box-shadow,border-color] focus:border-pink-deep focus:ring-2 focus:ring-pink/35"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
