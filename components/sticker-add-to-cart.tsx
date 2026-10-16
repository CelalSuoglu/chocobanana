"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";

type StickerAddToCartProps = {
  productId: string;
  label: string;
  addedLabel: string;
  quantityLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
};

export function StickerAddToCart({
  productId,
  label,
  addedLabel,
  quantityLabel,
  decreaseLabel,
  increaseLabel,
}: StickerAddToCartProps) {
  const { addItem } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-6">
      <p className="text-sm text-chocolate-soft">{quantityLabel}</p>
      <div className="mt-2 inline-flex items-center rounded-full border border-line">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-lg text-chocolate"
          aria-label={decreaseLabel}
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
        >
          −
        </button>
        <span className="min-w-8 text-center font-serif text-chocolate">{quantity}</span>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-lg text-chocolate"
          aria-label={increaseLabel}
          onClick={() => setQuantity((current) => Math.min(99, current + 1))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="btn-secondary mt-4"
        disabled={pending}
        aria-busy={pending}
        onClick={() => {
          if (pending) return;
          setPending(true);
          const added = addItem(productId, quantity);
          if (added) toast?.notify({ message: addedLabel, tone: "ok" });
          setPending(false);
        }}
      >
        {label}
      </button>
    </div>
  );
}
