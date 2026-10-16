"use client";

import { useActionState, useEffect, useRef } from "react";
import { AuthField } from "@/components/auth-form";
import { useToast } from "@/components/toast-provider";
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
  const toast = useToast();
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && state.ok) {
      toast?.notify({ message: dict.account.savedToast, tone: "ok" });
    }
    wasPending.current = pending;
  }, [pending, state.ok, dict.account.savedToast, toast]);

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
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="btn-secondary btn-inline"
      >
        {pending ? dict.account.saving : dict.account.saveProfile}
      </button>
    </form>
  );
}
