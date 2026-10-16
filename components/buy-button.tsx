"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  enabled,
  className = "mt-4",
}: BuyButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!enabled) {
    return (
      <p className="mt-4 text-xs leading-relaxed text-chocolate-soft/90">
        {unavailableLabel}
      </p>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        className="btn-primary"
        onClick={() => {
          setPending(true);
          router.push(`/${locale}/checkout?product=${encodeURIComponent(productId)}`);
        }}
      >
        {pending ? "…" : label}
      </button>
    </div>
  );
}
