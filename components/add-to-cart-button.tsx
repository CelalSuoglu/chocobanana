"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";

type AddToCartButtonProps = {
  productId: string;
  label: string;
  addedLabel: string;
};

export function AddToCartButton({
  productId,
  label,
  addedLabel,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  return (
    <button
      type="button"
      className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-chocolate/80 bg-transparent px-5 py-2.5 font-serif text-sm tracking-[0.12em] uppercase text-chocolate transition-all duration-300 hover:border-pink-deep hover:bg-pink-soft/60"
      onClick={() => {
        addItem(productId, 1);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1200);
      }}
    >
      {justAdded ? addedLabel : label}
    </button>
  );
}
