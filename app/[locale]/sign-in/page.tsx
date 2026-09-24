import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/page-hero";
import { loginCustomer } from "@/lib/auth/actions";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { isDatabaseConfigured } from "@/lib/db";

export default async function SignInPage({
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
        title={dict.auth.signInTitle}
        intro={dict.auth.signInIntro}
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
            action={loginCustomer}
            submitLabel={dict.auth.signIn}
            hiddenFields={{ locale: raw }}
          >
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
              autoComplete="current-password"
            />
          </AuthForm>
          <p className="mt-6 text-center text-sm text-chocolate-soft">
            <Link href={hrefFor(raw, "/forgot-password")} className="text-pink-deep">
              {dict.auth.forgotPassword}
            </Link>
            {" · "}
            <Link href={hrefFor(raw, "/sign-up")} className="text-pink-deep">
              {dict.auth.createAccount}
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
