import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { verifyEmailToken } from "@/lib/auth/actions";
import { isDatabaseConfigured } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const { token } = await searchParams;

  let status: "ok" | "bad" | "missing" | "offline" = "missing";
  let detail: string | undefined;
  if (!isDatabaseConfigured()) {
    status = "offline";
  } else if (token) {
    const result = await verifyEmailToken(token);
    status = result.ok ? "ok" : "bad";
    if (!result.ok) {
      detail = result.error;
    }
  }

  const message =
    status === "ok"
      ? dict.auth.verifySuccess
      : status === "bad"
        ? detail || dict.auth.verifyFailed
        : status === "offline"
          ? dict.auth.notConfigured
          : dict.auth.verifyMissing;

  return (
    <main className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <PageHero
        eyebrow={dict.auth.eyebrow}
        title={dict.auth.verifyTitle}
        intro={message}
      />
      {status === "bad" || status === "missing" ? (
        <p
          className="mx-auto mt-6 max-w-md rounded-2xl border border-pink-deep/40 bg-pink-soft/40 px-4 py-3 text-center text-sm text-pink-deep"
          role="alert"
        >
          {message}
        </p>
      ) : null}
      {status === "ok" ? (
        <p className="mt-8 text-center text-sm">
          <Link href={hrefFor(raw, "/login")} className="text-pink-deep">
            {dict.auth.signIn}
          </Link>
        </p>
      ) : null}
    </main>
  );
}
