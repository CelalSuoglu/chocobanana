"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";

/** Clears local cart after a confirmed Stripe success page visit. */
export function ClearCartOnSuccess({ active }: { active: boolean }) {
  const { clearCart, ready } = useCart();

  useEffect(() => {
    if (active && ready) {
      clearCart();
      window.sessionStorage.removeItem("chocobanana_checkout_delivery");
    }
  }, [active, ready, clearCart]);

  return null;
}
