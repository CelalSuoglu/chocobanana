"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";

type AddToCartButtonProps = {
  productId: string;
  label: string;
  addedLabel: string;
  className?: string;
};

export function AddToCartButton({
  productId,
  label,
  addedLabel,
  className = "mt-4",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={`${className} btn-secondary`}
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        if (pending) return;
        setPending(true);
        const added = addItem(productId, 1);
        if (added) toast?.notify({ message: addedLabel, tone: "ok" });
        setPending(false);
      }}
    >
      {label}
    </button>
  );
}
