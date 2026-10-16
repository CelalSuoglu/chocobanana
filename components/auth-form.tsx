"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  successHref?: string;
};

const initial: AuthActionState = { ok: false };

export function AuthForm({
  action,
  submitLabel,
  pendingLabel = "Please wait…",
  children,
  hiddenFields,
  successHref,
}: AuthFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initial);
  const showSuccess = state.ok && Boolean(state.message);
  const showError = !state.ok && Boolean(state.error);

  useEffect(() => {
    if (!showSuccess || !successHref) return;
    const timer = window.setTimeout(() => {
      router.push(successHref);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [router, showSuccess, successHref]);

  return (
    <form action={formAction} className="mx-auto flex w-full flex-col gap-4">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      {!showSuccess ? children : null}
      {showError ? (
        <p className="notice notice-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {showSuccess ? (
        <p className="notice notice-ok" role="status">
          {state.message}
        </p>
      ) : null}
      {!showSuccess ? (
        <button
          type="submit"
          disabled={pending}
          className="btn-primary mt-1"
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
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-start text-sm text-chocolate-soft">
      <span className="font-serif tracking-wide text-chocolate">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        {...(value !== undefined
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue, onChange: (e) => onChange?.(e.target.value) })}
        className="field"
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
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  options: { value: string; label: string }[];
  placeholder: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-start text-sm text-chocolate-soft">
      <span className="font-serif tracking-wide text-chocolate">{label}</span>
      <select
        name={name}
        required={required}
        autoComplete={autoComplete}
        {...(value !== undefined
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : {
              defaultValue: defaultValue ?? "",
              onChange: (e) => onChange?.(e.target.value),
            })}
        className="field"
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
