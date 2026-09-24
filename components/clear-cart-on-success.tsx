"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";

/** Clears local cart after a confirmed Stripe success page visit. */
export function ClearCartOnSuccess({ active }: { active: boolean }) {
  const { clearCart, ready } = useCart();

  useEffect(() => {
    if (active && ready) {
      clearCart();
    }
  }, [active, ready, clearCart]);

  return null;
}
