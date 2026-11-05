"use client";

import { useState } from "react";
import { submitWithdrawal } from "@/lib/legal/withdraw-actions";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type WithdrawFormProps = {
  dict: Dictionary["withdraw"];
  contactEmail: string;
};

export function WithdrawForm({ dict, contactEmail }: WithdrawFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ receivedAt: string; emailed: boolean } | null>(null);

  if (done) {
    return (
      <div role="status" className="store-card mt-8 px-6 py-6">
        <h2 className="font-serif text-2xl text-chocolate">{dict.sentTitle}</h2>
        <p className="body-copy mt-2">{dict.sentBody}</p>
        <p className="mt-3 text-sm text-chocolate">
          {dict.receivedAt}: <strong>{done.receivedAt}</strong>
        </p>
        {!done.emailed ? (
          <p className="mt-3 text-sm text-chocolate-soft">
            {dict.noEmail} {contactEmail}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        const result = await submitWithdrawal({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          orderNumber: String(data.get("orderNumber") ?? ""),
          items: String(data.get("items") ?? ""),
          website: String(data.get("website") ?? ""),
        });
        setPending(false);
        if (!result.ok) {
          setError(result.error === "invalid" ? dict.invalid : `${dict.unavailable} ${contactEmail}`);
          return;
        }
        setDone({ receivedAt: result.receivedAt, emailed: result.emailed });
      }}
    >
      {(
        [
          ["name", dict.name, "text", "name"],
          ["email", dict.email, "email", "email"],
          ["orderNumber", dict.orderNumber, "text", "off"],
        ] as const
      ).map(([id, label, type, autoComplete]) => (
        <div key={id}>
          <label htmlFor={`withdraw-${id}`} className="mb-2 block font-serif text-sm text-chocolate">
            {label}
          </label>
          <input
            id={`withdraw-${id}`}
            name={id}
            type={type}
            required
            autoComplete={autoComplete}
            className="field"
          />
        </div>
      ))}
      <div>
        <label htmlFor="withdraw-items" className="mb-2 block font-serif text-sm text-chocolate">
          {dict.items}
        </label>
        <textarea id="withdraw-items" name="items" rows={3} className="field" placeholder={dict.itemsHint} />
      </div>
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-chocolate">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary w-full" disabled={pending} aria-busy={pending}>
        {pending ? "…" : dict.confirm}
      </button>
    </form>
  );
}
