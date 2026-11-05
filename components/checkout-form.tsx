"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { CheckoutSteps } from "@/components/checkout-steps";
import { JoinClubBanner } from "@/components/join-club-banner";
import {
  allowedCountriesForRegions,
  deliveryCountryOptions,
  deliveryFieldErrors,
  deliveryRegionLabel,
  regionChoices,
  type DeliveryField,
  type DeliveryFieldError,
} from "@/lib/checkout/address";
import { getCatalogProduct, type CatalogProduct } from "@/lib/catalog/products";
import { type SnailMailRegion } from "@/lib/catalog/snail-mail";
import { STICKER_POSTAGE_PER_SHEET_CAD_CENTS } from "@/lib/catalog/sticker-sheets";
import { baseCurrency, formatCatalogPrice } from "@/lib/currency/config";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";
import { rewardDiscountCadCents } from "@/lib/rewards/logic";

export type CheckoutProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

type CheckoutLabels = {
  acceptTerms: string;
  termsLink: string;
  acceptTermsEnd: string;
  acceptRequired: string;
  dutiesNote: string;
  shipTitle: string;
  shipIntro: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  region: string;
  postal: string;
  phone: string;
  continuePayment: string;
  pending: string;
  summary: string;
  deliveryRegion: string;
  regionCanada: string;
  regionUsa: string;
  regionInternational: string;
  postageIncluded: string;
  shippingLine: string;
  total: string;
  countryMismatch: string;
  addressInvalid: string;
  empty: string;
  continueShopping: string;
  error: string;
  welcomeDiscount: string;
  rewardDiscount: string;
  joinTitle: string;
  joinNote: string;
  createAccount: string;
  stepDetails: string;
  stepPayment: string;
  stepConfirmation: string;
  stepsLabel: string;
  fieldRequired: string;
  emailInvalid: string;
  postalInvalid: string;
  phoneInvalid: string;
  regionInvalid: string;
};

type CheckoutFormProps = {
  locale: Locale;
  signedIn: boolean;
  welcomeEligible: boolean;
  profile: CheckoutProfile | null;
  productId?: string;
  labels: CheckoutLabels;
};

type Draft = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
};

const DRAFT_KEY = "chocobanana_checkout_delivery";

function regionName(region: SnailMailRegion, labels: CheckoutLabels) {
  if (region === "canada") return labels.regionCanada;
  if (region === "usa") return labels.regionUsa;
  return labels.regionInternational;
}

function draftFromProfile(profile: CheckoutProfile | null): Draft {
  return {
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    email: profile?.email ?? "",
    country: profile?.country?.toUpperCase() || "CA",
    line1: profile?.line1 ?? "",
    line2: profile?.line2 ?? "",
    city: profile?.city ?? "",
    region: profile?.region ?? "",
    postalCode: profile?.postalCode ?? "",
    phone: profile?.phone ?? "",
  };
}

function readDraft(fallback: Draft): Draft {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    const next = { ...fallback };
    (Object.keys(fallback) as Array<keyof Draft>).forEach((key) => {
      if (typeof parsed[key] === "string") next[key] = parsed[key];
    });
    return next;
  } catch {
    return fallback;
  }
}

function errorText(code: DeliveryFieldError, labels: CheckoutLabels) {
  if (code === "email") return labels.emailInvalid;
  if (code === "postal") return labels.postalInvalid;
  if (code === "phone") return labels.phoneInvalid;
  if (code === "region") return labels.regionInvalid;
  if (code === "country") return labels.countryMismatch;
  return labels.fieldRequired;
}

export function CheckoutForm({
  locale,
  signedIn,
  welcomeEligible,
  profile,
  productId,
  labels,
}: CheckoutFormProps) {
  const { lines, ready } = useCart();
  const [pending, setPending] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<DeliveryField, DeliveryFieldError>>>({});
  const [draft, setDraft] = useState<Draft>(() => draftFromProfile(profile));
  const [hydrated, setHydrated] = useState(false);
  const [manualReward, setManualReward] = useState(false);

  useEffect(() => {
    setDraft(readDraft(draftFromProfile(profile)));
    setHydrated(true);
    setManualReward(
      signedIn && Boolean(window.sessionStorage.getItem("chocobanana_checkout_reward")),
    );
  }, [profile, signedIn]);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const rows = useMemo(() => {
    const source = productId ? [{ productId, quantity: 1 }] : lines;
    return source
      .map((line) => {
        const product = getCatalogProduct(line.productId);
        if (!product) return null;
        return { line, product };
      })
      .filter((entry): entry is { line: { productId: string; quantity: number }; product: CatalogProduct } =>
        Boolean(entry),
      );
  }, [lines, productId]);

  const regions = [
    ...new Set(
      rows
        .map((row) => row.product.snailMail?.region)
        .filter((value): value is SnailMailRegion => Boolean(value)),
    ),
  ];
  const allowed = allowedCountriesForRegions(regions);
  const countryChoices = deliveryCountryOptions().filter((option) =>
    allowed.includes(option.code),
  );
  const selectedCountry = countryChoices.some((option) => option.code === draft.country)
    ? draft.country
    : countryChoices[0]?.code ?? "";
  const choices = regionChoices(selectedCountry);
  const deliveryRegion = deliveryRegionLabel(selectedCountry);
  const subtotal = rows.reduce(
    (sum, row) => sum + row.product.amountCadCents * row.line.quantity,
    0,
  );
  const showWelcome = signedIn && welcomeEligible && !manualReward;
  const discountCents =
    showWelcome || manualReward ? rewardDiscountCadCents(subtotal) : 0;
  const discount = formatCatalogPrice({
    amountCadCents: discountCents,
    locale,
    preferredCurrency: baseCurrency,
  });
  const stickerSheets = rows
    .filter((row) => row.product.family === "sticker")
    .reduce((sum, row) => sum + row.line.quantity, 0);
  // Mirrors the server: extra postage per sticker sheet outside Canada.
  const postageCents =
    stickerSheets * STICKER_POSTAGE_PER_SHEET_CAD_CENTS[deliveryRegion ?? "international"];
  const postage = formatCatalogPrice({
    amountCadCents: postageCents,
    locale,
    preferredCurrency: baseCurrency,
  });
  const total = formatCatalogPrice({
    amountCadCents: Math.max(0, subtotal - discountCents) + postageCents,
    locale,
    preferredCurrency: baseCurrency,
  });
  const mixedRegions = regions.length > 1;

  function update(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || mixedRegions || rows.length === 0) return;
    if (!acceptedTerms) {
      setError(labels.acceptRequired);
      document.getElementById("checkout-terms")?.focus();
      return;
    }
    const delivery = { ...draft, country: selectedCountry };
    const problems = deliveryFieldErrors(delivery, allowed);
    setFieldErrors(problems);
    setError(null);
    const first = (Object.keys(problems) as DeliveryField[])[0];
    if (first) {
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }
    setPending(true);
    try {
      const rewardCode = signedIn
        ? window.sessionStorage.getItem("chocobanana_checkout_reward") || undefined
        : undefined;
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          items: rows.map((row) => ({
            productId: row.product.id,
            quantity: row.line.quantity,
          })),
          ...(rewardCode ? { rewardCode } : {}),
          delivery,
          acceptTerms: true,
        }),
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        console.error("checkout_start_failed", body.error ?? response.status);
        if (body.error === "country_mismatch") {
          setError(labels.countryMismatch);
        } else if (body.error === "address_invalid") {
          const again = deliveryFieldErrors(delivery, allowed);
          setFieldErrors(again);
          if (Object.keys(again).length === 0) setError(labels.addressInvalid);
        } else {
          setError(labels.error);
        }
        setPending(false);
        return;
      }
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(delivery));
      window.location.assign(body.url);
    } catch (cause) {
      console.error("checkout_start_failed", cause instanceof Error ? cause.name : "network");
      setError(labels.error);
      setPending(false);
    }
  }

  if (!ready && !productId) {
    return <p className="mt-8 text-sm text-chocolate-soft">{labels.summary}</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto mt-10 max-w-lg text-center">
        <p className="text-chocolate-soft">{labels.empty}</p>
        <Link href={hrefFor(locale, "")} className="btn-primary mx-auto mt-6 max-w-xs">
          {labels.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]" noValidate>
      <section>
        <CheckoutSteps
          current={pending ? "payment" : "details"}
          label={labels.stepsLabel}
          details={labels.stepDetails}
          payment={labels.stepPayment}
          confirmation={labels.stepConfirmation}
        />
        {!signedIn ? (
          <div className="mt-6">
            <JoinClubBanner
              title={labels.joinTitle}
              note={labels.joinNote}
              actionLabel={labels.createAccount}
              href={hrefFor(locale, "/register")}
            />
          </div>
        ) : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            id="checkout-firstName"
            label={labels.firstName}
            name="firstName"
            value={draft.firstName}
            autoComplete="given-name"
            error={fieldErrors.firstName ? errorText(fieldErrors.firstName, labels) : undefined}
            onChange={(value) => update({ firstName: value })}
          />
          <Field
            id="checkout-lastName"
            label={labels.lastName}
            name="lastName"
            value={draft.lastName}
            autoComplete="family-name"
            error={fieldErrors.lastName ? errorText(fieldErrors.lastName, labels) : undefined}
            onChange={(value) => update({ lastName: value })}
          />
          <Field
            id="checkout-email"
            label={labels.email}
            name="email"
            type="email"
            value={draft.email}
            autoComplete="email"
            className="sm:col-span-2"
            error={fieldErrors.email ? errorText(fieldErrors.email, labels) : undefined}
            onChange={(value) => update({ email: value })}
          />
          <label className="block sm:col-span-2">
            <span className="mb-2 block font-serif text-sm text-chocolate">{labels.country}</span>
            <select
              id="checkout-country"
              name="country"
              value={selectedCountry}
              aria-invalid={fieldErrors.country ? true : undefined}
              aria-describedby={fieldErrors.country ? "checkout-country-error" : undefined}
              onChange={(event) => update({ country: event.target.value, region: "" })}
              className="field"
            >
              {countryChoices.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.country ? (
              <p id="checkout-country-error" className="mt-1 text-sm text-chocolate">
                {errorText(fieldErrors.country, labels)}
              </p>
            ) : null}
          </label>
          <Field
            id="checkout-line1"
            label={labels.address}
            name="line1"
            value={draft.line1}
            autoComplete="address-line1"
            className="sm:col-span-2"
            error={fieldErrors.line1 ? errorText(fieldErrors.line1, labels) : undefined}
            onChange={(value) => update({ line1: value })}
          />
          <Field
            id="checkout-line2"
            label={labels.apartment}
            name="line2"
            value={draft.line2}
            autoComplete="address-line2"
            required={false}
            className="sm:col-span-2"
            onChange={(value) => update({ line2: value })}
          />
          <Field
            id="checkout-city"
            label={labels.city}
            name="city"
            value={draft.city}
            autoComplete="address-level2"
            error={fieldErrors.city ? errorText(fieldErrors.city, labels) : undefined}
            onChange={(value) => update({ city: value })}
          />
          <label className="block">
            <span className="mb-2 block font-serif text-sm text-chocolate">{labels.region}</span>
            {choices ? (
              <select
                id="checkout-region"
                name="region"
                value={choices.some(([code]) => code === draft.region) ? draft.region : ""}
                aria-invalid={fieldErrors.region ? true : undefined}
                aria-describedby={fieldErrors.region ? "checkout-region-error" : undefined}
                onChange={(event) => update({ region: event.target.value })}
                className="field"
              >
                <option value="" />
                {choices.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="checkout-region"
                name="region"
                value={draft.region}
                autoComplete="address-level1"
                aria-invalid={fieldErrors.region ? true : undefined}
                aria-describedby={fieldErrors.region ? "checkout-region-error" : undefined}
                onChange={(event) => update({ region: event.target.value })}
                className="field"
              />
            )}
            {fieldErrors.region ? (
              <p id="checkout-region-error" className="mt-1 text-sm text-chocolate">
                {errorText(fieldErrors.region, labels)}
              </p>
            ) : null}
          </label>
          <Field
            id="checkout-postalCode"
            label={labels.postal}
            name="postalCode"
            value={draft.postalCode}
            autoComplete="postal-code"
            error={fieldErrors.postalCode ? errorText(fieldErrors.postalCode, labels) : undefined}
            onChange={(value) => update({ postalCode: value })}
          />
          <Field
            id="checkout-phone"
            label={labels.phone}
            name="phone"
            type="tel"
            value={draft.phone}
            autoComplete="tel"
            error={fieldErrors.phone ? errorText(fieldErrors.phone, labels) : undefined}
            onChange={(value) => update({ phone: value })}
          />
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-line bg-paper p-5 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl text-chocolate">{labels.summary}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {rows.map((row) => {
            const price = formatCatalogPrice({
              amountCadCents: row.product.amountCadCents * row.line.quantity,
              locale,
              preferredCurrency: baseCurrency,
            });
            return (
              <li key={row.product.id} className="flex items-baseline justify-between gap-3">
                <span className="text-chocolate">
                  {row.product.nameEn} ×{row.line.quantity}
                </span>
                <span className="shrink-0 font-serif text-chocolate">{price.primary}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-chocolate-soft">{labels.deliveryRegion}</dt>
            <dd className="text-end text-chocolate">
              {deliveryRegion ? regionName(deliveryRegion, labels) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-chocolate-soft">{labels.shippingLine}</dt>
            <dd className="text-chocolate">
              {postageCents > 0 ? postage.primary : labels.postageIncluded}
            </dd>
          </div>
          {discountCents > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-chocolate-soft">
                {manualReward ? labels.rewardDiscount : labels.welcomeDiscount}
              </dt>
              <dd className="text-chocolate">−{discount.primary}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3 border-t border-line pt-3">
            <dt className="font-serif text-base text-chocolate">{labels.total}</dt>
            <dd className="font-serif text-lg text-chocolate">{total.primary}</dd>
          </div>
        </dl>
        {mixedRegions ? (
          <p className="mt-4 text-sm text-chocolate" role="alert">
            {labels.countryMismatch}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-chocolate" role="alert">
            {error}
          </p>
        ) : null}
        {selectedCountry && selectedCountry !== "CA" ? (
          <p className="mt-4 text-xs leading-relaxed text-chocolate-soft">{labels.dutiesNote}</p>
        ) : null}
        <label htmlFor="checkout-terms" className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-chocolate">
          <input
            id="checkout-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => {
              setAcceptedTerms(event.target.checked);
              if (event.target.checked) setError(null);
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--chocolate)]"
          />
          <span>
            {labels.acceptTerms}{labels.acceptTerms ? " " : ""}
            <Link href={hrefFor(locale, "/terms")} target="_blank" className="underline underline-offset-2">
              {labels.termsLink}
            </Link>{" "}
            {labels.acceptTermsEnd}
          </span>
        </label>
        <button
          type="submit"
          className="btn-primary mt-5 w-full"
          disabled={pending || mixedRegions}
          aria-busy={pending}
        >
          {pending ? labels.pending : labels.continuePayment}
        </button>
      </aside>
    </form>
  );
}

function Field({
  id,
  label,
  name,
  value,
  autoComplete,
  type = "text",
  required = true,
  className = "",
  error,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  autoComplete: string;
  type?: string;
  required?: boolean;
  className?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block font-serif text-sm text-chocolate">{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-chocolate">
          {error}
        </p>
      ) : null}
    </label>
  );
}
