import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { resetPassword } from "@/lib/auth/actions";
import { passwordResetTokenIsValid } from "@/lib/auth/password-reset";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const { token = "" } = await searchParams;
  const tokenOk =
    isDatabaseConfigured() && (await passwordResetTokenIsValid(token));

  return (
    <AuthPageShell
      eyebrow={dict.auth.eyebrow}
      title={dict.auth.resetTitle}
      intro={tokenOk ? dict.auth.resetIntro : dict.auth.resetInvalid}
      logoAlt={dict.a11y.logoAlt}
    >
      {!isDatabaseConfigured() ? (
        <p className="text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
        </p>
      ) : !tokenOk ? (
        <p className="text-center text-sm text-chocolate-soft">
          <Link
            href={hrefFor(raw, "/forgot-password")}
            className="text-pink-deep underline-offset-2 hover:underline"
          >
            {dict.auth.resetRequestAgain}
          </Link>
        </p>
      ) : (
        <>
          <p className="mb-4 text-center text-sm text-chocolate-soft">
            {dict.auth.resetRules}
          </p>
          <AuthForm
            action={resetPassword}
            submitLabel={dict.auth.updatePassword}
            pendingLabel={dict.auth.pleaseWait}
            hiddenFields={{ token, locale: raw }}
            successHref={hrefFor(raw, "/login")}
          >
            <AuthField
              label={dict.auth.password}
              name="password"
              type="password"
              autoComplete="new-password"
            />
            <AuthField
              label={dict.auth.confirmPassword}
              name="confirm"
              type="password"
              autoComplete="new-password"
            />
          </AuthForm>
        </>
      )}
    </AuthPageShell>
  );
}
