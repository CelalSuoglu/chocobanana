"use client";

import { useActionState } from "react";
import type { AuthActionState } from "@/lib/auth/actions";

type AuthFormProps = {
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  submitLabel: string;
  children: React.ReactNode;
  hiddenFields?: Record<string, string>;
};

const initial: AuthActionState = { ok: false };

export function AuthForm({
  action,
  submitLabel,
  children,
  hiddenFields,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initial);
  const showSuccess = state.ok && Boolean(state.message);
  const showError = !state.ok && Boolean(state.error);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-lg flex-col gap-4">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      {!showSuccess ? children : null}
      {showError ? (
        <p
          className="rounded-2xl border border-pink-deep/40 bg-pink-soft/40 px-4 py-3 text-sm text-pink-deep"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {showSuccess ? (
        <p
          className="rounded-2xl border border-chocolate/20 bg-paper/90 px-4 py-3 text-sm text-chocolate"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {!showSuccess ? (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-chocolate/80 px-5 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-chocolate transition-colors hover:border-pink-deep hover:bg-pink-soft/60 disabled:opacity-60"
        >
          {pending ? "Please wait…" : submitLabel}
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
        className="min-h-11 rounded-2xl border border-pink/40 bg-paper/80 px-4 text-chocolate outline-none ring-pink/30 focus:ring-2"
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
        className="min-h-11 rounded-2xl border border-pink/40 bg-paper/80 px-4 text-chocolate outline-none ring-pink/30 focus:ring-2"
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
