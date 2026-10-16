import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { requestPasswordReset } from "@/lib/auth/actions";
import { isEmailConfigured } from "@/lib/auth/email";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export default async function ForgotPasswordPage({
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
      title={dict.auth.forgotTitle}
      intro={dict.auth.forgotIntro}
      logoAlt={dict.a11y.logoAlt}
    >
      {!isDatabaseConfigured() ? (
        <p className="text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
        </p>
      ) : !isEmailConfigured() ? (
        <p className="text-center text-sm text-chocolate-soft">
          {dict.auth.emailSetupRequired}
        </p>
      ) : (
        <>
          <AuthForm
            action={requestPasswordReset}
            submitLabel={dict.auth.sendReset}
            pendingLabel={dict.auth.pleaseWait}
            hiddenFields={{ locale: raw }}
          >
            <AuthField
              label={dict.auth.email}
              name="email"
              type="email"
              autoComplete="email"
            />
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
