"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart-provider";
import {
  getCatalogProduct,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  baseCurrency,
  formatCatalogPrice,
} from "@/lib/currency/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

type CartPageClientProps = {
  locale: Locale;
  dict: Dictionary;
  checkoutEnabled: boolean;
  signedIn: boolean;
};

function localizedName(dict: Dictionary, product: CatalogProduct): string {
  if (product.shopKey) {
    return dict.shop.products[product.shopKey].name;
  }
  return product.nameEn;
}

export function CartPageClient({
  locale,
  dict,
  checkoutEnabled,
  signedIn,
}: CartPageClientProps) {
  const { lines, ready, setQuantity, removeItem, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [rewardInput, setRewardInput] = useState("");
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [rewardPending, setRewardPending] = useState(false);
  const [appliedReward, setAppliedReward] = useState<{
    code: string;
    discountCadCents: number;
    totalCadCents: number;
  } | null>(null);

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

  const hasClub = rows.some((row) => row.product.family === "snail_mail");
  const hasSticker = rows.some((row) => row.product.family === "sticker");
  const itemKey = rows
    .map((row) => `${row.product.id}:${row.line.quantity}`)
    .join("|");
  const priced = formatCatalogPrice({
    amountCadCents: subtotalCadCents,
    locale,
    preferredCurrency: baseCurrency,
  });

  useEffect(() => {
    if (!signedIn || !appliedReward) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/rewards/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: appliedReward.code,
            items: rows.map((row) => ({
              productId: row.product.id,
              quantity: row.line.quantity,
            })),
          }),
        });
        const data = (await response.json()) as {
          code?: string;
          discountCadCents?: number;
          totalCadCents?: number;
          error?: string;
        };
        if (cancelled) return;
        if (
          !response.ok ||
          !data.code ||
          typeof data.discountCadCents !== "number" ||
          typeof data.totalCadCents !== "number"
        ) {
          setAppliedReward(null);
          setRewardError(dict.cart.rewardInvalid);
          return;
        }
        setAppliedReward({
          code: data.code,
          discountCadCents: data.discountCadCents,
          totalCadCents: data.totalCadCents,
        });
      } catch {
        if (!cancelled) setRewardError(dict.cart.rewardInvalid);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-quote when the cart changes. The applied code is read from state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey, signedIn]);

  function applyReward() {
    setRewardError(null);
    setRewardPending(true);
    void (async () => {
      try {
        const response = await fetch("/api/rewards/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: rewardInput,
            items: rows.map((row) => ({
              productId: row.product.id,
              quantity: row.line.quantity,
            })),
            amountCadCents: 1,
          }),
        });
        const data = (await response.json()) as {
          code?: string;
          discountCadCents?: number;
          totalCadCents?: number;
          error?: string;
        };
        if (
          !response.ok ||
          !data.code ||
          typeof data.discountCadCents !== "number" ||
          typeof data.totalCadCents !== "number"
        ) {
          setAppliedReward(null);
          setRewardError(
            data.error === "reward_signin"
              ? dict.cart.rewardSignIn
              : data.error === "reward_busy"
                ? dict.cart.rewardBusy
                : data.error === "reward_first_order"
                  ? dict.cart.rewardFirstOrder
                  : dict.cart.rewardInvalid,
          );
          return;
        }
        setAppliedReward({
          code: data.code,
          discountCadCents: data.discountCadCents,
          totalCadCents: data.totalCadCents,
        });
        setRewardInput(data.code);
      } catch {
        setRewardError(dict.cart.rewardInvalid);
      } finally {
        setRewardPending(false);
      }
    })();
  }

  const discountPriced = appliedReward
    ? formatCatalogPrice({
        amountCadCents: appliedReward.discountCadCents,
        locale,
        preferredCurrency: baseCurrency,
      })
    : null;
  const totalPriced = appliedReward
    ? formatCatalogPrice({
        amountCadCents: appliedReward.totalCadCents,
        locale,
        preferredCurrency: baseCurrency,
      })
    : priced;

  function checkout() {
    setError(null);
    if (hasClub && hasSticker) {
      setError(dict.cart.mixedCheckout);
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            items: rows.map((row) => ({
              productId: row.product.id,
              quantity: row.line.quantity,
            })),
            ...(appliedReward ? { rewardCode: appliedReward.code } : {}),
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
      <div className="store-card mt-8 animate-pulse p-6" aria-busy="true">
        <p className="font-serif text-lg text-chocolate">{dict.cart.loading}</p>
        <div className="mt-4 h-20 rounded-2xl bg-cream-deep/70" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="store-card mx-auto mt-8 max-w-lg px-6 py-10 text-center">
        <p className="font-script text-2xl text-pink-deep">{dict.cart.eyebrow}</p>
        <p className="mt-3 text-base text-chocolate-soft">{dict.cart.empty}</p>
        <Link
          href={hrefFor(locale, "/shop")}
          className="btn-primary mx-auto mt-6 max-w-xs"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pb-0">
      <ul className="space-y-3">
        {rows.map(({ line, product }) => {
          const unit = formatCatalogPrice({
            amountCadCents: product.amountCadCents,
            locale,
            preferredCurrency: baseCurrency,
          });
          const lineTotal = formatCatalogPrice({
            amountCadCents: product.amountCadCents * line.quantity,
            locale,
            preferredCurrency: baseCurrency,
          });
          const name = localizedName(dict, product);
          const productHref =
            product.family === "snail_mail"
              ? hrefFor(locale, "/snail-mail-club")
              : product.family === "sticker"
                ? hrefFor(locale, `/sticker-sheets/${product.id}`)
                : hrefFor(locale, `/shop/${product.id}`);
          const lineKind =
            product.family === "snail_mail"
              ? dict.cart.lineClub
              : product.family === "sticker"
                ? dict.cart.lineSticker
                : dict.cart.lineShop;

          return (
            <li key={product.id} className="store-card p-4">
              <div className="flex gap-4">
                <Link
                  href={productHref}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream-deep/50 sm:h-24 sm:w-24"
                >
                  <Image
                    src={product.imageSrc}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-pink-deep">
                    {lineKind}
                  </p>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <h2 className="font-serif text-lg text-chocolate sm:text-xl">
                      <Link href={productHref}>
                        {name}
                      </Link>
                    </h2>
                    <p className="shrink-0 font-serif text-lg text-chocolate">
                      {lineTotal.primary}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-chocolate-soft">
                    {dict.cart.unitPrice}: {unit.primary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-pink/45">
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center text-lg text-chocolate"
                        aria-label={dict.cart.decrease}
                        onClick={() => setQuantity(product.id, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center font-serif text-chocolate">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center text-lg text-chocolate"
                        aria-label={dict.cart.increase}
                        onClick={() => setQuantity(product.id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="min-h-11 px-2 text-sm text-pink-deep underline-offset-2 hover:underline"
                      onClick={() => removeItem(product.id)}
                    >
                      {dict.cart.remove}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="store-card px-5 py-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl text-chocolate">{dict.cart.checkout}</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-chocolate-soft">
              {dict.cart.subtotal} ({baseCurrency})
            </dt>
            <dd className="font-serif text-lg text-chocolate">{priced.primary}</dd>
          </div>
          {hasClub ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-chocolate-soft">{dict.cart.lineClub}</dt>
              <dd className="text-end text-chocolate">{dict.cart.shippingIncluded}</dd>
            </div>
          ) : null}
          {hasSticker ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-chocolate-soft">{dict.cart.stickerShipping}</dt>
              <dd className="text-end text-chocolate">{dict.cart.stickerShippingValue}</dd>
            </div>
          ) : null}
          {!hasClub && !hasSticker ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-chocolate-soft">{dict.cart.shipping}</dt>
              <dd className="text-end text-chocolate">{dict.cart.shippingAtCheckout}</dd>
            </div>
          ) : null}
          {appliedReward && discountPriced ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-chocolate-soft">{dict.cart.rewardDiscount}</dt>
              <dd className="text-end text-chocolate">−{discountPriced.primary}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-4 border-t border-pink/30 pt-3">
            <dt className="font-serif text-base text-chocolate">{dict.cart.total}</dt>
            <dd className="text-end font-serif text-lg text-chocolate">
              {totalPriced.primary}
            </dd>
          </div>
        </dl>
        {signedIn ? (
          <div className="mt-4">
            <label className="text-sm text-chocolate" htmlFor="reward-code">
              {dict.cart.rewardCode}
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="reward-code"
                value={rewardInput}
                onChange={(event) => setRewardInput(event.target.value)}
                autoComplete="off"
                className="min-h-14 min-w-0 flex-1 rounded-full border border-pink/50 bg-paper px-5 text-base text-chocolate"
              />
              <button
                type="button"
                className="btn-secondary !h-9 !min-h-9 !w-auto shrink-0 !px-3 !text-xs !tracking-normal"
                disabled={rewardPending || !rewardInput.trim()}
                onClick={applyReward}
              >
                {dict.cart.rewardApply}
              </button>
            </div>
            {appliedReward ? (
              <button
                type="button"
                className="mt-2 min-h-11 text-sm text-pink-deep"
                onClick={() => {
                  setAppliedReward(null);
                  setRewardError(null);
                }}
              >
                {dict.cart.rewardRemove}
              </button>
            ) : null}
            {rewardError ? (
              <p className="mt-2 text-sm text-pink-deep" role="alert">
                {rewardError}
              </p>
            ) : null}
            <p className="mt-2 text-xs leading-relaxed text-chocolate-soft">
              {dict.cart.rewardHint}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-chocolate-soft">{dict.cart.rewardSignIn}</p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-chocolate-soft">
          {dict.cart.cadBasisNote}
        </p>
        {hasClub ? (
          <p className="mt-2 text-xs leading-relaxed text-chocolate-soft">
            {dict.cart.postageIncludedNote}
          </p>
        ) : null}
        {hasSticker ? (
          <p className="mt-2 text-xs leading-relaxed text-chocolate-soft">
            {dict.cart.stickerShippingNote}
          </p>
        ) : null}
        {!hasClub && !hasSticker ? (
          <p className="mt-2 text-xs leading-relaxed text-chocolate-soft">
            {dict.cart.checkoutFinalNote}
          </p>
        ) : null}

        {checkoutEnabled ? (
          <button
            type="button"
            disabled={pending}
            onClick={checkout}
            className="btn-primary mt-5 hidden lg:flex"
          >
            {pending ? dict.cart.checkoutPending : dict.cart.continueCheckout}
          </button>
        ) : (
          <p className="mt-5 rounded-2xl bg-cream-deep/50 px-3 py-3 text-sm text-chocolate-soft">
            {dict.cart.checkoutUnavailable}
          </p>
        )}

        {error ? (
          <p
            className="notice notice-error mt-3"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {!signedIn ? (
          <div className="mt-5 border-t border-pink/30 pt-4">
            <p className="text-sm leading-relaxed text-chocolate-soft">
              {dict.cart.guestNote}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href={hrefFor(locale, "/login")} className="btn-secondary">
                {dict.auth.signIn}
              </Link>
              <Link href={hrefFor(locale, "/register")} className="btn-secondary">
                {dict.auth.signUp}
              </Link>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="mt-4 min-h-11 text-sm text-chocolate-soft underline-offset-2 hover:underline"
          onClick={() => clearCart()}
        >
          {dict.cart.clear}
        </button>
      </aside>
      {checkoutEnabled ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-pink/40 bg-cream/95 p-3 backdrop-blur-md lg:hidden">
          <button type="button" disabled={pending} onClick={checkout} className="btn-primary">
            {pending ? dict.cart.checkoutPending : dict.cart.continueCheckout}
          </button>
        </div>
      ) : null}
    </div>
  );
}
