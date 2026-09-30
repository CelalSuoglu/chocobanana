"use client";

import { useActionState } from "react";
import { AuthField } from "@/components/auth-form";
import {
  updateCustomerProfile,
  type AuthActionState,
} from "@/lib/auth/actions";
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
      <input type="hidden" name="addressLine1" value={profile.addressLine1 ?? ""} />
      <input
        type="hidden"
        name="addressLine2"
        value={profile.addressLine2 ?? ""}
      />
      <input type="hidden" name="city" value={profile.city ?? ""} />
      <input type="hidden" name="region" value={profile.region ?? ""} />
      <input type="hidden" name="postalCode" value={profile.postalCode ?? ""} />
      <input type="hidden" name="country" value={profile.country ?? ""} />
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
        {pending ? "Saving…" : dict.account.saveProfile}
      </button>
    </form>
  );
}
