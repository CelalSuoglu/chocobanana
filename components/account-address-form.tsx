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

export function AccountAddressForm({
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
      <input type="hidden" name="firstName" value={profile.firstName ?? ""} />
      <input type="hidden" name="lastName" value={profile.lastName ?? ""} />
      <input type="hidden" name="phone" value={profile.phone ?? ""} />
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
        <p className="notice notice-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="notice notice-ok" role="status">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-secondary btn-inline"
      >
        {pending ? "Saving…" : dict.account.saveAddress}
      </button>
    </form>
  );
}
