import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthField, AuthForm, AuthSelect } from "@/components/auth-form";
import { PageHero } from "@/components/page-hero";
import { registerCustomer } from "@/lib/auth/actions";
import { signupCountries } from "@/lib/auth/countries";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);

  return (
    <main className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <PageHero
        eyebrow={dict.auth.eyebrow}
        title={dict.auth.signUpTitle}
        intro={dict.auth.signUpIntro}
      />
      {!isDatabaseConfigured() ? (
        <p className="mx-auto mt-8 max-w-md text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
          <span className="mt-2 block text-xs text-chocolate-soft/80">
            {dict.auth.needsDatabase}
          </span>
        </p>
      ) : (
        <div className="mt-10">
          <AuthForm
            action={registerCustomer}
            submitLabel={dict.auth.signUp}
            hiddenFields={{ locale: raw }}
          >
            <AuthField label={dict.auth.name} name="name" autoComplete="name" />
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
            <AuthField
              label={dict.auth.city}
              name="city"
              autoComplete="address-level2"
            />
            <AuthField
              label={dict.auth.region}
              name="region"
              required={false}
              autoComplete="address-level1"
            />
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
          </AuthForm>
          <p className="mt-6 text-center text-sm text-chocolate-soft">
            <Link href={hrefFor(raw, "/sign-in")} className="text-pink-deep">
              {dict.auth.haveAccount}
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
