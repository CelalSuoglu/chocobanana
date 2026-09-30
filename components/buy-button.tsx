"use client";

import { useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n/config";

type BuyButtonProps = {
  productId: string;
  locale: Locale;
  label: string;
  unavailableLabel: string;
  errorLabel: string;
  enabled: boolean;
  className?: string;
};

export function BuyButton({
  productId,
  locale,
  label,
  unavailableLabel,
  errorLabel,
  enabled,
  className = "mt-4",
}: BuyButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!enabled) {
    return (
      <p className="mt-4 text-xs leading-relaxed text-chocolate-soft/90">
        {unavailableLabel}
      </p>
    );
  }

  function onClick() {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, locale }),
        });
        const data = (await response.json()) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || !data.url) {
          setError(data.error ?? errorLabel);
          return;
        }

        window.location.assign(data.url);
      } catch {
        setError(errorLabel);
      }
    });
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="btn-primary"
      >
        {pending ? "…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-pink-deep" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
