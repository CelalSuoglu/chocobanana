"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyButton } from "@/components/buy-button";
import {
  SNAIL_MAIL_REGIONS,
  SNAIL_MAIL_TERMS,
  snailMailPriceCadCents,
  snailMailProductId,
  type SnailMailRegion,
  type SnailMailTerm,
} from "@/lib/catalog/snail-mail";
import { baseCurrency, formatCatalogPrice } from "@/lib/currency/config";
import type { Locale } from "@/lib/i18n/config";

type SnailMailPackagePickerProps = {
  locale: Locale;
  enabled: boolean;
  labels: {
    listedPriceLabel: string;
    termLabel: string;
    regionLabel: string;
    term1: string;
    term3: string;
    term12: string;
    regionCanada: string;
    regionUsa: string;
    regionInternational: string;
    oneEnvelope: string;
    paidOnce: string;
    postageIncluded: string;
    internationalNote: string;
    detailsTitle: string;
    checkout: string;
    addPackage: string;
    added: string;
    unavailable: string;
    error: string;
  };
};

const termLabels = {
  1: "term1",
  3: "term3",
  12: "term12",
} as const;

const regionLabels = {
  canada: "regionCanada",
  usa: "regionUsa",
  international: "regionInternational",
} as const;

export function SnailMailPackagePicker({
  locale,
  enabled,
  labels,
}: SnailMailPackagePickerProps) {
  const [term, setTerm] = useState<SnailMailTerm>(1);
  const [region, setRegion] = useState<SnailMailRegion>("canada");
  const productId = snailMailProductId(term, region);
  const priced = formatCatalogPrice({
    amountCadCents: snailMailPriceCadCents(region, term),
    locale,
    preferredCurrency: baseCurrency,
  });

  return (
    <div>
      <fieldset>
        <legend className="text-sm text-chocolate">{labels.termLabel}</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {SNAIL_MAIL_TERMS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={term === option}
              onClick={() => setTerm(option)}
              className={`min-h-11 rounded-full border px-3 text-sm ${
                term === option
                  ? "border-chocolate bg-chocolate text-paper"
                  : "border-chocolate/20 bg-paper text-chocolate"
              }`}
            >
              {labels[termLabels[option]]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm text-chocolate">{labels.regionLabel}</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SNAIL_MAIL_REGIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={region === option}
              onClick={() => setRegion(option)}
              className={`min-h-11 rounded-full border px-3 text-sm ${
                region === option
                  ? "border-chocolate bg-chocolate text-paper"
                  : "border-chocolate/20 bg-paper text-chocolate"
              }`}
            >
              {labels[regionLabels[option]]}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="mt-6 text-sm text-chocolate-soft">{labels.listedPriceLabel}</p>
      <p className="font-serif text-4xl text-chocolate">{priced.primary}</p>
      <p className="mt-2 text-sm text-chocolate-soft">{labels.postageIncluded}</p>
      <p className="mt-1 text-sm text-chocolate-soft">{labels.paidOnce}</p>

      <BuyButton
        productId={productId}
        locale={locale}
        label={labels.checkout}
        unavailableLabel={labels.unavailable}
        errorLabel={labels.error}
        enabled={enabled}
        className="mt-5"
      />
      {enabled ? (
        <AddToCartButton
          productId={productId}
          label={labels.addPackage}
          addedLabel={labels.added}
          className="mt-3"
        />
      ) : null}
      {region === "international" ? (
        <p className="mt-5 text-sm leading-relaxed text-chocolate-soft">{labels.internationalNote}</p>
      ) : null}
    </div>
  );
}
