"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";

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
  const [justAdded, setJustAdded] = useState(false);

  return (
    <button
      type="button"
      className={`${className} btn-secondary`}
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
