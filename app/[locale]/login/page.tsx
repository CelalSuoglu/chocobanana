import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { loginCustomer } from "@/lib/auth/actions";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);

  return (
    <AuthPageShell
      eyebrow={dict.auth.eyebrow}
      title={dict.auth.signInTitle}
      intro={dict.auth.signInIntro}
      logoAlt={dict.a11y.logoAlt}
    >
      {!isDatabaseConfigured() ? (
        <p className="text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
          <span className="mt-2 block text-xs text-chocolate-soft/80">
            {dict.auth.needsDatabase}
          </span>
        </p>
      ) : (
        <>
          <AuthForm
            action={loginCustomer}
            submitLabel={dict.auth.signIn}
            pendingLabel={dict.auth.pleaseWait}
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
            <Link
              href={hrefFor(raw, "/forgot-password")}
              className="text-pink-deep underline-offset-2 hover:underline"
            >
              {dict.auth.forgotPassword}
            </Link>
            {" · "}
            <Link
              href={hrefFor(raw, "/register")}
              className="text-pink-deep underline-offset-2 hover:underline"
            >
              {dict.auth.createAccount}
            </Link>
          </p>
        </>
      )}
    </AuthPageShell>
  );
}
