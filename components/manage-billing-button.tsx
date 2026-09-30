"use client";

import { useState } from "react";

export function ManageBillingButton({
  locale,
  label,
  unavailableLabel,
}: {
  locale: string;
  label: string;
  unavailableLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || unavailableLabel);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(unavailableLabel);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={openPortal}
        className="btn-primary btn-inline"
      >
        {pending ? "…" : label}
      </button>
      {error ? (
        <p className="text-xs text-pink-deep" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
