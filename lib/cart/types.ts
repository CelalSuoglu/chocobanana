export type CartLine = {
  productId: string;
  quantity: number;
};

export const cartStorageKey = "chocobanana_cart_v1";

export function normalizeCart(lines: CartLine[]): CartLine[] {
  const map = new Map<string, number>();
  for (const line of lines) {
    if (!line.productId || line.quantity <= 0) continue;
    const qty = Math.min(99, Math.floor(line.quantity));
    map.set(line.productId, (map.get(line.productId) ?? 0) + qty);
  }
  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
