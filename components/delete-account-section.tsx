"use client";

import { useActionState, useState } from "react";
import { deleteCustomerAccount, type DeleteAccountState } from "@/lib/auth/delete-account";

type Labels = {
  title: string;
  description: string;
  open: string;
  passwordLabel: string;
  confirmLabel: string;
  submit: string;
  submitting: string;
  cancel: string;
  errors: Record<NonNullable<DeleteAccountState["error"]>, string>;
};

const initial: DeleteAccountState = { ok: false };

export function DeleteAccountSection({ locale, labels }: { locale: string; labels: Labels }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteCustomerAccount, initial);

  return (
    <section id="delete-account" className="mt-12 border-t border-line pt-8">
      <h3 className="font-serif text-xl text-chocolate">{labels.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{labels.description}</p>
      {!open ? (
        <button
          type="button"
          className="btn-secondary btn-inline mt-4"
          onClick={() => setOpen(true)}
        >
          {labels.open}
        </button>
      ) : (
        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block text-sm text-chocolate">
            {labels.passwordLabel}
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-1 block min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-chocolate"
            />
          </label>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-chocolate">
            <input type="checkbox" name="confirm" value="yes" required className="mt-1 h-5 w-5 shrink-0" />
            <span>{labels.confirmLabel}</span>
          </label>
          {state.error ? (
            <p role="alert" className="text-sm text-chocolate">
              {labels.errors[state.error]}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="btn-primary btn-inline"
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? labels.submitting : labels.submit}
            </button>
            <button
              type="button"
              className="btn-secondary btn-inline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {labels.cancel}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
