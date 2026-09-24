"use client";

import { useActionState } from "react";
import { AuthField, AuthSelect } from "@/components/auth-form";
import {
  updateCustomerProfile,
  type AuthActionState,
} from "@/lib/auth/actions";
import { signupCountries } from "@/lib/auth/countries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Profile = {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
};

const initial: AuthActionState = { ok: false };

export function AccountProfileForm({
  dict,
  locale,
  profile,
}: {
  dict: Dictionary;
  locale: string;
  profile: Profile;
}) {
  const [state, action, pending] = useActionState(updateCustomerProfile, initial);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <AuthField
        label={dict.auth.firstName}
        name="firstName"
        autoComplete="given-name"
        defaultValue={profile.firstName ?? ""}
      />
      <AuthField
        label={dict.auth.lastName}
        name="lastName"
        autoComplete="family-name"
        defaultValue={profile.lastName ?? ""}
      />
      <AuthField
        label={dict.auth.phone}
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={profile.phone ?? ""}
      />
      <AuthField
        label={dict.auth.addressLine1}
        name="addressLine1"
        autoComplete="address-line1"
        defaultValue={profile.addressLine1 ?? ""}
      />
      <AuthField
        label={dict.auth.addressLine2}
        name="addressLine2"
        required={false}
        autoComplete="address-line2"
        defaultValue={profile.addressLine2 ?? ""}
      />
      <AuthField
        label={dict.auth.city}
        name="city"
        autoComplete="address-level2"
        defaultValue={profile.city ?? ""}
      />
      <AuthField
        label={dict.auth.region}
        name="region"
        autoComplete="address-level1"
        defaultValue={profile.region ?? ""}
      />
      <AuthField
        label={dict.auth.postalCode}
        name="postalCode"
        autoComplete="postal-code"
        defaultValue={profile.postalCode ?? ""}
      />
      <AuthSelect
        label={dict.auth.country}
        name="country"
        autoComplete="country"
        placeholder={dict.auth.countryPlaceholder}
        defaultValue={profile.country ?? ""}
        options={signupCountries.map((country) => ({
          value: country.code,
          label: country.name,
        }))}
      />
      {state.error ? (
        <p className="text-sm text-pink-deep" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-chocolate-soft" role="status">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-chocolate/80 px-5 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-chocolate transition-colors hover:border-pink-deep hover:bg-pink-soft/60 disabled:opacity-60"
      >
        {pending ? "Saving…" : dict.account.saveProfile}
      </button>
    </form>
  );
}
