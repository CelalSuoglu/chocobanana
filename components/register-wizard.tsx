"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AuthField, AuthSelect } from "@/components/auth-form";
import {
  registerCustomer,
  type AuthActionState,
} from "@/lib/auth/actions";
import type { Locale } from "@/lib/i18n/config";
import { hrefFor } from "@/lib/nav";

type CountryOption = { value: string; label: string };

type RegisterWizardProps = {
  locale: Locale;
  labels: {
    step1Title: string;
    step2Title: string;
    nextStep: string;
    backStep: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    countryPlaceholder: string;
    signUp: string;
    pleaseWait: string;
    haveAccount: string;
  };
  countries: CountryOption[];
};

const initial: AuthActionState = { ok: false };

export function RegisterWizard({
  locale,
  labels,
  countries,
}: RegisterWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
  });
  const [state, formAction, pending] = useActionState(registerCustomer, initial);

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  if (state.ok && state.message) {
    return (
      <div className="space-y-4 text-center">
        <p className="notice notice-ok" role="status">
          {state.message}
        </p>
        <Link href={hrefFor(locale, "/login")} className="btn-primary">
          {labels.haveAccount}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {/* Keep all fields mounted so values never drop between steps */}
      <div className={step === 1 ? "flex flex-col gap-4" : "hidden"}>
        <p className="font-serif text-lg text-chocolate">{labels.step1Title}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label={labels.firstName}
            name="firstName"
            autoComplete="given-name"
            defaultValue={values.firstName}
            onChange={(v) => update("firstName", v)}
          />
          <AuthField
            label={labels.lastName}
            name="lastName"
            autoComplete="family-name"
            defaultValue={values.lastName}
            onChange={(v) => update("lastName", v)}
          />
        </div>
        <AuthField
          label={labels.email}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values.email}
          onChange={(v) => update("email", v)}
        />
        <AuthField
          label={labels.password}
          name="password"
          type="password"
          autoComplete="new-password"
          defaultValue={values.password}
          onChange={(v) => update("password", v)}
        />
        <button
          type="button"
          className="btn-primary mt-1"
          onClick={() => setStep(2)}
        >
          {labels.nextStep}
        </button>
      </div>

      <div className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
        <p className="font-serif text-lg text-chocolate">{labels.step2Title}</p>
        <AuthField
          label={labels.phone}
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={values.phone}
          onChange={(v) => update("phone", v)}
        />
        <AuthField
          label={labels.addressLine1}
          name="addressLine1"
          autoComplete="address-line1"
          defaultValue={values.addressLine1}
          onChange={(v) => update("addressLine1", v)}
        />
        <AuthField
          label={labels.addressLine2}
          name="addressLine2"
          required={false}
          autoComplete="address-line2"
          defaultValue={values.addressLine2}
          onChange={(v) => update("addressLine2", v)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label={labels.city}
            name="city"
            autoComplete="address-level2"
            defaultValue={values.city}
            onChange={(v) => update("city", v)}
          />
          <AuthField
            label={labels.region}
            name="region"
            autoComplete="address-level1"
            defaultValue={values.region}
            onChange={(v) => update("region", v)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label={labels.postalCode}
            name="postalCode"
            autoComplete="postal-code"
            defaultValue={values.postalCode}
            onChange={(v) => update("postalCode", v)}
          />
          <AuthSelect
            label={labels.country}
            name="country"
            autoComplete="country"
            placeholder={labels.countryPlaceholder}
            options={countries}
            defaultValue={values.country}
            onChange={(v) => update("country", v)}
          />
        </div>
        {state.error ? (
          <p className="notice notice-error" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary btn-pair"
            onClick={() => setStep(1)}
          >
            {labels.backStep}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="btn-primary btn-pair"
          >
            {pending ? labels.pleaseWait : labels.signUp}
          </button>
        </div>
      </div>

      <p className="mt-2 text-center text-sm text-chocolate-soft">
        <Link
          href={hrefFor(locale, "/login")}
          className="text-pink-deep underline-offset-2 hover:underline"
        >
          {labels.haveAccount}
        </Link>
      </p>
    </form>
  );
}
