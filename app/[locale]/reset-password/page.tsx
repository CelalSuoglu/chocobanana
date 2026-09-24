import { notFound } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/page-hero";
import { resetPassword } from "@/lib/auth/actions";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

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

  return (
    <main className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <PageHero
        eyebrow={dict.auth.eyebrow}
        title={dict.auth.resetTitle}
        intro={dict.auth.resetIntro}
      />
      {!isDatabaseConfigured() ? (
        <p className="mx-auto mt-8 max-w-md text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
        </p>
      ) : (
        <div className="mt-10">
          <AuthForm
            action={resetPassword}
            submitLabel={dict.auth.updatePassword}
            hiddenFields={{ token }}
          >
            <AuthField
              label={dict.auth.password}
              name="password"
              type="password"
              autoComplete="new-password"
            />
          </AuthForm>
        </div>
      )}
    </main>
  );
}
