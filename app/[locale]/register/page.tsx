import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthField, AuthForm, AuthSelect } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { registerCustomer } from "@/lib/auth/actions";
import {
  allowsDevSignupWithoutEmail,
  isEmailConfigured,
} from "@/lib/auth/email";
import { signupCountries } from "@/lib/auth/countries";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const dbReady = isDatabaseConfigured();
  const emailReady = isEmailConfigured();
  const localDevBypass = allowsDevSignupWithoutEmail();
  const canRegister = dbReady && (emailReady || localDevBypass);

  return (
    <AuthPageShell
      eyebrow={dict.auth.eyebrow}
      title={dict.auth.signUpTitle}
      intro={dict.auth.signUpIntro}
      logoAlt={dict.a11y.logoAlt}
      notice={localDevBypass ? dict.auth.localDevSignupNotice : undefined}
    >
      {!dbReady ? (
        <p className="text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
          <span className="mt-2 block text-xs text-chocolate-soft/80">
            {dict.auth.needsDatabase}
          </span>
        </p>
      ) : !canRegister ? (
        <p className="text-center text-sm text-chocolate-soft">
          {dict.auth.emailSetupRequired}
        </p>
      ) : (
        <>
          <AuthForm
            action={registerCustomer}
            submitLabel={dict.auth.signUp}
            pendingLabel={dict.auth.pleaseWait}
            hiddenFields={{ locale: raw }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label={dict.auth.firstName}
                name="firstName"
                autoComplete="given-name"
              />
              <AuthField
                label={dict.auth.lastName}
                name="lastName"
                autoComplete="family-name"
              />
            </div>
            <AuthField
              label={dict.auth.email}
              name="email"
              type="email"
              autoComplete="email"
            />
            <AuthField
              label={dict.auth.phone}
              name="phone"
              type="tel"
              autoComplete="tel"
            />
            <AuthField
              label={dict.auth.password}
              name="password"
              type="password"
              autoComplete="new-password"
            />
            <AuthField
              label={dict.auth.addressLine1}
              name="addressLine1"
              autoComplete="address-line1"
            />
            <AuthField
              label={dict.auth.addressLine2}
              name="addressLine2"
              required={false}
              autoComplete="address-line2"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label={dict.auth.city}
                name="city"
                autoComplete="address-level2"
              />
              <AuthField
                label={dict.auth.region}
                name="region"
                autoComplete="address-level1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label={dict.auth.postalCode}
                name="postalCode"
                autoComplete="postal-code"
              />
              <AuthSelect
                label={dict.auth.country}
                name="country"
                autoComplete="country"
                placeholder={dict.auth.countryPlaceholder}
                options={signupCountries.map((country) => ({
                  value: country.code,
                  label: country.name,
                }))}
              />
            </div>
          </AuthForm>
          <p className="mt-6 text-center text-sm text-chocolate-soft">
            <Link
              href={hrefFor(raw, "/login")}
              className="text-pink-deep underline-offset-2 hover:underline"
            >
              {dict.auth.haveAccount}
            </Link>
          </p>
        </>
      )}
    </AuthPageShell>
  );
}
