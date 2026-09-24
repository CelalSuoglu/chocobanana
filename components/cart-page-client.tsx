"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart-provider";
import {
  getCatalogProduct,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  baseCurrency,
  formatCatalogPrice,
  type CurrencyCode,
} from "@/lib/currency/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

type CartPageClientProps = {
  locale: Locale;
  currency: CurrencyCode;
  dict: Dictionary;
  checkoutEnabled: boolean;
};

function localizedName(dict: Dictionary, product: CatalogProduct): string {
  if (product.shopKey) {
    return dict.shop.products[product.shopKey].name;
  }
  return product.nameEn;
}

export function CartPageClient({
  locale,
  currency,
  dict,
  checkoutEnabled,
}: CartPageClientProps) {
  const { lines, ready, setQuantity, removeItem, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    return lines
      .map((line) => {
        const product = getCatalogProduct(line.productId);
        if (!product) return null;
        return { line, product };
      })
      .filter((entry): entry is { line: (typeof lines)[number]; product: CatalogProduct } =>
        Boolean(entry),
      );
  }, [lines]);

  const subtotalCadCents = rows.reduce(
    (sum, row) => sum + row.product.amountCadCents * row.line.quantity,
    0,
  );

  const priced = formatCatalogPrice({
    amountCadCents: subtotalCadCents,
    locale,
    preferredCurrency: currency,
  });

  function checkout() {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            items: lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
          }),
        });
        const data = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !data.url) {
          setError(data.error ?? dict.cart.checkoutError);
          return;
        }
        window.location.assign(data.url);
      } catch {
        setError(dict.cart.checkoutError);
      }
    });
  }

  if (!ready) {
    return (
      <p className="mt-10 text-center text-sm text-chocolate-soft">
        {dict.cart.loading}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-md text-center">
        <p className="text-base text-chocolate-soft">{dict.cart.empty}</p>
        <Link
          href={hrefFor(locale, "/shop")}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-chocolate/80 px-7 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-chocolate transition-colors hover:border-pink-deep hover:bg-pink-soft/60"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl">
      <ul className="space-y-4">
        {rows.map(({ line, product }) => {
          const unit = formatCatalogPrice({
            amountCadCents: product.amountCadCents,
            locale,
            preferredCurrency: currency,
          });
          const lineTotal = formatCatalogPrice({
            amountCadCents: product.amountCadCents * line.quantity,
            locale,
            preferredCurrency: currency,
          });

          return (
            <li
              key={product.id}
              className="rounded-3xl bg-paper/90 p-4 ring-1 ring-pink/35 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-pink/30 sm:mx-0">
                  <Image
                    src={product.imageSrc}
                    alt={localizedName(dict, product)}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-start">
                  <h2 className="font-serif text-xl text-chocolate">
                    {localizedName(dict, product)}
                  </h2>
                  <p className="mt-1 text-sm text-chocolate-soft">
                    {dict.cart.unitPrice}: {unit.primary}
                  </p>
                  <p className="mt-1 text-sm text-chocolate-soft">
                    {dict.cart.lineTotal}: {lineTotal.primary}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 sm:items-end">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink/45 text-chocolate hover:border-pink-deep"
                      aria-label={dict.cart.decrease}
                      onClick={() =>
                        setQuantity(product.id, line.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center font-serif text-lg text-chocolate">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink/45 text-chocolate hover:border-pink-deep"
                      aria-label={dict.cart.increase}
                      onClick={() =>
                        setQuantity(product.id, line.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs tracking-wide text-pink-deep underline-offset-2 hover:underline"
                    onClick={() => removeItem(product.id)}
                  >
                    {dict.cart.remove}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-3xl bg-cream-deep/40 px-5 py-6 text-center ring-1 ring-pink/30 sm:text-start">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-sm tracking-wide text-chocolate-soft">
              {dict.cart.subtotal} ({baseCurrency})
            </p>
            <p className="mt-1 font-serif text-2xl text-chocolate">
              {priced.primary}
            </p>
          </div>
          <button
            type="button"
            className="text-xs text-chocolate-soft underline-offset-2 hover:underline"
            onClick={() => clearCart()}
          >
            {dict.cart.clear}
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-chocolate-soft/90">
          {dict.cart.cadBasisNote}
        </p>
        {priced.isEstimateOnly ? (
          <p className="mt-2 text-xs leading-relaxed text-pink-deep">
            {dict.cart.estimateNote.replace("{currency}", currency)}
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-relaxed text-chocolate-soft/90">
          {dict.cart.checkoutFinalNote}
        </p>

        {checkoutEnabled ? (
          <button
            type="button"
            disabled={pending}
            onClick={checkout}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-chocolate/80 px-5 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-chocolate transition-colors hover:border-pink-deep hover:bg-pink-soft/60 disabled:opacity-60 sm:w-auto"
          >
            {pending ? dict.cart.checkoutPending : dict.cart.checkout}
          </button>
        ) : (
          <p className="mt-5 text-sm text-chocolate-soft">
            {dict.cart.checkoutUnavailable}
          </p>
        )}
        {error ? (
          <p className="mt-3 text-xs text-pink-deep" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
