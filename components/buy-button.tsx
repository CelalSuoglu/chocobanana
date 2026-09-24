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
};

export function BuyButton({
  productId,
  locale,
  label,
  unavailableLabel,
  errorLabel,
  enabled,
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
    <div className="mt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-chocolate/80 bg-transparent px-5 py-2.5 font-serif text-sm tracking-[0.12em] uppercase text-chocolate transition-all duration-300 hover:border-pink-deep hover:bg-pink-soft/60 disabled:cursor-wait disabled:opacity-60"
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
