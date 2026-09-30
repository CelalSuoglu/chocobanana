import { notFound } from "next/navigation";
import { AuthPageShell } from "@/components/auth-page-shell";
import { RegisterWizard } from "@/components/register-wizard";
import { signupCountries } from "@/lib/auth/countries";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const dbReady = isDatabaseConfigured();

  return (
    <AuthPageShell
      eyebrow={dict.auth.eyebrow}
      title={dict.auth.signUpTitle}
      intro={dict.auth.signUpIntro}
      logoAlt={dict.a11y.logoAlt}
    >
      {!dbReady ? (
        <p className="text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
          <span className="mt-2 block text-xs text-chocolate-soft/80">
            {dict.auth.needsDatabase}
          </span>
        </p>
      ) : (
        <RegisterWizard
          locale={raw}
          countries={signupCountries.map((country) => ({
            value: country.code,
            label: country.name,
          }))}
          labels={{
            step1Title: dict.auth.step1Title,
            step2Title: dict.auth.step2Title,
            nextStep: dict.auth.nextStep,
            backStep: dict.auth.backStep,
            firstName: dict.auth.firstName,
            lastName: dict.auth.lastName,
            email: dict.auth.email,
            password: dict.auth.password,
            phone: dict.auth.phone,
            addressLine1: dict.auth.addressLine1,
            addressLine2: dict.auth.addressLine2,
            city: dict.auth.city,
            region: dict.auth.region,
            postalCode: dict.auth.postalCode,
            country: dict.auth.country,
            countryPlaceholder: dict.auth.countryPlaceholder,
            signUp: dict.auth.signUp,
            pleaseWait: dict.auth.pleaseWait,
            haveAccount: dict.auth.haveAccount,
          }}
        />
      )}
    </AuthPageShell>
  );
}
