import { notFound } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/page-hero";
import { requestPasswordReset } from "@/lib/auth/actions";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ForgotPasswordPage({
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
        title={dict.auth.forgotTitle}
        intro={dict.auth.forgotIntro}
      />
      {!isDatabaseConfigured() ? (
        <p className="mx-auto mt-8 max-w-md text-center text-sm text-chocolate-soft">
          {dict.auth.notConfigured}
        </p>
      ) : (
        <div className="mt-10">
          <AuthForm
            action={requestPasswordReset}
            submitLabel={dict.auth.sendReset}
            hiddenFields={{ locale: raw }}
          >
            <AuthField
              label={dict.auth.email}
              name="email"
              type="email"
              autoComplete="email"
            />
          </AuthForm>
        </div>
      )}
    </main>
  );
}
