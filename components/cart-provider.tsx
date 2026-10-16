"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCatalogProduct } from "@/lib/catalog/products";
import {
  cartItemCount,
  cartStorageKey,
  normalizeCart,
  type CartLine,
} from "@/lib/cart/types";

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  itemCount: number;
  addItem: (productId: string, quantity?: number) => boolean;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function purchasableLines(lines: CartLine[]): CartLine[] {
  return normalizeCart(lines).filter((line) => {
    const product = getCatalogProduct(line.productId);
    return Boolean(product?.purchasable && product.cartEligible);
  });
}

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(cartStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return purchasableLines(
      parsed.map((item) => ({
        productId: String((item as CartLine).productId ?? ""),
        quantity: Number((item as CartLine).quantity ?? 0),
      })),
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(lines));
  }, [lines, ready]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const product = getCatalogProduct(productId);
    if (!product?.purchasable || !product.cartEligible || quantity <= 0) return false;
    setLines((current) => purchasableLines([...current, { productId, quantity }]));
    return true;
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) {
        return current.filter((line) => line.productId !== productId);
      }
      return normalizeCart(
        current.map((line) =>
          line.productId === productId ? { ...line, quantity } : line,
        ),
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((current) =>
      current.filter((line) => line.productId !== productId),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      itemCount: cartItemCount(lines),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [lines, ready, addItem, setQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
