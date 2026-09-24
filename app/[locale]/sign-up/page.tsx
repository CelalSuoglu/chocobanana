import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/page-hero";
import { registerCustomer } from "@/lib/auth/actions";
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
              label={dict.auth.password}
              name="password"
              type="password"
              autoComplete="new-password"
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
